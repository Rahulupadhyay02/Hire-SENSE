import enum
from sqlalchemy import Column, Integer, Float, String, Text, Boolean, DateTime, ForeignKey, JSON, Enum as SAEnum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class InterviewStatus(str, enum.Enum):
    UPLOADED   = "uploaded"
    QUEUED     = "queued"
    PROCESSING = "processing"
    COMPLETED  = "completed"
    FAILED     = "failed"


class Interview(Base):
    __tablename__ = "interviews"

    id                   = Column(Integer, primary_key=True, index=True)
    application_id       = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    uploaded_by          = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # File metadata
    original_filename    = Column(String, nullable=False)
    stored_filename      = Column(String, nullable=False, unique=True)  # UUID-based safe name
    file_type            = Column(String, nullable=False)               # MIME type
    file_size_bytes      = Column(Integer, nullable=False)

    # Processing state machine
    status               = Column(SAEnum(InterviewStatus), nullable=False, default=InterviewStatus.UPLOADED)
    processing_error     = Column(Text, nullable=True)

    # Transcription output
    transcript           = Column(Text, nullable=True)
    transcript_segments  = Column(JSON, nullable=True)   # List[{start, end, text}]
    duration_seconds     = Column(Float, nullable=True)

    created_at           = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at           = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Phase 7: Communication Metrics
    metrics_json         = Column(JSON, nullable=True)   # Full metrics payload from metrics_service
    communication_score  = Column(Float, nullable=True, index=True)  # Overall 0-100 score (fast sort/filter)

    # Relationships
    application          = relationship("Application", back_populates="interviews")
    uploader             = relationship("User", foreign_keys=[uploaded_by])

    def __repr__(self):
        return f"<Interview id={self.id} app={self.application_id} status={self.status}>"
