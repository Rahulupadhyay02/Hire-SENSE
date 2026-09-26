from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class RecruiterProfileResponse(BaseModel):
    id: int
    user_id: int
    name: str
    email: str
    phone: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    timezone: Optional[str] = None
    linkedin_url: Optional[str] = None
    calendly_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    work_policy: Optional[str] = None
    hiring_preferences: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RecruiterProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    timezone: Optional[str] = None
    linkedin_url: Optional[str] = None
    calendly_url: Optional[str] = None
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    work_policy: Optional[str] = None
    hiring_preferences: Optional[Dict[str, Any]] = None
