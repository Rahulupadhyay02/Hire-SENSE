from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.models.match_score import MatchScore
from app.models.resume_analysis import ResumeAnalysis
from app.models.interview import Interview, InterviewStatus
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from app.schemas.match import MatchScoreResponse, MatchScoreOverrideRequest
from app.schemas.interview import InterviewUploadResponse, ApplicationCommunicationSummaryResponse
from app.services.matcher import evaluate_job_candidate_match
from app.utils.deps import get_current_user, require_recruiter

router = APIRouter(prefix="/applications", tags=["Applications"])

def _format_application(app: Application) -> ApplicationResponse:
    job = app.job
    cand = app.candidate
    u = cand.user if cand else None
    return ApplicationResponse(
        id=app.id,
        job_id=app.job_id,
        candidate_id=app.candidate_id,
        status=app.status,
        match_score=app.match_score or 0.0,
        notes=app.notes,
        created_at=app.created_at,
        job_title=job.title if job else "N/A",
        candidate_name=u.name if u else "Candidate",
        candidate_email=u.email if u else "",
        candidate_skills=cand.skills if cand else [],
        candidate_experience=cand.experience_years if cand else "1+ years",
        candidate_education=cand.education if cand else ""
    )

@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    job_id: Optional[int] = None,
    status_filter: Optional[ApplicationStatus] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List applications: Candidates see their own; Recruiters see their jobs; Admins see all."""
    query = db.query(Application)
    
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand:
            return []
        query = query.filter(Application.candidate_id == cand.id)
    elif current_user.role == UserRole.RECRUITER:
        query = query.join(Job).filter(Job.recruiter_id == current_user.id)
    # Admin sees all
        
    if job_id:
        query = query.filter(Application.job_id == job_id)
    if status_filter:
        query = query.filter(Application.status == status_filter)
        
    apps = query.order_by(Application.created_at.desc()).all()
    return [_format_application(a) for a in apps]

@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single application details"""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    # Check permissions
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
            
    return _format_application(app)

@router.patch("/{app_id}/status", response_model=ApplicationResponse)
def update_application_status(
    app_id: int,
    update_in: ApplicationStatusUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Update candidate application hiring status (Recruiter or Admin)"""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    job = app.job
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update applications for this job")
        
    app.status = update_in.status
    if update_in.notes is not None:
        app.notes = update_in.notes
        
    db.commit()
    db.refresh(app)
    return _format_application(app)

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job(
    app_in: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Apply to a job (Candidate)"""
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job or job.status != JobStatus.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Job is not active or does not exist")
        
    # Get or create candidate record
    cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not cand:
        cand = Candidate(user_id=current_user.id, skills=[], experience_years="1-2 years")
        db.add(cand)
        db.commit()
        db.refresh(cand)
        
    # Check if already applied
    existing = db.query(Application).filter(
        Application.job_id == job.id,
        Application.candidate_id == cand.id
    ).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already applied to this job")
        
    new_app = Application(
        job_id=job.id,
        candidate_id=cand.id,
        status=ApplicationStatus.PENDING,
        match_score=0.0,
        notes=app_in.notes
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return _format_application(new_app)


def _format_match_score(ms: MatchScore) -> MatchScoreResponse:
    return MatchScoreResponse(
        id=ms.id,
        application_id=ms.application_id,
        overall_score=ms.overall_score,
        skills_score=ms.skills_score,
        experience_score=ms.experience_score,
        projects_score=ms.projects_score,
        coverage_score=ms.coverage_score,
        components=ms.components_json or {},
        explanation=ms.explanation,
        is_overridden=ms.is_overridden,
        override_reason=ms.override_reason,
        overridden_by=ms.overridden_by,
        created_at=ms.created_at,
        updated_at=ms.updated_at
    )


@router.post("/{app_id}/analyze", response_model=MatchScoreResponse)
def analyze_application_match(
    app_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Run or re-run Phase 5 Matching AI on a specific application.
    Computes Skills (45%), Experience (20%), Projects (20%), and Coverage (15%).
    Generates explainability matrix and persists match scores.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    job = app.job
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to analyze applications for this job")
        
    candidate = app.candidate
    latest_resume = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.candidate_id == candidate.id
    ).order_by(ResumeAnalysis.created_at.desc()).first()

    eval_result = evaluate_job_candidate_match(job, candidate, latest_resume)
    
    ms = db.query(MatchScore).filter(MatchScore.application_id == app.id).first()
    if not ms:
        ms = MatchScore(
            application_id=app.id,
            overall_score=eval_result["overall_score"],
            skills_score=eval_result["skills_score"],
            experience_score=eval_result["experience_score"],
            projects_score=eval_result["projects_score"],
            coverage_score=eval_result["coverage_score"],
            components_json=eval_result["components_json"],
            explanation=eval_result["explanation"],
            is_overridden=False
        )
        db.add(ms)
    else:
        ms.skills_score = eval_result["skills_score"]
        ms.experience_score = eval_result["experience_score"]
        ms.projects_score = eval_result["projects_score"]
        ms.coverage_score = eval_result["coverage_score"]
        ms.components_json = eval_result["components_json"]
        ms.explanation = eval_result["explanation"]
        # If recruiter previously set an override, we keep override score on application unless reset
        if not ms.is_overridden:
            ms.overall_score = eval_result["overall_score"]
            
    # Update application cached match score if not manually overridden
    if not ms.is_overridden:
        app.match_score = eval_result["overall_score"]
        
    db.commit()
    db.refresh(ms)
    db.refresh(app)
    return _format_match_score(ms)


@router.get("/{app_id}/match", response_model=MatchScoreResponse)
def get_application_match(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve Phase 5 Match Score and Explainability breakdown for an application.
    If not yet computed, automatically computes it.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    # Check permissions
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

    ms = db.query(MatchScore).filter(MatchScore.application_id == app.id).first()
    if not ms:
        # Compute on the fly if needed
        latest_resume = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.candidate_id == app.candidate_id
        ).order_by(ResumeAnalysis.created_at.desc()).first()
        
        eval_result = evaluate_job_candidate_match(app.job, app.candidate, latest_resume)
        ms = MatchScore(
            application_id=app.id,
            overall_score=eval_result["overall_score"],
            skills_score=eval_result["skills_score"],
            experience_score=eval_result["experience_score"],
            projects_score=eval_result["projects_score"],
            coverage_score=eval_result["coverage_score"],
            components_json=eval_result["components_json"],
            explanation=eval_result["explanation"],
            is_overridden=False
        )
        db.add(ms)
        app.match_score = eval_result["overall_score"]
        db.commit()
        db.refresh(ms)
        db.refresh(app)

    return _format_match_score(ms)


@router.post("/{app_id}/match/override", response_model=MatchScoreResponse)
def override_application_match_score(
    app_id: int,
    override_in: MatchScoreOverrideRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """
    Recruiter manual override of AI match score with required reason/justification.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
        
    job = app.job
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to override score for this job")

    ms = db.query(MatchScore).filter(MatchScore.application_id == app.id).first()
    if not ms:
        # Run base evaluation first so breakdown is populated
        latest_resume = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.candidate_id == app.candidate_id
        ).order_by(ResumeAnalysis.created_at.desc()).first()
        eval_result = evaluate_job_candidate_match(app.job, app.candidate, latest_resume)
        ms = MatchScore(
            application_id=app.id,
            overall_score=eval_result["overall_score"],
            skills_score=eval_result["skills_score"],
            experience_score=eval_result["experience_score"],
            projects_score=eval_result["projects_score"],
            coverage_score=eval_result["coverage_score"],
            components_json=eval_result["components_json"],
            explanation=eval_result["explanation"]
        )
        db.add(ms)

    ms.overall_score = round(override_in.override_score, 1)
    ms.is_overridden = True
    ms.override_reason = override_in.reason
    ms.overridden_by = current_user.id
    app.match_score = ms.overall_score
    
    db.commit()
    db.refresh(ms)
    db.refresh(app)
    return _format_match_score(ms)


@router.get("/{app_id}/interviews", response_model=List[InterviewUploadResponse])
def list_application_interviews(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all uploaded interviews for a specific application.
    Returns basic metadata (no transcript — use /interviews/{id}/transcript for that).
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Permission check
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

    interviews = db.query(Interview).filter(
        Interview.application_id == app_id
    ).order_by(Interview.created_at.desc()).all()

    return [
        InterviewUploadResponse(
            id=iv.id,
            application_id=iv.application_id,
            uploaded_by=iv.uploaded_by,
            original_filename=iv.original_filename,
            file_type=iv.file_type,
            file_size_bytes=iv.file_size_bytes,
            status=iv.status,
            communication_score=iv.communication_score,
            created_at=iv.created_at,
        )
        for iv in interviews
    ]


@router.get("/{app_id}/communication-summary", response_model=ApplicationCommunicationSummaryResponse)
def get_application_communication_summary(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get aggregated communication metrics across all interviews for an application.
    Includes latest metrics, overall average score, and trend data.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Permission check
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")

    interviews = db.query(Interview).filter(
        Interview.application_id == app_id,
        Interview.status == InterviewStatus.COMPLETED
    ).order_by(Interview.created_at.asc()).all()

    if not interviews:
        return ApplicationCommunicationSummaryResponse(
            application_id=app_id,
            total_interviews=0,
            latest_communication_score=None,
            average_communication_score=None,
            latest_metrics=None,
            trend=[]
        )

    # Calculate trends and averages
    scores = [iv.communication_score for iv in interviews if iv.communication_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    latest_iv = interviews[-1]
    trend = []
    for iv in interviews:
        m = iv.metrics_json or {}
        trend.append({
            "interview_id": iv.id,
            "filename": iv.original_filename,
            "date": iv.created_at.isoformat() if iv.created_at else "",
            "score": iv.communication_score or m.get("overall_score"),
            "wpm": m.get("wpm", 0),
            "filler_rate": m.get("filler_word_rate", 0.0),
            "structure": m.get("structure_score", 0),
            "clarity": m.get("clarity_score", 0),
            "relevance": m.get("relevance_score", 0),
        })

    return ApplicationCommunicationSummaryResponse(
        application_id=app_id,
        total_interviews=len(interviews),
        latest_communication_score=latest_iv.communication_score,
        average_communication_score=avg_score,
        latest_metrics=latest_iv.metrics_json,
        trend=trend
    )
