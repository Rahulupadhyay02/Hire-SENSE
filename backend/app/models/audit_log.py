"""
Phase 8 — Audit Log Model
==========================
Immutable append-only log of recruiter actions (human decisions).
Every Shortlist / Hold / Reject decision is recorded here.

Fields
------
  user_id     — recruiter who acted
  action      — e.g. "decision_shortlisted", "decision_hold", "decision_rejected"
  object_type — always "application" for now; extensible
  object_id   — the application id
  metadata    — JSON snapshot: {decision, notes, previous_status, match_score}
  created_at  — immutable timestamp
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id          = Column(Integer, primary_key=True, index=True)
    user_id      = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"),
                          nullable=True, index=True)
    action       = Column(String, nullable=False, index=True)
    object_type  = Column(String, nullable=False)
    object_id    = Column(Integer, nullable=False, index=True)
    log_metadata = Column(JSON, nullable=True, default=dict)  # renamed: 'metadata' is reserved by SQLAlchemy
    created_at   = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    actor = relationship("User", foreign_keys=[user_id])

    def __repr__(self):
        return f"<AuditLog id={self.id} action={self.action} object_id={self.object_id}>"
