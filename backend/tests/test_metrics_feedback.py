import pytest
from app.services.metrics_service import compute_metrics
from app.models.job import Job, JobStatus
from app.models.application import Application, ApplicationStatus
from app.models.interview import Interview, InterviewStatus

FORBIDDEN_PSYCHOLOGICAL_TERMS = [
    "nervous", "shy", "lazy", "arrogant", "incompetent", 
    "aggressive", "unconfident", "untrustworthy", "dishonest"
]

def test_communication_metrics_high_structure():
    transcript = (
        "When I was working at my previous company, my role was to scale our backend service. "
        "The goal was to decrease latency by forty percent. I implemented an asynchronous queue "
        "using Celery and Redis and refactored the database queries. As a result, we reduced "
        "response times from four hundred milliseconds to fifty milliseconds, and system throughput doubled."
    )
    metrics = compute_metrics(
        transcript=transcript,
        segments=None,
        duration_seconds=30.0,
        job_skills=["Python", "Redis", "Celery", "PostgreSQL"]
    )
    assert metrics["wpm"] > 70
    assert metrics["filler_word_rate"] < 3.0
    assert metrics["structure_score"] >= 70.0
    assert metrics["overall_score"] >= 65.0
    assert len(metrics["radar"]) == 5
    assert any(r["area"] == "Structure" for r in metrics["radar"])

def test_communication_metrics_high_filler_detection():
    transcript = (
        "Um, basically, uh, like I was trying to, you know, fix the bug, and like, "
        "umm, actually it was kind of hard, right? So, uh, I just sort of restarted the server."
    )
    metrics = compute_metrics(
        transcript=transcript,
        segments=None,
        duration_seconds=20.0,
        job_skills=["Python"]
    )
    assert metrics["filler_word_rate"] > 10.0
    assert metrics["filler_count"] >= 5
    assert metrics["overall_score"] < 65.0

def test_feedback_non_judgmental_guardrail():
    transcript = (
        "Um, I was nervous and like, basically did not know what to say. "
        "I guess I just tried to do some coding."
    )
    metrics = compute_metrics(
        transcript=transcript,
        segments=None,
        duration_seconds=15.0,
        job_skills=["React"]
    )
    # Check all strengths and improvement suggestions
    all_feedback_text = " ".join(metrics["strengths"]) + " " + " ".join([i["action"] + " " + i["label"] for i in metrics["improvements"]])
    all_feedback_lower = all_feedback_text.lower()
    
    for term in FORBIDDEN_PSYCHOLOGICAL_TERMS:
        assert term not in all_feedback_lower, f"Forbidden psychological term '{term}' found in feedback!"

def test_candidate_feedback_api_with_viewed_tracking(client, recruiter_headers, candidate_headers, db_session):
    job_res = client.post("/api/v1/jobs", json={
        "title": "Software Engineer",
        "description": "Core backend",
        "experience": "2 years",
        "required_skills": ["Python"],
        "status": "active"
    }, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    app_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    app_id = app_res.json()["id"]

    # Candidate requests feedback
    feedback_res = client.get(f"/api/v1/applications/{app_id}/feedback", headers=candidate_headers)
    assert feedback_res.status_code == 200
    data = feedback_res.json()
    assert "application_id" in data
    assert data["application_id"] == app_id
    assert "pillars" in data
    assert "ethical_ai_notice" in data
    assert data["viewed_at"] is not None
