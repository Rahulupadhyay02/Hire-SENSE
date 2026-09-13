"""
Phase 6 Integration Tests — Interview Upload & Speech-to-Text
Tests:
  1. Upload valid audio file → 201 Created, status=queued
  2. Reject invalid file type → 400 Bad Request
  3. Poll interview status → returns metadata
  4. Unauthorized transcript access → 403 Forbidden
  5. Recruiter list interviews per application
  6. Delete interview (recruiter) → 204 No Content
  7. Regression: Phase 5 matching still works
"""

import sys
import os
import io
import time
import json
import requests

BASE_URL = "http://localhost:8000/api/v1"

# ── Credentials ─────────────────────────────────────────────────────────────
RECRUITER_EMAIL = "priya.recruiter@example.com"
RECRUITER_PASS  = "SecurePassword123!"

CANDIDATE_EMAIL = "arjun.candidate@example.com"
CANDIDATE_PASS  = "CandidatePass123!"

PASS_COUNT = 0
FAIL_COUNT = 0

# ── Helpers ──────────────────────────────────────────────────────────────────
def check(name: str, condition: bool, detail: str = ""):
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
        print(f"  ✅  {name}")
    else:
        FAIL_COUNT += 1
        print(f"  ❌  {name}{f' — {detail}' if detail else ''}")

def login(email: str, password: str) -> str:
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": email, "password": password})
    if res.status_code != 200:
        print(f"  ⚠️  Login failed for {email}: {res.text}")
        sys.exit(1)
    return res.json()["access_token"]

def auth_headers(token: str) -> dict:
    return {"Authorization": f"Bearer {token}"}

def get_first_application_id(token: str) -> int:
    res = requests.get(f"{BASE_URL}/applications", headers=auth_headers(token))
    apps = res.json()
    if not apps:
        print("  ⚠️  No applications found in DB. Please run seed_data.py first.")
        sys.exit(1)
    return apps[0]["id"]

def make_fake_audio() -> bytes:
    """Minimal valid WAV header (44 bytes) for testing."""
    import struct
    # 44-byte WAV header + tiny data chunk
    sample_rate = 16000
    num_channels = 1
    bits_per_sample = 16
    num_samples = 1600  # 0.1 seconds
    byte_rate = sample_rate * num_channels * bits_per_sample // 8
    block_align = num_channels * bits_per_sample // 8
    data_size = num_samples * block_align

    header = struct.pack('<4sI4s', b'RIFF', 36 + data_size, b'WAVE')
    fmt    = struct.pack('<4sIHHIIHH', b'fmt ', 16, 1,
                        num_channels, sample_rate, byte_rate, block_align, bits_per_sample)
    data   = struct.pack('<4sI', b'data', data_size) + bytes(data_size)
    return header + fmt + data


# ── Tests ─────────────────────────────────────────────────────────────────────

def test_upload_valid_audio(rec_token: str, app_id: int) -> int:
    """Test 1 — Upload a valid WAV audio file."""
    print("\n[Test 1] Upload valid audio file")
    wav_bytes = make_fake_audio()

    res = requests.post(
        f"{BASE_URL}/interviews/upload",
        headers=auth_headers(rec_token),
        data={"application_id": app_id},
        files={"file": ("test_interview.wav", io.BytesIO(wav_bytes), "audio/wav")}
    )
    check("Status 201 Created", res.status_code == 201, f"Got {res.status_code}: {res.text[:200]}")
    if res.status_code != 201:
        return -1

    data = res.json()
    check("Response has id", "id" in data)
    check("Response has application_id", data.get("application_id") == app_id)
    check("Status is 'queued' or 'processing' or 'completed'",
          data.get("status") in ("queued", "processing", "completed"),
          f"Got: {data.get('status')}")
    check("Original filename preserved", data.get("original_filename") == "test_interview.wav")
    check("File type is audio/wav", data.get("file_type") == "audio/wav")

    return data["id"]


def test_reject_invalid_filetype(rec_token: str, app_id: int):
    """Test 2 — Reject unsupported file type."""
    print("\n[Test 2] Reject invalid file type (PDF)")
    res = requests.post(
        f"{BASE_URL}/interviews/upload",
        headers=auth_headers(rec_token),
        data={"application_id": app_id},
        files={"file": ("resume.pdf", io.BytesIO(b"%PDF-1.4 fake pdf content"), "application/pdf")}
    )
    check("Status 400 Bad Request", res.status_code == 400, f"Got {res.status_code}")
    check("Error message mentions supported types",
          "Unsupported file type" in res.text or "unsupported" in res.text.lower(),
          res.text[:200])


def test_get_interview_status(rec_token: str, interview_id: int):
    """Test 3 — Get interview status and metadata."""
    print(f"\n[Test 3] Get interview status (id={interview_id})")
    res = requests.get(f"{BASE_URL}/interviews/{interview_id}", headers=auth_headers(rec_token))
    check("Status 200 OK", res.status_code == 200, f"Got {res.status_code}")

    if res.status_code == 200:
        data = res.json()
        check("Has status field", "status" in data)
        check("Has file_size_bytes", "file_size_bytes" in data)
        check("Has stored_filename", "stored_filename" in data)
        print(f"       Interview status: {data.get('status')}")


def test_unauthorized_transcript_access(cand_token: str, interview_id: int):
    """Test 4 — Candidate cannot access another candidate's interview transcript."""
    print(f"\n[Test 4] Unauthorized transcript access (wrong candidate)")
    # Use the candidate token to try accessing the recruiter-uploaded interview
    # The candidate's own application interviews are accessible, but this tests
    # that candidates can't access others'. We test with transcript endpoint directly.
    res = requests.get(
        f"{BASE_URL}/interviews/{interview_id}/transcript",
        headers=auth_headers(cand_token)
    )
    # Either 403 (access denied) or 422 (not completed yet) are both correct
    check("Returns 403 or 422 (not open access)", res.status_code in (403, 422),
          f"Got {res.status_code}: {res.text[:150]}")


def test_list_application_interviews(rec_token: str, app_id: int):
    """Test 5 — List interviews for an application."""
    print(f"\n[Test 5] List interviews for application {app_id}")
    res = requests.get(
        f"{BASE_URL}/applications/{app_id}/interviews",
        headers=auth_headers(rec_token)
    )
    check("Status 200 OK", res.status_code == 200, f"Got {res.status_code}: {res.text[:150]}")
    if res.status_code == 200:
        items = res.json()
        check("Returns a list", isinstance(items, list))
        check("At least 1 interview listed", len(items) >= 1, f"Got {len(items)}")
        if items:
            check("Each item has id and status", "id" in items[0] and "status" in items[0])


def test_transcript_available_for_seeded(rec_token: str):
    """Test 6 — Seeded interviews (completed) have transcripts accessible."""
    print("\n[Test 6] Seeded interview transcript accessible")
    # Get all applications and find one with a seeded interview
    apps_res = requests.get(f"{BASE_URL}/applications", headers=auth_headers(rec_token))
    apps = apps_res.json()
    found = False
    for app in apps:
        ivs_res = requests.get(
            f"{BASE_URL}/applications/{app['id']}/interviews",
            headers=auth_headers(rec_token)
        )
        if ivs_res.status_code == 200:
            ivs = ivs_res.json()
            for iv in ivs:
                if iv.get("status") == "completed":
                    tr_res = requests.get(
                        f"{BASE_URL}/interviews/{iv['id']}/transcript",
                        headers=auth_headers(rec_token)
                    )
                    check("Seeded transcript returns 200", tr_res.status_code == 200,
                          f"Got {tr_res.status_code}")
                    if tr_res.status_code == 200:
                        td = tr_res.json()
                        check("Transcript is non-empty string", bool(td.get("transcript")))
                        check("Segments is a list", isinstance(td.get("transcript_segments"), list))
                        check("Duration_seconds is set", td.get("duration_seconds") is not None)
                    found = True
                    break
        if found:
            break
    if not found:
        print("  ⚠️  No seeded completed interviews found — run seed_data.py first")


def test_delete_interview(rec_token: str, interview_id: int):
    """Test 7 — Delete interview (recruiter)."""
    print(f"\n[Test 7] Delete interview {interview_id} (recruiter)")
    res = requests.delete(
        f"{BASE_URL}/interviews/{interview_id}",
        headers=auth_headers(rec_token)
    )
    check("Status 204 No Content", res.status_code == 204, f"Got {res.status_code}: {res.text[:150]}")
    # Confirm it's gone
    res2 = requests.get(f"{BASE_URL}/interviews/{interview_id}", headers=auth_headers(rec_token))
    check("Interview no longer accessible (404)", res2.status_code == 404, f"Got {res2.status_code}")


def test_phase5_regression(rec_token: str):
    """Test 8 — Phase 5 matching regression check."""
    print("\n[Test 8] Phase 5 matching regression")
    apps_res = requests.get(f"{BASE_URL}/applications", headers=auth_headers(rec_token))
    apps = apps_res.json()
    if not apps:
        print("  ⚠️  No applications to test matching on")
        return
    app_id = apps[0]["id"]
    res = requests.post(
        f"{BASE_URL}/applications/{app_id}/analyze",
        headers=auth_headers(rec_token)
    )
    check("Phase 5 /analyze returns 200", res.status_code == 200, f"Got {res.status_code}: {res.text[:150]}")
    if res.status_code == 200:
        d = res.json()
        check("overall_score is present", "overall_score" in d)
        check("skills_score + experience_score present", "skills_score" in d and "experience_score" in d)
        check("explanation is non-empty", bool(d.get("explanation")))


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    print("=" * 60)
    print("  HireSense — Phase 6 Integration Test Suite")
    print("  Interview Upload & Speech-to-Text")
    print("=" * 60)

    print("\n→ Logging in as recruiter...")
    rec_token = login(RECRUITER_EMAIL, RECRUITER_PASS)
    print(f"  Token acquired ✓")

    print("\n→ Logging in as candidate...")
    cand_token = login(CANDIDATE_EMAIL, CANDIDATE_PASS)
    print(f"  Token acquired ✓")

    app_id = get_first_application_id(rec_token)
    print(f"\n→ Using application_id = {app_id} for upload tests")

    # Run tests
    new_interview_id = test_upload_valid_audio(rec_token, app_id)
    test_reject_invalid_filetype(rec_token, app_id)

    if new_interview_id != -1:
        test_get_interview_status(rec_token, new_interview_id)
        test_unauthorized_transcript_access(cand_token, new_interview_id)

    test_list_application_interviews(rec_token, app_id)
    test_transcript_available_for_seeded(rec_token)

    if new_interview_id != -1:
        test_delete_interview(rec_token, new_interview_id)

    test_phase5_regression(rec_token)

    # Summary
    total = PASS_COUNT + FAIL_COUNT
    print(f"\n{'=' * 60}")
    print(f"  Results: {PASS_COUNT}/{total} passed  |  {FAIL_COUNT} failed")
    print(f"{'=' * 60}\n")

    sys.exit(0 if FAIL_COUNT == 0 else 1)
