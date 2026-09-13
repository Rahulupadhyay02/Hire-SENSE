from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.candidate import Candidate
from app.schemas.candidate import CandidateResponse
from app.utils.deps import require_recruiter

router = APIRouter(prefix="/candidates", tags=["Candidates"])

@router.get("", response_model=List[CandidateResponse])
def list_candidates(
    current_user = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """List all candidate profiles (Recruiter or Admin)"""
    candidates = db.query(Candidate).all()
    results = []
    for c in candidates:
        u = c.user
        results.append(CandidateResponse(
            id=c.id,
            user_id=c.user_id,
            name=u.name if u else "Candidate",
            email=u.email if u else "",
            phone=c.phone,
            education=c.education,
            experience_years=c.experience_years,
            skills=c.skills or [],
            profile_json=c.profile_json or {},
            created_at=c.created_at
        ))
    return results

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: int,
    current_user = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Get single candidate profile details (Recruiter or Admin)"""
    c = db.query(Candidate).filter(Candidate.id == candidate_id).first()
    if not c:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate not found")
        
    u = c.user
    return CandidateResponse(
        id=c.id,
        user_id=c.user_id,
        name=u.name if u else "Candidate",
        email=u.email if u else "",
        phone=c.phone,
        education=c.education,
        experience_years=c.experience_years,
        skills=c.skills or [],
        profile_json=c.profile_json or {},
        created_at=c.created_at
    )
