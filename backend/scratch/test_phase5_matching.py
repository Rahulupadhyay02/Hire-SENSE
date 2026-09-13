"""
Phase 5 Comprehensive Test Suite: Job-Candidate Matching AI & Explainability
Tests:
1. Matching formula weights adherence (0.45 * Skills + 0.20 * Exp + 0.20 * Proj + 0.15 * Cov)
2. Explainability structure (skills matrix, matched, missing, unclear badges)
3. Sensitive attribute exclusion (Responsible AI guardrails)
4. API Endpoints:
   - GET /applications/{id}/match
   - POST /applications/{id}/analyze
   - POST /applications/{id}/match/override (Recruiter manual override)
   - Authorization protections (Candidate cannot override)
"""
import sys
import os
from fastapi.testclient import TestClient

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.models.match_score import MatchScore
from app.services.matcher import evaluate_job_candidate_match, _extract_numeric_years
from app.utils.security import create_access_token

client = TestClient(app)

def test_unit_experience_parsing():
    print("[*] Testing numeric experience year extraction...")
    assert _extract_numeric_years("3+ years") == 3.0
    assert _extract_numeric_years("1-2 years") == 1.5
    assert _extract_numeric_years("5 years") == 5.0
    assert _extract_numeric_years("Senior level") == 5.0
    assert _extract_numeric_years("Fresher / Entry level") == 0.5
    print("[✓] Experience parsing passed.")

def test_unit_matching_formula_and_ethics():
    print("[*] Testing matching formula, weights, and ethical boundaries...")
    job = Job(
        title="Python Backend Engineer",
        description="Need strong FastAPI and SQL skills.",
        experience="2+ years",
        required_skills=["Python", "FastAPI", "SQL"],
        preferred_skills=["Docker", "AWS"],
        status=JobStatus.ACTIVE
    )
    
    candidate = Candidate(
        experience_years="3 years",
        skills=["Python", "FastAPI", "SQL", "Docker"],
        profile_json={
            "projects": [
                {
                    "name": "E-Commerce API",
                    "description": "High throughput REST backend written in Python with FastAPI and SQL queries.",
                    "technologies": ["Python", "FastAPI", "PostgreSQL"]
                }
            ]
        }
    )
    
    result = evaluate_job_candidate_match(job, candidate)
    
    # 1. Check formula weights
    weights = result["components_json"]["weights"]
    assert weights["skills"] == 0.45
    assert weights["experience"] == 0.20
    assert weights["projects"] == 0.20
    assert weights["coverage"] == 0.15
    
    # 2. Check scores exist and within 0-100
    assert 0 <= result["overall_score"] <= 100
    assert 0 <= result["skills_score"] <= 100
    assert 0 <= result["experience_score"] <= 100
    assert 0 <= result["projects_score"] <= 100
    assert 0 <= result["coverage_score"] <= 100
    
    # 3. Check mathematical weighted overall score
    expected_overall = round(
        0.45 * result["skills_score"] +
        0.20 * result["experience_score"] +
        0.20 * result["projects_score"] +
        0.15 * result["coverage_score"],
        1
    )
    assert abs(result["overall_score"] - expected_overall) < 0.2
    
    # 4. Check explainability matrix
    matrix = result["components_json"]["skills_matrix"]
    skills_in_matrix = {item["skill"].lower(): item["status"] for item in matrix}
    assert "python" in skills_in_matrix and skills_in_matrix["python"] == "matched"
    assert "fastapi" in skills_in_matrix and skills_in_matrix["fastapi"] == "matched"
    assert "sql" in skills_in_matrix and skills_in_matrix["sql"] == "matched"
    assert "aws" in skills_in_matrix and skills_in_matrix["aws"] == "missing"
    
    # 5. Check sensitive attributes excluded
    excluded = result["components_json"]["sensitive_attributes_excluded"]
    assert "name" in excluded and "gender" in excluded and "photo" in excluded
    assert "name" not in result["components_json"]["formula"].lower()
    
    print(f"[✓] Matching formula & explainability verified: Overall {result['overall_score']}%")

def test_api_matching_workflow():
    print("[*] Testing API endpoints for matching, explainability, and recruiter override...")
    db = SessionLocal()
    try:
        recruiter = db.query(User).filter(User.role == UserRole.RECRUITER).first()
        assert recruiter is not None, "Recruiter user must exist"
        recruiter_token = create_access_token(subject=str(recruiter.id), role=recruiter.role.value)

        candidate_user = db.query(User).filter(User.role == UserRole.CANDIDATE).first()
        assert candidate_user is not None, "Candidate user must exist"
        candidate_token = create_access_token(subject=str(candidate_user.id), role=candidate_user.role.value)

        app_rec = db.query(Application).first()
        assert app_rec is not None, "At least one application must exist"
        app_id = app_rec.id

        # 1. GET /applications/{id}/match (Recruiter)
        res = client.get(f"/api/v1/applications/{app_id}/match", headers={"Authorization": f"Bearer {recruiter_token}"})
        assert res.status_code == 200, f"GET match failed: {res.text}"
        data = res.json()
        assert "overall_score" in data
        assert "components" in data
        assert "explanation" in data
        assert "skills_matrix" in data["components"]
        print(f"[✓] GET /applications/{app_id}/match returned score: {data['overall_score']}%")

        # 2. POST /applications/{id}/analyze (Recruiter re-run)
        res_analyze = client.post(f"/api/v1/applications/{app_id}/analyze", headers={"Authorization": f"Bearer {recruiter_token}"})
        assert res_analyze.status_code == 200, f"Analyze failed: {res_analyze.text}"
        data_analyze = res_analyze.json()
        assert data_analyze["overall_score"] > 0
        print(f"[✓] POST /applications/{app_id}/analyze successfully refreshed score: {data_analyze['overall_score']}%")

        # 3. POST /applications/{id}/match/override (Recruiter override)
        override_payload = {
            "override_score": 94.5,
            "reason": "Exceptional live coding demonstration and deep architectural understanding."
        }
        res_override = client.post(
            f"/api/v1/applications/{app_id}/match/override",
            json=override_payload,
            headers={"Authorization": f"Bearer {recruiter_token}"}
        )
        assert res_override.status_code == 200, f"Override failed: {res_override.text}"
        data_override = res_override.json()
        assert data_override["overall_score"] == 94.5
        assert data_override["is_overridden"] is True
        assert data_override["override_reason"] == override_payload["reason"]
        print(f"[✓] POST /applications/{app_id}/match/override verified with logged justification.")

        # 4. Security Check: Candidate CANNOT override score
        res_forbidden = client.post(
            f"/api/v1/applications/{app_id}/match/override",
            json={"override_score": 100.0, "reason": "Hacking score"},
            headers={"Authorization": f"Bearer {candidate_token}"}
        )
        assert res_forbidden.status_code == 403, "Candidate must be forbidden from overriding match score"
        print("[✓] Authorization guard confirmed: Candidates cannot override scores.")

    finally:
        db.close()

if __name__ == "__main__":
    print("==================================================")
    print("  PHASE 5: JOB-CANDIDATE MATCHING AI TEST SUITE   ")
    print("==================================================")
    test_unit_experience_parsing()
    test_unit_matching_formula_and_ethics()
    test_api_matching_workflow()
    print("==================================================")
    print("  🎉 ALL PHASE 5 TESTS PASSED SUCCESSFULLY!       ")
    print("==================================================")
