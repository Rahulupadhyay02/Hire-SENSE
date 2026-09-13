from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.database import get_db
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.schemas.job import JobCreate, JobUpdate, JobResponse
from app.schemas.application import ApplicationResponse
from app.utils.deps import get_current_user, require_recruiter

router = APIRouter(prefix="/jobs", tags=["Jobs"])

def _build_job_response(job: Job, db: Session) -> JobResponse:
    # Calculate stats
    total_apps = db.query(func.count(Application.id)).filter(Application.job_id == job.id).scalar() or 0
    shortlisted = db.query(func.count(Application.id)).filter(
        Application.job_id == job.id,
        Application.status == ApplicationStatus.SHORTLISTED
    ).scalar() or 0
    avg_score = db.query(func.avg(Application.match_score)).filter(
        Application.job_id == job.id,
        Application.match_score > 0
    ).scalar() or 0.0

    return JobResponse(
        id=job.id,
        recruiter_id=job.recruiter_id,
        title=job.title,
        description=job.description,
        experience=job.experience,
        required_skills=job.required_skills or [],
        preferred_skills=job.preferred_skills or [],
        status=job.status,
        created_at=job.created_at,
        updated_at=job.updated_at,
        applications_count=total_apps,
        shortlisted_count=shortlisted,
        avg_match_score=round(float(avg_score), 1)
    )

@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(
    job_in: JobCreate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Create a new job posting (Recruiter or Admin only)"""
    new_job = Job(
        recruiter_id=current_user.id,
        title=job_in.title.strip(),
        description=job_in.description.strip(),
        experience=job_in.experience.strip(),
        required_skills=job_in.required_skills,
        preferred_skills=job_in.preferred_skills or [],
        status=job_in.status
    )
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return _build_job_response(new_job, db)

@router.get("", response_model=List[JobResponse])
def list_jobs(
    status_filter: Optional[JobStatus] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List jobs with optional status filter and title search"""
    query = db.query(Job)
    if status_filter:
        query = query.filter(Job.status == status_filter)
    if search:
        query = query.filter(Job.title.ilike(f"%{search}%"))
    
    jobs = query.order_by(Job.created_at.desc()).all()
    return [_build_job_response(j, db) for j in jobs]

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db)):
    """Get single job posting details"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return _build_job_response(job, db)

@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    job_in: JobUpdate,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Update a job posting (Recruiter owner or Admin)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to edit this job")

    if job_in.title is not None:
        job.title = job_in.title.strip()
    if job_in.description is not None:
        job.description = job_in.description.strip()
    if job_in.experience is not None:
        job.experience = job_in.experience.strip()
    if job_in.required_skills is not None:
        job.required_skills = job_in.required_skills
    if job_in.preferred_skills is not None:
        job.preferred_skills = job_in.preferred_skills
    if job_in.status is not None:
        job.status = job_in.status

    db.commit()
    db.refresh(job)
    return _build_job_response(job, db)

@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Delete a job posting (Recruiter owner or Admin)"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
    if current_user.role != UserRole.ADMIN and job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this job")

    db.delete(job)
    db.commit()
    return None

@router.get("/{job_id}/applications", response_model=List[ApplicationResponse])
def get_job_applications(
    job_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Get all candidate applications for a specific job"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    apps = db.query(Application).filter(Application.job_id == job_id).order_by(Application.created_at.desc()).all()
    results = []
    for app in apps:
        cand = app.candidate
        u = cand.user if cand else None
        results.append(ApplicationResponse(
            id=app.id,
            job_id=app.job_id,
            candidate_id=app.candidate_id,
            status=app.status,
            match_score=app.match_score or 0.0,
            notes=app.notes,
            created_at=app.created_at,
            job_title=job.title,
            candidate_name=u.name if u else "Unknown Candidate",
            candidate_email=u.email if u else "",
            candidate_skills=cand.skills if cand else [],
            candidate_experience=cand.experience_years if cand else "1+ years",
            candidate_education=cand.education if cand else ""
        ))
    return results
