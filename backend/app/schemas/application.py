from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.models.application import ApplicationStatus

class ApplicationCreate(BaseModel):
    job_id: int
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus
    notes: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    job_id: int
    candidate_id: int
    status: ApplicationStatus
    match_score: Optional[float] = 0.0
    notes: Optional[str] = None
    created_at: datetime
    
    # Flattened details for recruiter UI convenience
    job_title: Optional[str] = None
    candidate_name: Optional[str] = None
    candidate_email: Optional[str] = None
    candidate_skills: Optional[List[str]] = None
    candidate_experience: Optional[str] = None
    candidate_education: Optional[str] = None

    class Config:
        from_attributes = True
