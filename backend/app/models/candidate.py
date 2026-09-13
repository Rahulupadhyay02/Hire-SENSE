from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    phone = Column(String(50), nullable=True)
    education = Column(String(200), nullable=True)
    experience_years = Column(String(50), nullable=True, default="1-2 years")
    skills = Column(JSON, nullable=False, default=list)  # ["Python", "FastAPI", "SQL"]
    profile_json = Column(JSON, nullable=True, default=dict)  # structured resume details & highlights
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="candidate_profile", uselist=False)
    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    resume_analyses = relationship("ResumeAnalysis", back_populates="candidate", cascade="all, delete-orphan", order_by="desc(ResumeAnalysis.created_at)")

    def __repr__(self):
        return f"<Candidate id={self.id} user_id={self.user_id}>"
