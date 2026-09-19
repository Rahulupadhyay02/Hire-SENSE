import enum
from sqlalchemy import Column, Integer, Text, DateTime, Enum, ForeignKey, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ApplicationStatus(str, enum.Enum):
    PENDING = "Pending"
    REVIEWING = "Reviewing"
    SHORTLISTED = "Shortlisted"
    HOLD = "Hold"
    REJECTED = "Rejected"

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING, nullable=False, index=True)
    match_score = Column(Float, nullable=True, default=0.0)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    job = relationship("Job", back_populates="applications")
    candidate = relationship("Candidate", back_populates="applications")
    match_score_detail = relationship("MatchScore", back_populates="application", uselist=False, cascade="all, delete-orphan")
    interviews = relationship("Interview", back_populates="application", cascade="all, delete-orphan", order_by="Interview.created_at.desc()")
    report     = relationship("Report", back_populates="application", uselist=False, cascade="all, delete-orphan")  # Phase 8
    feedbacks  = relationship("Feedback", back_populates="application", cascade="all, delete-orphan", order_by="Feedback.created_at.desc()")  # Phase 9


    def __repr__(self):
        return f"<Application id={self.id} job_id={self.job_id} candidate_id={self.candidate_id} status={self.status}>"
