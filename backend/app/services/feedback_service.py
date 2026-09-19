"""
Phase 9 — Candidate Feedback Engine
====================================
Generates structured 4-pillar coaching advice and multi-attempt progression tracking:
  What went well → What can improve → Why it matters → What to do next

Guaranteed Responsible AI Principles:
- Strictly behavioral and evidence-based (speaking pace, filler rate, STAR signals, tech terms).
- ZERO psychological or personality labeling (no subjective traits like "nervous", "shy", "unconfident").
- Designed for constructive candidate self-improvement across iterative practice attempts.
"""

from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.interview import Interview, InterviewStatus
from app.services import metrics_service
from app.schemas.feedback import (
    FeedbackPillar,
    AttemptProgressionItem,
    CandidateFeedbackResponse,
)

logger = logging.getLogger(__name__)

RESPONSIBLE_AI_NOTICE = (
    "All feedback in HireSense is derived strictly from observable speech metrics "
    "(speaking rate, filler word count, answer structure heuristics, and job keyword coverage). "
    "HireSense strictly excludes psychological assumptions, personality profiling, and demographic attributes. "
    "Use these insights for deliberate skill development and iterative practice."
)


def generate_candidate_feedback(app: Application, db: Session) -> CandidateFeedbackResponse:
    """
    Generate the complete 4-pillar candidate feedback and attempt progression timeline
    for a specific application.
    """
    candidate_name = (
        app.candidate.user.name
        if app.candidate and app.candidate.user
        else "Candidate"
    )
    job_title = app.job.title if app.job else "Target Role"
    job_skills = app.job.required_skills if app.job and app.job.required_skills else []

    # ── 1. Fetch completed interviews ordered chronologically ──────────────────
    interviews = (
        db.query(Interview)
        .filter(
            Interview.application_id == app.id,
            Interview.status == InterviewStatus.COMPLETED,
        )
        .order_by(Interview.created_at.asc())
        .all()
    )

    timeline: List[AttemptProgressionItem] = []
    latest_metrics: Optional[Dict[str, Any]] = None
    prev_score: Optional[float] = None
    prev_filler: Optional[float] = None

    for idx, iv in enumerate(interviews, start=1):
        m = iv.metrics_json or {}
        if not m and iv.transcript:
            # Recompute on the fly if not cached
            m = metrics_service.compute_metrics(
                transcript=iv.transcript,
                segments=iv.transcript_segments or [],
                duration_seconds=iv.duration_seconds,
                job_skills=job_skills,
            )

        score = float(m.get("overall_score", 0.0))
        wpm = int(m.get("wpm", 0))
        filler_rate = float(m.get("filler_word_rate", 0.0))
        structure = float(m.get("structure_score", 0.0))
        relevance = float(m.get("relevance_score", 0.0))
        clarity = float(m.get("clarity_score", 0.0))

        delta_score = None
        delta_filler = None
        key_imp = None

        if prev_score is not None:
            delta_score = round(score - prev_score, 1)
            delta_filler = round(filler_rate - prev_filler, 1)

            if delta_score > 0 and delta_filler < 0:
                key_imp = f"Overall score +{delta_score}% & filler rate dropped by {abs(delta_filler)}%"
            elif delta_score > 0:
                key_imp = f"Overall score improved by +{delta_score}%"
            elif delta_filler < 0:
                key_imp = f"Filler word frequency reduced by {abs(delta_filler)}%"
            elif wpm >= 120 and wpm <= 160:
                key_imp = f"Pacing stabilized in optimal range ({wpm} WPM)"
            else:
                key_imp = "Iterative practice attempt recorded"
        else:
            key_imp = "Baseline interview assessment"

        prev_score = score
        prev_filler = filler_rate
        latest_metrics = m

        timeline.append(
            AttemptProgressionItem(
                attempt_number=idx,
                interview_id=iv.id,
                created_at=iv.created_at,
                duration_seconds=iv.duration_seconds,
                overall_score=score,
                wpm=wpm,
                filler_rate=filler_rate,
                structure_score=structure,
                relevance_score=relevance,
                clarity_score=clarity,
                delta_score=delta_score,
                delta_filler=delta_filler,
                key_improvement=key_imp,
            )
        )

    # ── 2. Fallback / Default if no interviews completed yet ──────────────────
    if not latest_metrics:
        latest_metrics = {
            "overall_score": 0.0,
            "wpm": 0,
            "filler_rate": 0.0,
            "structure_score": 0.0,
            "relevance_score": 0.0,
            "clarity_score": 0.0,
            "strengths": ["Submit your first interview practice recording to generate AI coaching feedback."],
            "radar": [
                {"area": "Relevance", "value": 50},
                {"area": "Structure", "value": 50},
                {"area": "Fluency", "value": 50},
                {"area": "Clarity", "value": 50},
                {"area": "Pace", "value": 50},
            ],
        }

    # ── 3. Build the 4-Pillar Coaching Items ──────────────────────────────────
    pillars = _build_coaching_pillars(latest_metrics, job_skills, len(timeline))

    # ── 4. Extract radar & strengths summary ───────────────────────────────────
    radar = latest_metrics.get("radar") or [
        {"area": "Relevance", "value": int(latest_metrics.get("relevance_score", 0))},
        {"area": "Structure", "value": int(latest_metrics.get("structure_score", 0))},
        {"area": "Fluency", "value": max(0, int(100 - (latest_metrics.get("filler_rate", 0) * 8)))},
        {"area": "Clarity", "value": int(latest_metrics.get("clarity_score", 0))},
        {"area": "Pace", "value": int(min(100, latest_metrics.get("wpm", 0) * 0.7))},
    ]

    strengths = latest_metrics.get("strengths") or [
        "Completed structured interview response",
        "Demonstrated clear technical communication",
    ]

    latest_score = float(latest_metrics.get("overall_score", 0.0))
    latest_id = interviews[-1].id if interviews else None

    # Get viewed timestamp if already exists in feedbacks table
    feedback_record = getattr(app, "feedbacks", None)
    viewed_at = None
    if feedback_record:
        viewed_at = feedback_record[0].viewed_at if feedback_record else None

    return CandidateFeedbackResponse(
        application_id=app.id,
        job_id=app.job_id,
        job_title=job_title,
        candidate_id=app.candidate_id,
        candidate_name=candidate_name,
        current_status=app.status.value if hasattr(app.status, "value") else str(app.status),
        viewed_at=viewed_at,
        total_attempts=len(timeline),
        latest_score=latest_score,
        latest_interview_id=latest_id,
        pillars=pillars,
        timeline=timeline,
        radar=radar,
        strengths_summary=strengths,
        ethical_ai_notice=RESPONSIBLE_AI_NOTICE,
        generated_at=datetime.now(timezone.utc),
    )


def _build_coaching_pillars(
    m: Dict[str, Any],
    job_skills: List[str],
    attempt_count: int,
) -> List[FeedbackPillar]:
    """
    Constructs the 4-pillar structured coaching response:
    What went well → What can improve → Why it matters → What to do next.
    """
    pillars: List[FeedbackPillar] = []

    wpm = int(m.get("wpm", 0))
    filler_rate = float(m.get("filler_word_rate", 0.0))
    structure = float(m.get("structure_score", 0.0))
    relevance = float(m.get("relevance_score", 0.0))
    clarity = float(m.get("clarity_score", 0.0))
    filler_types = m.get("filler_words_found") or []

    # ── Pillar 1: Filler Word Control ──────────────────────────────────────────
    common_fillers = ", ".join(f'"{w}"' for w in sorted(list(filler_types))[:3]) if filler_types else '"um", "like"'
    if filler_rate < 3.0:
        p1_well = f"Outstanding speech fluency with only {filler_rate}% filler words detected."
        p1_improve = "Maintain this calm speech pacing during unfamiliar or complex architectural questions."
        p1_why = "Low filler word usage ensures interviewers focus uninterrupted on your core technical arguments."
        p1_next = "Continue utilizing silent 1-second pauses when transitioning between points."
        p1_prio = "low"
    elif filler_rate < 5.0:
        p1_well = f"Good natural delivery with filler words kept within moderate range ({filler_rate}%)."
        p1_improve = f"Noticeable fillers occurred during thought transitions ({common_fillers})."
        p1_why = "In engineering interviews, deliberate silence signals thoughtfulness rather than hesitation."
        p1_next = "Practice the '2-Second Pause Drill': whenever you feel like saying 'um', close your lips and take a silent breath before speaking."
        p1_prio = "medium"
    else:
        p1_well = "Maintained an active conversational flow without long silent gaps."
        p1_improve = f"Frequent filler words detected ({filler_rate}% of words, primarily {common_fillers})."
        p1_why = "High filler density can dilute complex explanations and cause interviewers to lose the thread of your solution."
        p1_next = "Record yourself explaining a project for 60 seconds. Tally every filler word and re-record until you reduce the count by half."
        p1_prio = "high"

    pillars.append(
        FeedbackPillar(
            area="Filler Word Control",
            what_went_well=p1_well,
            what_can_improve=p1_improve,
            why_it_matters=p1_why,
            what_to_do_next=p1_next,
            current_metric=f"{filler_rate}%",
            target_metric="< 3.0%",
            priority=p1_prio,
            icon="💬",
        )
    )

    # ── Pillar 2: Answer Structure & STAR Methodology ─────────────────────────
    if structure >= 75:
        p2_well = "Excellent narrative structure — clearly framed background, concrete actions taken, and tangible results."
        p2_improve = "Consider adding even more quantified metrics to the outcome (e.g. latency reduced by X ms, test coverage up by Y%)."
        p2_why = "Recruiters use behavioral rubrics; candidates who present clear cause-and-effect outcomes score highest on execution."
        p2_next = "Create a cheat sheet of your top 3 projects with exact before/after metrics to recall instantly."
        p2_prio = "low"
    elif structure >= 50:
        p2_well = "Good technical context and clear description of the tasks you carried out."
        p2_improve = "The connection between the technical action and the measurable business outcome was lightly covered."
        p2_why = "Hiring managers look for engineers who understand not just how to code, but what business value the code delivered."
        p2_next = "Adopt the STAR formula: (S) Problem context → (T) Objective → (A) Specific code/tools you used → (R) Measurable result achieved."
        p2_prio = "medium"
    else:
        p2_well = "Gave direct technical answers addressing the core subject matter."
        p2_improve = "Answers were unstructured, jumping straight into technical details without setting problem context or concluding with outcomes."
        p2_why = "Without a clear problem-to-outcome structure, interviewers struggle to evaluate the true scope and impact of your contribution."
        p2_next = "Spend 15 seconds outlining: '1) The problem we faced, 2) The architecture I chose, 3) The concrete outcome we shipped.' Practice this framework on 3 past projects."
        p2_prio = "high"

    pillars.append(
        FeedbackPillar(
            area="Answer Structure (STAR Framework)",
            what_went_well=p2_well,
            what_can_improve=p2_improve,
            why_it_matters=p2_why,
            what_to_do_next=p2_next,
            current_metric=f"{structure:.0f}/100",
            target_metric="75+/100",
            priority=p2_prio,
            icon="📐",
        )
    )

    # ── Pillar 3: Speaking Pace & Rhythm ───────────────────────────────────────
    if 120 <= wpm <= 160:
        p3_well = f"Ideal speaking pace at {wpm} WPM — crisp, intelligible, and easy to follow."
        p3_improve = "Maintain this steady tempo even when asked unexpected or high-stress technical questions."
        p3_why = "A cadence between 120–160 WPM maximizes listener comprehension and conveys technical poise."
        p3_next = "Maintain your current pacing rhythm while practicing with a stopwatch."
        p3_prio = "low"
    elif wpm < 120:
        p3_well = "Articulated words deliberately without rushing through points."
        p3_improve = f"Speaking pace was somewhat slow ({wpm} WPM, benchmark is 120–160 WPM)."
        p3_why = "A slow speaking pace can limit the amount of technical depth you can convey within a 30-minute interview slot."
        p3_next = "Practice speaking with an upbeat rhythm. Aim to deliver approximately 140 words in a 60-second timer window."
        p3_prio = "medium"
    else:
        p3_well = "Energetic delivery with high information density."
        p3_improve = f"Speaking speed was rapid ({wpm} WPM, benchmark is 120–160 WPM)."
        p3_why = "Fast speaking can cause technical terms to blur together, making it harder for the interviewer to take accurate notes."
        p3_next = "Insert purposeful 1-second pauses at the end of each paragraph or conceptual thought to let ideas land."
        p3_prio = "medium"

    pillars.append(
        FeedbackPillar(
            area="Speaking Pace & Rhythm",
            what_went_well=p3_well,
            what_can_improve=p3_improve,
            why_it_matters=p3_why,
            what_to_do_next=p3_next,
            current_metric=f"{wpm} WPM",
            target_metric="120–160 WPM",
            priority=p3_prio,
            icon="⏱️",
        )
    )

    # ── Pillar 4: Technical Skill Relevance ────────────────────────────────────
    skill_preview = ", ".join(job_skills[:3]) if job_skills else "target technologies"
    if relevance >= 75:
        p4_well = f"High keyword alignment with required role skills ({skill_preview})."
        p4_improve = "Deepen explanations by briefly citing tradeoffs (e.g. why you chose that technology over alternatives)."
        p4_why = "Recruiters compare spoken terminology against job requisitions to verify genuine hands-on experience."
        p4_next = "In your next response, explain one architectural tradeoff for each major technology you mention."
        p4_prio = "low"
    elif relevance >= 50:
        p4_well = "Mentioned foundational programming and domain concepts correctly."
        p4_improve = f"Omitted direct references to several role requirements ({skill_preview})."
        p4_why = "Explicitly citing job-required tech stack tools ensures scoring keywords are recognized by recruiters."
        p4_next = f"Review the required job skills checklist ({skill_preview}) before your session and weave at least two into your narrative."
        p4_prio = "medium"
    else:
        p4_well = "Demonstrated conversational familiarity with the technical domain."
        p4_improve = f"Few required technical terms were mentioned ({skill_preview})."
        p4_why = "Interview scorecards specifically evaluate alignment with the core tech stack of the position."
        p4_next = f"Write down 5 key technologies from the job posting ({skill_preview}) and prepare a 30-second example for each."
        p4_prio = "high"

    pillars.append(
        FeedbackPillar(
            area="Technical Skill Relevance",
            what_went_well=p4_well,
            what_can_improve=p4_improve,
            why_it_matters=p4_why,
            what_to_do_next=p4_next,
            current_metric=f"{relevance:.0f}/100",
            target_metric="75+/100",
            priority=p4_prio,
            icon="🎯",
        )
    )

    # ── Pillar 5: Clarity & Vocabulary ─────────────────────────────────────────
    if clarity >= 70:
        p5_well = "Clean vocabulary with well-balanced sentence structures and active verbs."
        p5_improve = "Continue eliminating hedging words (e.g. 'I kind of built', 'I basically did')."
        p5_why = "Direct, definitive phrasing reinforces technical authority and engineering confidence."
        p5_next = "Replace phrases like 'I tried to' with 'I engineered' or 'I deployed'."
        p5_prio = "low"
    else:
        p5_well = "Communicated ideas in an accessible, understandable style."
        p5_improve = "Sentences were occasionally compound or repetitive in vocabulary."
        p5_why = "Crisp sentences with precise engineering terms allow interviewers to quickly grasp your technical level."
        p5_next = "Keep sentences to 12–18 words maximum. Complete one thought with a period, pause, and start the next sentence."
        p5_prio = "medium"

    pillars.append(
        FeedbackPillar(
            area="Clarity & Vocabulary Richness",
            what_went_well=p5_well,
            what_can_improve=p5_improve,
            why_it_matters=p5_why,
            what_to_do_next=p5_next,
            current_metric=f"{clarity:.0f}/100",
            target_metric="70+/100",
            priority=p5_prio,
            icon="📖",
        )
    )

    return pillars
