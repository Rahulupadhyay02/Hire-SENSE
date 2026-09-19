"""
Phase 9 — Candidate Feedback Router
====================================
Provides endpoints for candidates to view structured 4-pillar coaching advice,
multi-attempt timeline progression, and tracks feedback viewed status.

Endpoints:
  GET  /api/v1/applications/{app_id}/feedback           → Structured coaching & attempt history
  POST /api/v1/applications/{app_id}/feedback/viewed    → Mark feedback as viewed
  GET  /api/v1/candidates/me/feedback-history           → Candidate multi-application practice timeline
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.application import Application
from app.models.feedback import Feedback
from app.models.interview import Interview, InterviewStatus
from app.schemas.feedback import (
    CandidateFeedbackResponse,
    FeedbackHistoryResponse,
    FeedbackHistoryItem,
)
from app.services import feedback_service
from app.utils.deps import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Candidate Feedback"])


def _check_access(app: Application, current_user: User, db: Session) -> None:
    """Ensure current user is authorized to view this application's feedback."""
    if current_user.role == UserRole.ADMIN:
        return
    if current_user.role == UserRole.RECRUITER:
        if app.job and app.job.recruiter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view feedback for candidates who applied to your jobs."
            )
    elif current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are only authorized to view your own interview feedback."
            )


@router.get("/applications/{app_id}/feedback", response_model=CandidateFeedbackResponse)
def get_candidate_feedback(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve structured 4-pillar feedback and attempt progression timeline for an application.
    If requested by the candidate, automatically records `viewed_at` in the feedbacks table.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application #{app_id} not found."
        )

    _check_access(app, current_user, db)

    # Generate feedback payload
    feedback_data = feedback_service.generate_candidate_feedback(app, db)

    # If requested by Candidate, record viewed_at
    if current_user.role == UserRole.CANDIDATE:
        now = datetime.now(timezone.utc)
        record = (
            db.query(Feedback)
            .filter(
                Feedback.application_id == app.id,
                Feedback.candidate_id == app.candidate_id,
            )
            .first()
        )
        if not record:
            record = Feedback(
                candidate_id=app.candidate_id,
                application_id=app.id,
                report_id=app.report.id if app.report else None,
                interview_id=feedback_data.latest_interview_id,
                viewed_at=now,
                feedback_json=feedback_data.model_dump(mode="json"),
            )
            db.add(record)
        else:
            record.viewed_at = now
            record.feedback_json = feedback_data.model_dump(mode="json")
            if feedback_data.latest_interview_id:
                record.interview_id = feedback_data.latest_interview_id
        try:
            db.commit()
            db.refresh(record)
            feedback_data.viewed_at = record.viewed_at
        except Exception as e:
            logger.warning(f"Failed to record feedback viewed_at: {e}")
            db.rollback()

    return feedback_data


@router.post("/applications/{app_id}/feedback/viewed")
def mark_feedback_viewed(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Explicitly mark candidate feedback as viewed."""
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    _check_access(app, current_user, db)

    now = datetime.now(timezone.utc)
    record = (
        db.query(Feedback)
        .filter(
            Feedback.application_id == app.id,
            Feedback.candidate_id == app.candidate_id,
        )
        .first()
    )
    if not record:
        record = Feedback(
            candidate_id=app.candidate_id,
            application_id=app.id,
            viewed_at=now,
        )
        db.add(record)
    else:
        record.viewed_at = now

    db.commit()
    db.refresh(record)

    return {
        "application_id": app_id,
        "viewed_at": record.viewed_at.isoformat() if record.viewed_at else None,
        "status": "viewed"
    }


@router.get("/candidates/me/feedback-history", response_model=FeedbackHistoryResponse)
def get_candidate_feedback_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve candidate's practice history across all submitted applications.
    Computes attempt counts, latest scores, and progression deltas.
    """
    if current_user.role != UserRole.CANDIDATE and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only candidates or administrators can access feedback history."
        )

    cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
    if not cand:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Candidate profile not found")

    apps = (
        db.query(Application)
        .filter(Application.candidate_id == cand.id)
        .order_by(Application.created_at.desc())
        .all()
    )

    history_items: list[FeedbackHistoryItem] = []

    for a in apps:
        completed_ivs = (
            db.query(Interview)
            .filter(
                Interview.application_id == a.id,
                Interview.status == InterviewStatus.COMPLETED,
            )
            .order_by(Interview.created_at.asc())
            .all()
        )

        total_attempts = len(completed_ivs)
        latest_score = 0.0
        first_score = None
        score_diff = None

        if total_attempts > 0:
            first_m = completed_ivs[0].metrics_json or {}
            first_score = float(first_m.get("overall_score", 0.0))

            latest_m = completed_ivs[-1].metrics_json or {}
            latest_score = float(latest_m.get("overall_score", 0.0))

            if total_attempts > 1 and first_score is not None:
                score_diff = round(latest_score - first_score, 1)

        # Check viewed status
        fb = db.query(Feedback).filter(Feedback.application_id == a.id).first()
        viewed_at = fb.viewed_at if fb else None

        history_items.append(
            FeedbackHistoryItem(
                application_id=a.id,
                job_id=a.job_id,
                job_title=a.job.title if a.job else "Unknown Role",
                current_status=a.status.value if hasattr(a.status, "value") else str(a.status),
                total_attempts=total_attempts,
                latest_score=latest_score,
                viewed_at=viewed_at,
                first_attempt_score=first_score,
                score_improvement=score_diff,
            )
        )

    return FeedbackHistoryResponse(
        candidate_id=cand.id,
        candidate_name=current_user.name,
        applications=history_items,
    )
