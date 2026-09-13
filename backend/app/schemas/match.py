from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class SkillMatchItem(BaseModel):
    skill: str
    category: str = "required"  # "required" | "preferred"
    status: str  # "matched" | "missing" | "unclear"
    evidence: Optional[str] = None  # excerpt or mention from candidate profile/resume

class ExperienceMatchDetail(BaseModel):
    required_years_str: str
    candidate_years_str: str
    candidate_years_num: float
    required_years_num: float
    score: float
    explanation: str

class ProjectsMatchDetail(BaseModel):
    relevant_projects_count: int
    matched_keywords: List[str] = []
    score: float
    highlights: List[str] = []

class CoverageMatchDetail(BaseModel):
    required_skills_count: int
    required_skills_matched: int
    preferred_skills_count: int
    preferred_skills_matched: int
    score: float

class MatchComponents(BaseModel):
    weights: Dict[str, float] = {
        "skills": 0.45,
        "experience": 0.20,
        "projects": 0.20,
        "coverage": 0.15
    }
    skills: List[SkillMatchItem] = []
    experience: ExperienceMatchDetail
    projects: ProjectsMatchDetail
    coverage: CoverageMatchDetail
    sensitive_attributes_excluded: List[str] = [
        "name", "gender", "photo", "age", "phone", "email", "nationality", "address"
    ]

class MatchScoreResponse(BaseModel):
    id: int
    application_id: int
    overall_score: float
    skills_score: float
    experience_score: float
    projects_score: float
    coverage_score: float
    components: Dict[str, Any]
    explanation: str
    is_overridden: bool = False
    override_reason: Optional[str] = None
    overridden_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MatchScoreOverrideRequest(BaseModel):
    override_score: float = Field(..., ge=0.0, le=100.0, description="Override score between 0 and 100")
    reason: str = Field(..., min_length=5, description="Documented justification for manual score override")
