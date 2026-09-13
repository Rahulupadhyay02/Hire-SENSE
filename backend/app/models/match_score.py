from sqlalchemy import Column, Integer, Float, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class MatchScore(Base):
    __tablename__ = "match_scores"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Overall score (0 - 100)
    overall_score = Column(Float, nullable=False, default=0.0)
    
    # Sub-component scores
    skills_score = Column(Float, nullable=False, default=0.0)
    experience_score = Column(Float, nullable=False, default=0.0)
    projects_score = Column(Float, nullable=False, default=0.0)
    coverage_score = Column(Float, nullable=False, default=0.0)
    
    # Structured breakdown of matched, missing, unclear requirements, and evidence
    components_json = Column(JSON, nullable=False, default=dict)
    
    # AI textual explainability output
    explanation = Column(Text, nullable=False)
    
    # Recruiter override support
    is_overridden = Column(Boolean, nullable=False, default=False)
    override_reason = Column(Text, nullable=True)
    overridden_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="match_score_detail")
    overriding_user = relationship("User", foreign_keys=[overridden_by])

    def __repr__(self):
        return f"<MatchScore id={self.id} application_id={self.application_id} overall_score={self.overall_score}>"
