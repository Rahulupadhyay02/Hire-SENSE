import enum
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class JobStatus(str, enum.Enum):
    ACTIVE = "active"
    DRAFT = "draft"
    CLOSED = "closed"

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False, index=True)
    description = Column(Text, nullable=False)
    experience = Column(String(50), nullable=False, default="1+ years")
    required_skills = Column(JSON, nullable=False, default=list)  # list of str e.g. ["Python", "FastAPI"]
    preferred_skills = Column(JSON, nullable=True, default=list)  # list of str e.g. ["Docker", "AWS"]
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE, nullable=False, index=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    recruiter = relationship("User", backref="posted_jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Job id={self.id} title={self.title} status={self.status}>"
