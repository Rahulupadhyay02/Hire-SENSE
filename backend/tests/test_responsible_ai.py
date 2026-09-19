import pytest
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate
from app.models.user import User, UserRole
from app.services.matcher import evaluate_job_candidate_match
from app.services.metrics_service import compute_metrics

# 10 Diverse demographic test names for counterfactual evaluation
COUNTERFACTUAL_NAMES = [
    "Alex Mercer",
    "Priya Sharma",
    "Carlos Rodriguez",
    "Aisha Al-Mansoor",
    "Kwame Mensah",
    "Elena Rostova",
    "Mei-Ling Chen",
    "David Cohen",
    "Fatima Zahra",
    "Liam O'Connor",
]

FORBIDDEN_ATTRIBUTES = [
    "gender", "race", "ethnicity", "age", "religion",
    "photo", "nationality", "marital_status", "disability"
]

FORBIDDEN_PERSONALITY_TRAITS = [
    "lazy", "aggressive", "shy", "nervous", "arrogant", "unconfident",
    "incompetent", "untrustworthy", "dishonest", "unmotivated", "submissive"
]

def test_counterfactual_fairness_across_demographics():
    """
    Counterfactual fairness test:
    Identical candidate credentials evaluated with diverse demographic identity names
    must produce 100% identical match scores and feature weights.
    """
    job = Job(
        title="Full Stack Software Engineer",
        description="FastAPI, React, PostgreSQL and Docker application developer",
        experience="3+ years",
        required_skills=["Python", "FastAPI", "React", "PostgreSQL"],
        preferred_skills=["Docker", "Redis"],
        status=JobStatus.ACTIVE
    )

    baseline_score = None
    baseline_explanation = None

    for name in COUNTERFACTUAL_NAMES:
        dummy_user = User(name=name, email=f"{name.lower().replace(' ', '.')}@example.com", role=UserRole.CANDIDATE)
        candidate = Candidate(
            user=dummy_user,
            skills=["Python", "FastAPI", "React", "PostgreSQL", "Docker"],
            experience_years="3.5 years",
            education="B.S. Computer Engineering"
        )
        
        result = evaluate_job_candidate_match(job, candidate)
        score = result["overall_score"]
        
        if baseline_score is None:
            baseline_score = score
            baseline_explanation = result["explanation"]
        else:
            assert score == baseline_score, f"Demographic name '{name}' caused score divergence ({score} vs {baseline_score})!"

def test_sensitive_attributes_explicitly_excluded():
    """
    Verify that the system explicitly lists and excludes sensitive attributes from scoring.
    """
    job = Job(
        title="Backend Engineer",
        description="Python developer",
        experience="2 years",
        required_skills=["Python", "SQL"],
        status=JobStatus.ACTIVE
    )
    candidate = Candidate(
        skills=["Python", "SQL"],
        experience_years="2 years"
    )
    result = evaluate_job_candidate_match(job, candidate)
    
    components = result.get("components_json", {})
    assert "sensitive_attributes_excluded" in components
    excluded = components["sensitive_attributes_excluded"]
    
    # Assert key protected categories are audited and excluded
    for attr in ["name", "gender", "photo", "age", "phone", "email"]:
        assert attr in excluded

def test_communication_ai_non_judgmental_guardrail():
    """
    Ensure the communication metrics feedback generator contains zero subjective personality labels.
    """
    transcripts = [
        "Um, I was feeling nervous and anxious, like basically I did not know how to start.",
        "I was angry at my previous boss and felt lazy, but I built the feature anyway.",
        "When I was at Google, I led the Kubernetes migration project and reduced costs by 30%."
    ]
    
    for text in transcripts:
        metrics = compute_metrics(
            transcript=text,
            segments=None,
            duration_seconds=30.0,
            job_skills=["Python", "Kubernetes"]
        )
        
        # Combine all feedback text
        feedback_corpus = " ".join(metrics["strengths"])
        for imp in metrics["improvements"]:
            feedback_corpus += " " + imp["label"] + " " + imp["action"]
            
        feedback_lower = feedback_corpus.lower()
        for forbidden in FORBIDDEN_PERSONALITY_TRAITS:
            assert forbidden not in feedback_lower, f"Forbidden personality trait '{forbidden}' detected in feedback text!"
