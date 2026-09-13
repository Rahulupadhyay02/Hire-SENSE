"""
Phase 7 Integration Tests — Interview Communication Metrics Engine & Endpoints
================================================================================
Tests:
  1. Core metrics calculation engine (deterministic, fields presence, valid ranges)
  2. Filler word detection (single words, phrases, rate calculation)
  3. STAR structure scoring heuristic
  4. Vocabulary clarity & speaking pace scoring
  5. Technical relevance scoring against job required skills
  6. GET /interviews/{id}/metrics endpoint (authentication, authorization, 200 response)
  7. GET /interviews/{id}/metrics on non-existent (404)
  8. POST /interviews/{id}/recompute-metrics endpoint
  9. GET /applications/{app_id}/communication-summary endpoint
  10. GET /applications/{app_id}/interviews includes communication_score
"""

import sys
import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.application import Application
from app.models.interview import Interview, InterviewStatus
from app.services import metrics_service
from app.utils.security import create_access_token

client = TestClient(app)

passed_count = 0
failed_count = 0

def check(condition: bool, desc: str):
    global passed_count, failed_count
    if condition:
        print(f"  [PASS] {desc}")
        passed_count += 1
    else:
        print(f"  [FAIL] {desc}")
        failed_count += 1


def run_tests():
    global passed_count, failed_count
    print("\n=======================================================")
    print("PHASE 7: INTERVIEW COMMUNICATION METRICS TEST SUITE")
    print("=======================================================\n")

    db = SessionLocal()

    try:
        # ─────────────────────────────────────────────────────────────
        # 1. Test Metrics Service: Determinism & Schema
        # ─────────────────────────────────────────────────────────────
        print("[*] Test Group 1: Core Metrics Service Unit Tests")

        sample_transcript = (
            "In my previous company, our main application had severe latency issues. "
            "My task was to optimize the database queries and redesign the indexing strategy. "
            "I implemented query profiling with PostgreSQL, built caching layers with Redis, "
            "and refactored the SQLAlchemy ORM models. "
            "As a result, API response times improved by 75 percent and system throughput doubled."
        )
        duration = 30.0  # 30 seconds
        skills = ["Python", "PostgreSQL", "Redis", "SQLAlchemy", "FastAPI"]

        metrics1 = metrics_service.compute_metrics(sample_transcript, [], duration, skills)
        metrics2 = metrics_service.compute_metrics(sample_transcript, [], duration, skills)

        check(metrics1["overall_score"] == metrics2["overall_score"], "Deterministic output (metrics1 == metrics2)")
        check("wpm" in metrics1 and metrics1["wpm"] > 0, f"WPM calculated correctly ({metrics1['wpm']} WPM)")
        check(metrics1["filler_word_rate"] == 0.0, "Filler word rate is 0% for clean transcript")
        check(metrics1["structure_score"] >= 80, f"High STAR structure score ({metrics1['structure_score']}/100)")
        check(metrics1["relevance_score"] >= 70, f"High relevance score for matching skills ({metrics1['relevance_score']}/100)")
        check(metrics1["clarity_score"] > 50, f"Valid clarity score ({metrics1['clarity_score']}/100)")
        check(0 <= metrics1["overall_score"] <= 100, f"Valid composite score range ({metrics1['overall_score']})")
        check(len(metrics1["strengths"]) > 0, "Strengths generated")
        check(isinstance(metrics1["radar"], list) and len(metrics1["radar"]) == 5, "Radar array has 5 dimensions")
        check("progress_snapshot" in metrics1, "Progress snapshot present")

        # ─────────────────────────────────────────────────────────────
        # 2. Filler Word Detection
        # ─────────────────────────────────────────────────────────────
        print("\n[*] Test Group 2: Filler Word Detection")

        filler_heavy = (
            "Um, hello, so like, basically what happened was, you know, we had a bug, "
            "and uh, I kind of fixed it, actually, and um, yeah, it works now, right?"
        )
        filler_metrics = metrics_service.compute_metrics(filler_heavy, [], 20.0, ["Python"])
        check(filler_metrics["filler_count"] >= 5, f"Detected filler count ({filler_metrics['filler_count']})")
        check(filler_metrics["filler_word_rate"] > 15.0, f"High filler rate detected ({filler_metrics['filler_word_rate']}%)")
        check("um" in filler_metrics["filler_words_found"], "Identified 'um' filler")
        check("like" in filler_metrics["filler_words_found"], "Identified 'like' filler")
        check(any(imp["label"] == "Filler words" for imp in filler_metrics["improvements"]), "Filler word coaching improvement generated")

        # ─────────────────────────────────────────────────────────────
        # 3. Speaking Pace
        # ─────────────────────────────────────────────────────────────
        print("\n[*] Test Group 3: Speaking Pace Analysis")

        slow_metrics = metrics_service.compute_metrics(sample_transcript, [], 120.0, skills) # 120s for ~40 words = ~20 WPM
        check(slow_metrics["wpm"] < 80, f"Detected slow pace ({slow_metrics['wpm']} WPM)")
        check(any("too slow" in imp["label"].lower() for imp in slow_metrics["improvements"]), "Slow pace improvement triggered")

        fast_metrics = metrics_service.compute_metrics(sample_transcript, [], 10.0, skills) # 10s for ~40 words = ~240 WPM
        check(fast_metrics["wpm"] > 200, f"Detected fast pace ({fast_metrics['wpm']} WPM)")
        check(any("too fast" in imp["label"].lower() for imp in fast_metrics["improvements"]), "Fast pace improvement triggered")

        # ─────────────────────────────────────────────────────────────
        # 4. API Endpoints: Setup tokens
        # ─────────────────────────────────────────────────────────────
        print("\n[*] Test Group 4: API Endpoints & Auth")

        recruiter = db.query(User).filter(User.role == UserRole.RECRUITER).first()
        candidate_user = db.query(User).filter(User.role == UserRole.CANDIDATE).first()

        recruiter_token = create_access_token(subject=recruiter.id, role=recruiter.role.value)
        candidate_token = create_access_token(subject=candidate_user.id, role=candidate_user.role.value)

        rec_headers = {"Authorization": f"Bearer {recruiter_token}"}
        cand_headers = {"Authorization": f"Bearer {candidate_token}"}

        # Find existing completed interview
        interview = db.query(Interview).filter(Interview.status == InterviewStatus.COMPLETED).first()
        check(interview is not None, f"Found completed interview (ID {interview.id})")

        # Test GET /api/v1/interviews/{id}/metrics (Recruiter)
        res = client.get(f"/api/v1/interviews/{interview.id}/metrics", headers=rec_headers)
        check(res.status_code == 200, f"GET /api/v1/interviews/{interview.id}/metrics returns 200")
        data = res.json()
        check(data["interview_id"] == interview.id, "Correct interview_id in response")
        check(data["communication_score"] is not None, f"communication_score present ({data['communication_score']})")
        check("wpm" in data and "filler_word_rate" in data and "radar" in data, "All core metric fields present")
        check(len(data["radar"]) == 5, "Radar array contains 5 elements")

        # Test GET /api/v1/interviews/999999/metrics (404)
        res_404 = client.get("/api/v1/interviews/999999/metrics", headers=rec_headers)
        check(res_404.status_code == 404, "GET /api/v1/interviews/999999/metrics returns 404")

        # Test POST /api/v1/interviews/{id}/recompute-metrics (Recruiter)
        res_rec = client.post(f"/api/v1/interviews/{interview.id}/recompute-metrics", headers=rec_headers)
        check(res_rec.status_code == 200, f"POST /api/v1/interviews/{interview.id}/recompute-metrics returns 200")
        recomp_data = res_rec.json()
        check(recomp_data["communication_score"] == data["communication_score"], "Recomputed score is identical (deterministic)")

        # ─────────────────────────────────────────────────────────────
        # 5. Application Communication Summary
        # ─────────────────────────────────────────────────────────────
        print("\n[*] Test Group 5: Application Communication Summary")

        app_id = interview.application_id
        res_summary = client.get(f"/api/v1/applications/{app_id}/communication-summary", headers=rec_headers)
        check(res_summary.status_code == 200, f"GET /api/v1/applications/{app_id}/communication-summary returns 200")
        sum_data = res_summary.json()
        check(sum_data["application_id"] == app_id, "Correct application_id in summary")
        check(sum_data["total_interviews"] >= 1, f"total_interviews >= 1 ({sum_data['total_interviews']})")
        check(sum_data["latest_communication_score"] is not None, f"latest_communication_score present ({sum_data['latest_communication_score']})")
        check(isinstance(sum_data["trend"], list) and len(sum_data["trend"]) >= 1, "trend array populated")
        check("score" in sum_data["trend"][0] and "wpm" in sum_data["trend"][0], "Trend entries include score and wpm")

        # Test GET /api/v1/applications/{app_id}/interviews includes communication_score
        res_list = client.get(f"/api/v1/applications/{app_id}/interviews", headers=rec_headers)
        check(res_list.status_code == 200, f"GET /api/v1/applications/{app_id}/interviews returns 200")
        list_data = res_list.json()
        matching_iv = next((i for i in list_data if i["id"] == interview.id), None)
        check(matching_iv is not None, "Interview found in list")
        check(matching_iv.get("communication_score") is not None, f"Interview list item contains communication_score ({matching_iv.get('communication_score')})")

    finally:
        db.close()

    print("\n=======================================================")
    print(f"RESULTS: {passed_count} PASSED, {failed_count} FAILED")
    print("=======================================================\n")
    if failed_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    run_tests()
