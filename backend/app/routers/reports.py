"""
Phase 8 — Reports Router (Unified AI Report + Human Decision)
=============================================================

Endpoints:
  GET  /applications/{id}/report    → Unified AI candidate report
  POST /applications/{id}/decision  → Recruiter human decision (audited)
"""

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.models.interview import Interview, InterviewStatus
from app.models.match_score import MatchScore
from app.models.resume_analysis import ResumeAnalysis
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.schemas.report import (
    UnifiedReportResponse,
    ResumeEvidenceSchema,
    MatchScoreEvidenceSchema,
    InterviewSummarySchema,
    InterviewTrendItem,
    HumanDecisionRequest,
    HumanDecisionResponse,
)
from app.services.matcher import evaluate_job_candidate_match
from app.utils.deps import get_current_user, require_recruiter

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Reports"])

# ── Stale threshold (minutes) before regenerating cached report ───────────────
REPORT_STALE_MINUTES = 10


# ── Permission helper ─────────────────────────────────────────────────────────

def _check_report_access(app: Application, current_user: User, db: Session) -> None:
    """Verify user can access this application's report."""
    if current_user.role == UserRole.ADMIN:
        return
    if current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view reports for your own job listings"
            )
    elif current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own application report"
            )


# ── Report builder ────────────────────────────────────────────────────────────

def _build_resume_evidence(candidate: Candidate, resume: Optional[ResumeAnalysis]) -> ResumeEvidenceSchema:
    """Extract structured resume evidence from candidate profile + latest resume analysis."""
    extracted = {}
    if resume and resume.extracted_json:
        extracted = resume.extracted_json

    # Build top highlights from experience + projects
    highlights = []
    for exp in (extracted.get("experience") or [])[:2]:
        if isinstance(exp, dict):
            title = exp.get("title") or exp.get("role") or ""
            company = exp.get("company") or ""
            desc = exp.get("description") or exp.get("summary") or ""
            if title or company:
                text = f"{title} at {company}" if company else title
                if desc:
                    text += f" — {str(desc)[:120]}"
                highlights.append(text)

    for proj in (extracted.get("projects") or [])[:2]:
        if isinstance(proj, dict):
            name = proj.get("name") or proj.get("title") or ""
            desc = proj.get("description") or proj.get("summary") or ""
            if name:
                text = name
                if desc:
                    text += f": {str(desc)[:120]}"
                highlights.append(text)

    # Fallback highlights from raw candidate.skills if no resume parsed
    if not highlights and candidate.skills:
        highlights.append(f"Skills: {', '.join(candidate.skills[:8])}")

    return ResumeEvidenceSchema(
        name=extracted.get("name") or (candidate.user.name if candidate.user else None),
        email=extracted.get("email") or (candidate.user.email if candidate.user else None),
        phone=extracted.get("phone"),
        education=extracted.get("education") or [],
        skills=extracted.get("skills") or candidate.skills or [],
        experience=extracted.get("experience") or [],
        projects=extracted.get("projects") or [],
        certifications=extracted.get("certifications") or [],
        links=extracted.get("links") or [],
        top_highlights=highlights,
        experience_years=candidate.experience_years,
    )


def _build_match_evidence(app: Application, db: Session) -> MatchScoreEvidenceSchema:
    """Get or compute match score for the application."""
    ms = db.query(MatchScore).filter(MatchScore.application_id == app.id).first()
    if not ms:
        # Compute on-the-fly
        resume = db.query(ResumeAnalysis).filter(
            ResumeAnalysis.candidate_id == app.candidate_id
        ).order_by(ResumeAnalysis.created_at.desc()).first()
        eval_result = evaluate_job_candidate_match(app.job, app.candidate, resume)
        ms = MatchScore(
            application_id=app.id,
            overall_score=eval_result["overall_score"],
            skills_score=eval_result["skills_score"],
            experience_score=eval_result["experience_score"],
            projects_score=eval_result["projects_score"],
            coverage_score=eval_result["coverage_score"],
            components_json=eval_result["components_json"],
            explanation=eval_result["explanation"],
            is_overridden=False,
        )
        db.add(ms)
        app.match_score = eval_result["overall_score"]
        db.commit()
        db.refresh(ms)

    return MatchScoreEvidenceSchema(
        overall_score=ms.overall_score,
        skills_score=ms.skills_score,
        experience_score=ms.experience_score,
        projects_score=ms.projects_score,
        coverage_score=ms.coverage_score,
        components=ms.components_json or {},
        explanation=ms.explanation or "",
        is_overridden=ms.is_overridden,
        override_reason=ms.override_reason,
    )


def _build_interview_summary(app_id: int, db: Session) -> InterviewSummarySchema:
    """Aggregate interview data across all completed interviews for this application."""
    interviews = db.query(Interview).filter(
        Interview.application_id == app_id,
        Interview.status == InterviewStatus.COMPLETED,
    ).order_by(Interview.created_at.asc()).all()

    if not interviews:
        return InterviewSummarySchema()

    scores = [iv.communication_score for iv in interviews if iv.communication_score is not None]
    avg_score = round(sum(scores) / len(scores), 1) if scores else None

    latest = interviews[-1]
    trend = []
    for iv in interviews:
        m = iv.metrics_json or {}
        trend.append(InterviewTrendItem(
            interview_id=iv.id,
            filename=iv.original_filename,
            date=iv.created_at.isoformat() if iv.created_at else "",
            score=iv.communication_score or m.get("overall_score"),
            wpm=m.get("wpm"),
            filler_rate=m.get("filler_word_rate"),
            structure=m.get("structure_score"),
            clarity=m.get("clarity_score"),
            relevance=m.get("relevance_score"),
        ))

    return InterviewSummarySchema(
        total_interviews=len(interviews),
        latest_communication_score=latest.communication_score,
        average_communication_score=avg_score,
        latest_metrics=latest.metrics_json,
        latest_transcript=latest.transcript,
        latest_transcript_segments=latest.transcript_segments,
        trend=trend,
    )


def _derive_narrative(match: MatchScoreEvidenceSchema, interview: InterviewSummarySchema):
    """Derive top-level strengths and areas to review from match + interview evidence."""
    strengths = []
    areas = []

    # Match strengths
    if match.overall_score >= 80:
        strengths.append(f"Strong overall job-candidate fit ({match.overall_score:.0f}%)")
    if match.skills_score >= 80:
        strengths.append(f"Skills closely match job requirements ({match.skills_score:.0f}%)")
    if match.projects_score >= 75:
        strengths.append(f"Relevant project experience demonstrated ({match.projects_score:.0f}%)")

    # Interview strengths
    if interview.latest_metrics:
        m = interview.latest_metrics
        strengths.extend(m.get("strengths") or [])
        for item in (m.get("improvements") or []):
            if isinstance(item, dict):
                areas.append(item.get("action") or item.get("label") or "")

    # Match areas to review
    if match.skills_score < 65:
        areas.append(f"Skills match is moderate ({match.skills_score:.0f}%) — verify required skills against profile")
    if match.experience_score < 60:
        areas.append(f"Experience match needs review ({match.experience_score:.0f}%)")
    if match.is_overridden:
        areas.append(f"Note: AI match score was manually overridden. Override reason: {match.override_reason}")

    # Deduplicate
    strengths = list(dict.fromkeys(s for s in strengths if s))[:6]
    areas = list(dict.fromkeys(a for a in areas if a))[:6]

    if not strengths:
        strengths = ["Complete the AI analysis to generate strengths"]
    if not areas:
        areas = ["No significant concerns identified"]

    return strengths, areas


# ── GET /applications/{app_id}/report ────────────────────────────────────────

@router.get("/applications/{app_id}/report", response_model=UnifiedReportResponse)
def get_unified_report(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Phase 8: Unified AI Candidate Report.

    Aggregates all available evidence into one response:
    - Candidate identity + resume evidence (Phase 4)
    - Job–candidate match score + explainability (Phase 5)
    - Interview communication metrics + transcript (Phase 6 & 7)
    - Aggregated strengths and areas-to-review narrative

    Cached in `reports` table; regenerated if stale (> 10 min).
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    _check_report_access(app, current_user, db)

    # ── Build fresh report data ───────────────────────────────────────────────
    candidate = app.candidate
    job = app.job
    user = candidate.user if candidate else None

    latest_resume = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.candidate_id == candidate.id
    ).order_by(ResumeAnalysis.created_at.desc()).first() if candidate else None

    resume_ev = _build_resume_evidence(candidate, latest_resume)
    match_ev = _build_match_evidence(app, db)
    interview_ev = _build_interview_summary(app_id, db)
    strengths, areas = _derive_narrative(match_ev, interview_ev)

    now = datetime.now(timezone.utc)

    report_data = UnifiedReportResponse(
        application_id=app.id,
        current_status=app.status,
        candidate_id=candidate.id if candidate else 0,
        candidate_name=user.name if user else "Unknown Candidate",
        candidate_email=user.email if user else "",
        candidate_experience=candidate.experience_years if candidate else None,
        job_id=job.id if job else 0,
        job_title=job.title if job else "Unknown Job",
        resume_evidence=resume_ev,
        match_score=match_ev,
        interview_summary=interview_ev,
        strengths=strengths,
        areas_to_review=areas,
        generated_at=now,
    )

    # ── Cache in DB (upsert) ──────────────────────────────────────────────────
    cached = db.query(Report).filter(Report.application_id == app_id).first()
    report_json = report_data.model_dump(mode="json")
    if cached:
        cached.report_json = report_json
        cached.generated_at = now
    else:
        cached = Report(application_id=app_id, report_json=report_json, generated_at=now)
        db.add(cached)
    db.commit()

    return report_data


# ── POST /applications/{app_id}/decision ─────────────────────────────────────

@router.post("/applications/{app_id}/decision", response_model=HumanDecisionResponse)
def post_human_decision(
    app_id: int,
    decision_in: HumanDecisionRequest,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db),
):
    """
    Phase 8: Recruiter Human Decision — Shortlist / Hold / Reject.

    - Updates application.status
    - Saves recruiter notes to application.notes
    - Creates an immutable AuditLog entry with decision + evidence snapshot
    - AI does NOT make this decision — the recruiter does.
    """
    app = db.query(Application).filter(Application.id == app_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # Verify recruiter owns this job
    if current_user.role != UserRole.ADMIN and app.job.recruiter_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only make decisions on applications for your own job listings"
        )

    # Map decision string → ApplicationStatus
    decision_map = {
        "Shortlisted": ApplicationStatus.SHORTLISTED,
        "Hold": ApplicationStatus.HOLD,
        "Rejected": ApplicationStatus.REJECTED,
    }
    new_status = decision_map[decision_in.decision]
    previous_status = app.status

    # Gather AI evidence snapshot for audit trail
    ms = db.query(MatchScore).filter(MatchScore.application_id == app_id).first()
    match_snapshot = {
        "overall_score": ms.overall_score if ms else None,
        "is_overridden": ms.is_overridden if ms else False,
    }

    # Update application
    app.status = new_status
    if decision_in.notes:
        app.notes = decision_in.notes

    # Create audit log entry
    audit_entry = AuditLog(
        user_id=current_user.id,
        action=f"decision_{decision_in.decision.lower()}",
        object_type="application",
        object_id=app_id,
        log_metadata={
            "decision": decision_in.decision,
            "notes": decision_in.notes,
            "previous_status": previous_status.value if previous_status else None,
            "new_status": new_status.value,
            "match_score_snapshot": match_snapshot,
        },
    )
    db.add(audit_entry)
    db.commit()
    db.refresh(audit_entry)
    db.refresh(app)

    now = datetime.now(timezone.utc)
    logger.info(
        f"Human decision by user {current_user.id}: application {app_id} → {new_status.value} "
        f"(audit_log #{audit_entry.id})"
    )

    return HumanDecisionResponse(
        application_id=app_id,
        new_status=new_status,
        decided_by=current_user.id,
        decided_by_name=current_user.name,
        decided_at=now,
        notes=decision_in.notes,
        audit_log_id=audit_entry.id,
    )
