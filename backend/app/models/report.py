"""
Phase 8 — Unified AI Report Model
===================================
Caches the aggregated report for an application (resume + match + interview).
One report per application; regenerated on demand after stale threshold.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class Report(Base):
    __tablename__ = "reports"

    id             = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"),
                            unique=True, nullable=False, index=True)
    report_json    = Column(JSON, nullable=False, default=dict)
    generated_at   = Column(DateTime(timezone=True), server_default=func.now(),
                            onupdate=func.now(), nullable=False)

    # Relationships
    application = relationship("Application", back_populates="report")

    def __repr__(self):
        return f"<Report id={self.id} application_id={self.application_id}>"
