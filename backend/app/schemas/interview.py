from pydantic import BaseModel, Field
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.models.interview import InterviewStatus


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class InterviewUploadResponse(BaseModel):
    id: int
    application_id: int
    uploaded_by: Optional[int] = None
    original_filename: str
    file_type: str
    file_size_bytes: int
    status: InterviewStatus
    communication_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class InterviewStatusResponse(BaseModel):
    id: int
    application_id: int
    uploaded_by: Optional[int] = None
    original_filename: str
    stored_filename: str
    file_type: str
    file_size_bytes: int
    status: InterviewStatus
    processing_error: Optional[str] = None
    transcript: Optional[str] = None
    transcript_segments: Optional[List[TranscriptSegment]] = None
    duration_seconds: Optional[float] = None
    communication_score: Optional[float] = None
    metrics_json: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ImprovementItem(BaseModel):
    label: str
    current: str
    target: str
    action: str
    icon: Optional[str] = "💡"
    priority: Optional[str] = "medium"


class RadarItem(BaseModel):
    area: str
    value: float


class ProgressSnapshot(BaseModel):
    score: float
    filler_rate: float
    wpm: int
    structure: float


class InterviewMetricsResponse(BaseModel):
    interview_id: int
    application_id: int
    communication_score: Optional[float] = None
    status: InterviewStatus
    wpm: int = 0
    filler_word_rate: float = 0.0
    filler_count: int = 0
    filler_words_found: List[str] = []
    structure_score: int = 0
    clarity_score: int = 0
    relevance_score: int = 0
    pace_score: int = 0
    filler_score: float = 0.0
    overall_score: float = 0.0
    word_count: int = 0
    sentence_count: int = 0
    unique_word_ratio: float = 0.0
    avg_sentence_length: float = 0.0
    strengths: List[str] = []
    improvements: List[ImprovementItem] = []
    radar: List[RadarItem] = []
    progress_snapshot: Optional[ProgressSnapshot] = None

    class Config:
        from_attributes = True


class ApplicationCommunicationSummaryResponse(BaseModel):
    application_id: int
    total_interviews: int
    latest_communication_score: Optional[float] = None
    average_communication_score: Optional[float] = None
    latest_metrics: Optional[Dict[str, Any]] = None
    trend: List[Dict[str, Any]] = []

    class Config:
        from_attributes = True
