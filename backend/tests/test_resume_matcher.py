import pytest
from app.services.matcher import (
    _normalize_skill,
    _extract_numeric_years,
    evaluate_job_candidate_match
)
from app.services.resume_parser import SKILL_TAXONOMY, extract_and_normalize_skills
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate

def test_skill_normalization():
    # Test common aliases
    assert _normalize_skill("python3") == "Python"
    assert _normalize_skill("js") == "JavaScript"
    assert _normalize_skill("k8s") == "Kubernetes"
    assert _normalize_skill("postgres") == "PostgreSQL"
    assert _normalize_skill("react.js") == "React"
    assert _normalize_skill("aws") == "AWS"
    assert _normalize_skill("docker") == "Docker"

def test_extract_numeric_years():
    assert _extract_numeric_years("3+ years") == 3.0
    assert _extract_numeric_years("1-2 years") == 1.5
    assert _extract_numeric_years("5 years") == 5.0
    assert _extract_numeric_years("Senior Software Engineer") == 5.0
    assert _extract_numeric_years("Entry level / intern") == 0.5
    assert _extract_numeric_years("") == 1.0

def test_matcher_high_fit():
    job = Job(
        title="Senior Python Backend Developer",
        description="Build scalable FastAPI services with PostgreSQL and Redis",
        experience="3+ years",
        required_skills=["Python", "FastAPI", "PostgreSQL"],
        preferred_skills=["Redis", "Docker"],
        status=JobStatus.ACTIVE
    )
    candidate = Candidate(
        skills=["Python", "FastAPI", "PostgreSQL", "Docker", "Redis", "Git"],
        experience_years="4 years",
        education="B.S. Computer Science"
    )
    result = evaluate_job_candidate_match(job, candidate)
    
    assert "overall_score" in result
    assert result["overall_score"] >= 75.0
    matched = result["components_json"]["matched_skills"]
    assert "Python" in matched
    assert "FastAPI" in matched
    assert "PostgreSQL" in matched
    assert len(result["components_json"]["missing_skills"]) == 0
    assert "explanation" in result
    assert len(result["explanation"]) > 20
    assert "sensitive_attributes_excluded" in result["components_json"]

def test_matcher_partial_fit_identifies_gaps():
    job = Job(
        title="Cloud Architect",
        description="Kubernetes, Terraform, AWS, Golang",
        experience="5+ years",
        required_skills=["Kubernetes", "Terraform", "Go", "AWS"],
        preferred_skills=["Helm"],
        status=JobStatus.ACTIVE
    )
    candidate = Candidate(
        skills=["Docker", "AWS"],
        experience_years="1-2 years",
        education="B.S. Information Systems"
    )
    result = evaluate_job_candidate_match(job, candidate)
    
    # Missing required skills should be identified
    assert result["overall_score"] < 65.0
    missing = result["components_json"]["missing_skills"]
    assert "Kubernetes" in missing
    assert "Terraform" in missing
    assert "Go" in missing
    assert "AWS" in result["components_json"]["matched_skills"]

def test_matcher_candidate_skill_override():
    job = Job(
        title="Full Stack Developer",
        description="React and Node.js",
        experience="2 years",
        required_skills=["React", "Node.js"],
        preferred_skills=["TypeScript"],
        status=JobStatus.ACTIVE
    )
    # Candidate originally without Node.js
    candidate = Candidate(
        skills=["React"],
        experience_years="2 years"
    )
    res_before = evaluate_job_candidate_match(job, candidate)
    
    # Candidate updates profile adding Node.js
    candidate.skills = ["React", "Node.js", "TypeScript"]
    res_after = evaluate_job_candidate_match(job, candidate)
    
    assert res_after["overall_score"] > res_before["overall_score"]
    assert "Node.js" in res_after["components_json"]["matched_skills"]
    assert len(res_after["components_json"]["missing_skills"]) == 0
