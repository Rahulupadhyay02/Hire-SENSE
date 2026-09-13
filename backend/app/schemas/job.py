from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from app.models.job import JobStatus

class JobBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10)
    experience: str = Field(default="1+ years", max_length=50)
    required_skills: List[str] = Field(default_factory=list)
    preferred_skills: Optional[List[str]] = Field(default_factory=list)
    status: JobStatus = JobStatus.ACTIVE

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=150)
    description: Optional[str] = Field(None, min_length=10)
    experience: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    status: Optional[JobStatus] = None

class JobResponse(JobBase):
    id: int
    recruiter_id: int
    created_at: datetime
    updated_at: datetime
    applications_count: int = 0
    shortlisted_count: int = 0
    avg_match_score: float = 0.0

    class Config:
        from_attributes = True
