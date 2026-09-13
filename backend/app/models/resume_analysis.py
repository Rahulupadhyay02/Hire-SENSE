from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.id", ondelete="CASCADE"), index=True, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=True)
    raw_text = Column(Text, nullable=True)
    extracted_json = Column(JSON, nullable=False, default=dict)
    model_version = Column(String(100), nullable=False, default="hiresense-parser-v1.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    candidate = relationship("Candidate", back_populates="resume_analyses")

    def __repr__(self):
        return f"<ResumeAnalysis id={self.id} candidate_id={self.candidate_id} model={self.model_version}>"
