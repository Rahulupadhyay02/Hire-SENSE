from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Personal info
    phone = Column(String(50), nullable=True, default="+91 98112 34567")
    title = Column(String(120), nullable=True, default="Lead Technical Recruiter")
    department = Column(String(120), nullable=True, default="Engineering Talent")
    timezone = Column(String(50), nullable=True, default="Asia/Kolkata (IST)")
    linkedin_url = Column(String(255), nullable=True, default="https://linkedin.com/in/recruiter-priya")
    calendly_url = Column(String(255), nullable=True, default="https://calendly.com/priya-hiresense")
    
    # Company details
    company_name = Column(String(150), nullable=True, default="NeuralStack AI")
    company_website = Column(String(255), nullable=True, default="https://neuralstack.ai")
    company_size = Column(String(50), nullable=True, default="51-200 employees")
    industry = Column(String(100), nullable=True, default="AI & Machine Learning")
    address = Column(String(255), nullable=True, default="Level 7, Cyber Green Tower, DLF Cyber City, Gurugram, India")
    bio = Column(Text, nullable=True, default="Building the next generation of multimodal AI systems and scalable enterprise intelligence.")
    work_policy = Column(String(50), nullable=True, default="Hybrid (2-3 days)")
    
    # Hiring preferences & automation settings
    hiring_preferences = Column(JSON, nullable=False, default=lambda: {
        "auto_match_threshold": 75,
        "notify_on_new_applicant": True,
        "auto_generate_ai_reports": True,
        "default_interview_format": "Live Coding & System Design"
    })

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", backref="recruiter_profile", uselist=False)

    def __repr__(self):
        return f"<RecruiterProfile id={self.id} user_id={self.user_id} company={self.company_name}>"
