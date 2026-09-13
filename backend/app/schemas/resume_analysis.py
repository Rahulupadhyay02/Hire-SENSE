from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class EducationItem(BaseModel):
    institution: Optional[str] = None
    degree: Optional[str] = None
    field_of_study: Optional[str] = None
    start_year: Optional[str] = None
    end_year: Optional[str] = None

class ExperienceItem(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    highlights: List[str] = Field(default_factory=list)

class ProjectItem(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    link: Optional[str] = None

class LinkItem(BaseModel):
    name: str
    url: str

class ResumeExtractedData(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    summary: Optional[str] = None
    education: List[EducationItem] = Field(default_factory=list)
    skills: List[str] = Field(default_factory=list)
    experience: List[ExperienceItem] = Field(default_factory=list)
    projects: List[ProjectItem] = Field(default_factory=list)
    certifications: List[str] = Field(default_factory=list)
    links: List[LinkItem] = Field(default_factory=list)

class ResumeAnalysisResponse(BaseModel):
    id: int
    candidate_id: int
    file_name: str
    file_size: Optional[int] = None
    extracted_json: Dict[str, Any]
    model_version: str
    created_at: datetime

    class Config:
        from_attributes = True

class CandidateProfileUpdate(BaseModel):
    phone: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[str] = None
    skills: Optional[List[str]] = None
    profile_json: Optional[Dict[str, Any]] = None
