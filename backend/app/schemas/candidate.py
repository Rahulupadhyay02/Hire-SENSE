from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class CandidateBase(BaseModel):
    phone: Optional[str] = None
    education: Optional[str] = None
    experience_years: Optional[str] = "1-2 years"
    skills: List[str] = Field(default_factory=list)
    profile_json: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CandidateCreate(CandidateBase):
    pass

class CandidateResponse(CandidateBase):
    id: int
    user_id: int
    name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True
