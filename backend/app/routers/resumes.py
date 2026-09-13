import os
import time
import re
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database import get_db
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.resume_analysis import ResumeAnalysis
from app.schemas.resume_analysis import (
    ResumeAnalysisResponse,
    CandidateProfileUpdate
)
from app.schemas.candidate import CandidateResponse
from app.services.resume_parser import parse_resume
from app.utils.deps import get_current_user

router = APIRouter(prefix="/candidates", tags=["Resume AI & Candidates"])

# Upload directory configured relative to backend root
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/resume", response_model=ResumeAnalysisResponse, status_code=status.HTTP_201_CREATED)
async def upload_and_analyze_resume(
    file: UploadFile = File(...),
    target_candidate_id: Optional[int] = Query(None, description="Optional target candidate ID (Recruiter/Admin only)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload a candidate PDF resume, extract text, run structured parsing,
    normalize skills, and save structured profile with evidence traceability.
    """
    # 1. Resolve candidate
    if current_user.role == UserRole.CANDIDATE:
        candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not candidate:
            # Create candidate profile automatically if user doesn't have one
            candidate = Candidate(user_id=current_user.id, skills=[], profile_json={})
            db.add(candidate)
            db.commit()
            db.refresh(candidate)
    elif current_user.role in [UserRole.RECRUITER, UserRole.ADMIN]:
        if not target_candidate_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_candidate_id query parameter is required when uploading as Recruiter or Admin"
            )
        candidate = db.query(Candidate).filter(Candidate.id == target_candidate_id).first()
        if not candidate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # 2. Validate file type
    filename = file.filename or "resume.pdf"
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a valid PDF document (.pdf)."
        )

    # 3. Read and check file size
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE // (1024*1024)}MB."
        )

    # 4. Extract and parse resume content
    try:
        extracted_data, raw_text = parse_resume(file_bytes)
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err)
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Resume parsing encountered an error: {str(err)}"
        )

    # 5. Save original PDF securely to disk
    sanitized_filename = re.sub(r"[^a-zA-Z0-9_.-]", "_", filename)
    timestamp = int(time.time())
    stored_filename = f"candidate_{candidate.id}_{timestamp}_{sanitized_filename}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # 6. Save ResumeAnalysis DB record
    analysis = ResumeAnalysis(
        candidate_id=candidate.id,
        file_name=filename,
        file_path=file_path,
        file_size=len(file_bytes),
        raw_text=raw_text,
        extracted_json=extracted_data.model_dump(),
        model_version="hiresense-parser-v1.0"
    )
    db.add(analysis)

    # 7. Update Candidate profile fields with extracted data
    if extracted_data.skills:
        candidate.skills = extracted_data.skills
    if extracted_data.education:
        first_edu = extracted_data.education[0]
        deg = first_edu.degree or ""
        inst = first_edu.institution or ""
        candidate.education = f"{deg} - {inst}".strip(" -")
    if extracted_data.phone:
        candidate.phone = extracted_data.phone
    
    # Estimate experience years if available
    exp_count = len(extracted_data.experience)
    if exp_count >= 3:
        candidate.experience_years = "3-5 years"
    elif exp_count >= 1:
        candidate.experience_years = "1-2 years"
    else:
        candidate.experience_years = "Fresher (< 1 year)"

    candidate.profile_json = extracted_data.model_dump()

    db.commit()
    db.refresh(analysis)
    db.refresh(candidate)

    return ResumeAnalysisResponse(
        id=analysis.id,
        candidate_id=analysis.candidate_id,
        file_name=analysis.file_name,
        file_size=analysis.file_size,
        extracted_json=analysis.extracted_json,
        model_version=analysis.model_version,
        created_at=analysis.created_at
    )

@router.get("/me/resume", response_model=ResumeAnalysisResponse)
def get_my_resume_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the latest resume analysis for the logged-in candidate."""
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only candidates can access /me/resume")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.candidate_id == candidate.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume analysis found. Please upload your resume PDF first."
        )

    return ResumeAnalysisResponse(
        id=analysis.id,
        candidate_id=analysis.candidate_id,
        file_name=analysis.file_name,
        file_size=analysis.file_size,
        extracted_json=analysis.extracted_json,
        model_version=analysis.model_version,
        created_at=analysis.created_at
    )

@router.get("/{candidate_id}/resume", response_model=ResumeAnalysisResponse)
def get_candidate_resume_analysis(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get latest structured resume analysis for candidate (Recruiter, Admin, or the Candidate themselves)"""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    # Authorization check
    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot access another candidate's resume")

    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.candidate_id == candidate_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No resume analysis found for this candidate."
        )

    return ResumeAnalysisResponse(
        id=analysis.id,
        candidate_id=analysis.candidate_id,
        file_name=analysis.file_name,
        file_size=analysis.file_size,
        extracted_json=analysis.extracted_json,
        model_version=analysis.model_version,
        created_at=analysis.created_at
    )

@router.get("/{candidate_id}/resume/download")
def download_candidate_resume(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original uploaded PDF resume as evidence verification."""
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot download another candidate's resume")

    analysis = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.candidate_id == candidate_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    if not analysis or not os.path.exists(analysis.file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume PDF file not found on server")

    return FileResponse(
        path=analysis.file_path,
        filename=analysis.file_name,
        media_type="application/pdf"
    )

@router.put("/{candidate_id}/profile", response_model=CandidateResponse)
def update_candidate_profile(
    candidate_id: int,
    data: CandidateProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Responsible AI: Candidate-in-the-loop endpoint.
    Allows candidate to correct or enrich extracted skills, education, or profile fields.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    # Only candidate owner or admin can update
    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot edit another candidate's profile")

    if data.phone is not None:
        candidate.phone = data.phone
    if data.education is not None:
        candidate.education = data.education
    if data.experience_years is not None:
        candidate.experience_years = data.experience_years
    if data.skills is not None:
        candidate.skills = data.skills
    if data.profile_json is not None:
        candidate.profile_json = data.profile_json

    db.commit()
    db.refresh(candidate)

    u = candidate.user
    return CandidateResponse(
        id=candidate.id,
        user_id=candidate.user_id,
        name=u.name if u else "Candidate",
        email=u.email if u else "",
        phone=candidate.phone,
        education=candidate.education,
        experience_years=candidate.experience_years,
        skills=candidate.skills or [],
        profile_json=candidate.profile_json or {},
        created_at=candidate.created_at
    )

@router.put("/resume", response_model=ResumeAnalysisResponse)
async def update_my_resume(
    file: UploadFile = File(...),
    target_candidate_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-upload / replace candidate resume PDF."""
    return await upload_and_analyze_resume(file, target_candidate_id, current_user, db)

@router.delete("/resume", status_code=status.HTTP_200_OK)
def delete_my_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete the logged-in candidate's uploaded resume and extracted data.
    Removes the physical PDF file from disk and clears candidate profile fields.
    """
    if current_user.role != UserRole.CANDIDATE:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only candidates can delete via /candidates/resume")

    candidate = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    return _delete_candidate_resume(candidate, db)

@router.delete("/{candidate_id}/resume", status_code=status.HTTP_200_OK)
def delete_candidate_resume(
    candidate_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete resume and analysis for a candidate (Candidate owner or Admin).
    Removes the physical PDF file from disk and clears candidate profile fields.
    """
    candidate = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")

    if current_user.role == UserRole.CANDIDATE and candidate.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another candidate's resume")

    return _delete_candidate_resume(candidate, db)

def _delete_candidate_resume(candidate: Candidate, db: Session):
    analyses = db.query(ResumeAnalysis).filter(ResumeAnalysis.candidate_id == candidate.id).all()
    for a in analyses:
        if a.file_path and os.path.exists(a.file_path):
            try:
                os.remove(a.file_path)
            except Exception:
                pass
        db.delete(a)

    # Clear candidate profile extracted fields
    candidate.skills = []
    candidate.profile_json = {}
    candidate.phone = None
    candidate.education = None
    candidate.experience_years = "Fresher (< 1 year)"

    db.commit()
    db.refresh(candidate)

    return {
        "status": "ok",
        "message": "Resume and extracted profile deleted successfully."
    }
