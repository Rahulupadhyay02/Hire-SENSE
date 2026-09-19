"""
Phase 8 — Report & Human Decision Schemas
==========================================
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from app.models.application import ApplicationStatus


# ── Resume Evidence ────────────────────────────────────────────────────────────

class ResumeEvidenceSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: Optional[List[Dict[str, Any]]] = []
    skills: Optional[List[str]] = []
    experience: Optional[List[Dict[str, Any]]] = []
    projects: Optional[List[Dict[str, Any]]] = []
    certifications: Optional[List[Any]] = []
    links: Optional[List[Any]] = []
    # Convenience flat fields computed from above
    top_highlights: List[str] = []
    experience_years: Optional[str] = None


# ── Match Score Evidence ───────────────────────────────────────────────────────

class MatchScoreEvidenceSchema(BaseModel):
    overall_score: float = 0.0
    skills_score: float = 0.0
    experience_score: float = 0.0
    projects_score: float = 0.0
    coverage_score: float = 0.0
    components: Dict[str, Any] = {}
    explanation: str = ""
    is_overridden: bool = False
    override_reason: Optional[str] = None


# ── Interview Evidence ─────────────────────────────────────────────────────────

class InterviewTrendItem(BaseModel):
    interview_id: int
    filename: str
    date: str
    score: Optional[float] = None
    wpm: Optional[int] = None
    filler_rate: Optional[float] = None
    structure: Optional[float] = None
    clarity: Optional[float] = None
    relevance: Optional[float] = None


class InterviewSummarySchema(BaseModel):
    total_interviews: int = 0
    latest_communication_score: Optional[float] = None
    average_communication_score: Optional[float] = None
    latest_metrics: Optional[Dict[str, Any]] = None
    latest_transcript: Optional[str] = None
    latest_transcript_segments: Optional[List[Dict[str, Any]]] = None
    trend: List[InterviewTrendItem] = []


# ── Unified Report ─────────────────────────────────────────────────────────────

class UnifiedReportResponse(BaseModel):
    application_id: int
    current_status: ApplicationStatus

    # Candidate identity
    candidate_id: int
    candidate_name: str
    candidate_email: str
    candidate_experience: Optional[str] = None

    # Job
    job_id: int
    job_title: str

    # Evidence sections
    resume_evidence: ResumeEvidenceSchema
    match_score: MatchScoreEvidenceSchema
    interview_summary: InterviewSummarySchema

    # Aggregated narrative (derived from match + interview AI)
    strengths: List[str] = []
    areas_to_review: List[str] = []

    # Report metadata
    generated_at: datetime

    class Config:
        from_attributes = True


# ── Human Decision ─────────────────────────────────────────────────────────────

class HumanDecisionRequest(BaseModel):
    decision: Literal["Shortlisted", "Hold", "Rejected"] = Field(
        ...,
        description="Recruiter's final human decision. Must be one of: Shortlisted, Hold, Rejected."
    )
    notes: Optional[str] = Field(None, description="Optional recruiter notes explaining the decision")


class HumanDecisionResponse(BaseModel):
    application_id: int
    new_status: ApplicationStatus
    decided_by: int
    decided_by_name: str
    decided_at: datetime
    notes: Optional[str] = None
    audit_log_id: int

    class Config:
        from_attributes = True
