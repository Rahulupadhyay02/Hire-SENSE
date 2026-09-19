"""
Phase 9 — Candidate Feedback Schemas
=====================================
Pydantic schemas for the 4-pillar structured coaching feedback,
multi-attempt timeline progression, and candidate feedback responses.
"""

from __future__ import annotations
from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class FeedbackPillar(BaseModel):
    """
    Core 4-part structured coaching advice for a specific communication dimension:
    What went well → What can improve → Why it matters → What to do next
    """
    area: str = Field(..., description="Communication dimension, e.g. 'Speaking Pace', 'Filler Word Control'")
    what_went_well: str = Field(..., description="Observable evidence-based strength")
    what_can_improve: str = Field(..., description="Specific observable communication gap to refine")
    why_it_matters: str = Field(..., description="Professional rationale & recruiter context")
    what_to_do_next: str = Field(..., description="Concrete actionable practice drill or template")
    current_metric: Optional[str] = Field(None, description="Observed metric, e.g. '4.2%' or '148 WPM'")
    target_metric: Optional[str] = Field(None, description="Target benchmark, e.g. '< 3.0%' or '120–160 WPM'")
    priority: str = Field("medium", description="Coaching urgency: 'high', 'medium', 'low'")
    icon: str = Field("💡", description="Visual indicator emoji")


class AttemptProgressionItem(BaseModel):
    """Snapshot of metrics for an individual interview practice attempt."""
    attempt_number: int
    interview_id: int
    created_at: datetime
    duration_seconds: Optional[float] = None
    overall_score: float
    wpm: int
    filler_rate: float
    structure_score: float
    relevance_score: float
    clarity_score: float
    delta_score: Optional[float] = None       # e.g. +14.0
    delta_filler: Optional[float] = None      # e.g. -2.5
    key_improvement: Optional[str] = None     # e.g. "Filler rate reduced by 2.5%"


class CandidateFeedbackResponse(BaseModel):
    """Complete candidate feedback response for an application."""
    application_id: int
    job_id: int
    job_title: str
    candidate_id: int
    candidate_name: str
    current_status: str
    viewed_at: Optional[datetime] = None
    total_attempts: int
    latest_score: float
    latest_interview_id: Optional[int] = None
    pillars: List[FeedbackPillar] = Field(default_factory=list)
    timeline: List[AttemptProgressionItem] = Field(default_factory=list)
    radar: List[Dict[str, Any]] = Field(default_factory=list)
    strengths_summary: List[str] = Field(default_factory=list)
    ethical_ai_notice: str
    generated_at: datetime


class FeedbackHistoryItem(BaseModel):
    """Summary of candidate application and practice attempts."""
    application_id: int
    job_id: int
    job_title: str
    current_status: str
    total_attempts: int
    latest_score: float
    viewed_at: Optional[datetime] = None
    first_attempt_score: Optional[float] = None
    score_improvement: Optional[float] = None


class FeedbackHistoryResponse(BaseModel):
    candidate_id: int
    candidate_name: str
    applications: List[FeedbackHistoryItem] = Field(default_factory=list)
