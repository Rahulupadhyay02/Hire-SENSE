"""
Phase 9 — Candidate Feedback Model
===================================
Tracks candidate feedback, multi-attempt improvement coaching, and viewed tracking.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id             = Column(Integer, primary_key=True, index=True)
    candidate_id   = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"),
                            nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"),
                            nullable=False, index=True)
    report_id      = Column(Integer, ForeignKey("reports.id", ondelete="CASCADE"),
                            nullable=True, index=True)
    interview_id   = Column(Integer, ForeignKey("interviews.id", ondelete="CASCADE"),
                            nullable=True, index=True)
    viewed_at      = Column(DateTime(timezone=True), nullable=True)
    feedback_json  = Column(JSON, nullable=False, default=dict)
    created_at     = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at     = Column(DateTime(timezone=True), server_default=func.now(),
                            onupdate=func.now(), nullable=False)

    # Relationships
    candidate   = relationship("Candidate", back_populates="feedbacks")
    application = relationship("Application", back_populates="feedbacks")
    report      = relationship("Report", backref="feedbacks")
    interview   = relationship("Interview", backref="feedbacks")

    def __repr__(self):
        return f"<Feedback id={self.id} candidate_id={self.candidate_id} app_id={self.application_id} viewed={self.viewed_at}>"
