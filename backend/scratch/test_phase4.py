import urllib.request
import urllib.error
import json
import uuid

BASE_URL = "http://localhost:8000/api/v1"

def req_json(endpoint, method="GET", data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            content = resp.read().decode()
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, content

def req_multipart(endpoint, filename, file_bytes, content_type="application/pdf", token=None):
    url = f"{BASE_URL}{endpoint}"
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    
    parts = []
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'.encode())
    parts.append(f"Content-Type: {content_type}\r\n\r\n".encode())
    parts.append(file_bytes)
    parts.append(f"\r\n--{boundary}--\r\n".encode())
    
    body = b"".join(parts)
    headers = {
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body))
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(url, data=body, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(request) as resp:
            content = resp.read().decode()
            return resp.status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode()
        try:
            return e.code, json.loads(content)
        except Exception:
            return e.code, content

def create_sample_resume_pdf() -> bytes:
    # A valid PDF document containing structured resume content
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length 850 >>\nstream\n"
        b"BT\n/F1 12 Tf\n50 720 Td\n(Arjun Kumar) Tj\n"
        b"0 -16 Td\n(Email: arjun.candidate@example.com | Phone: +91 9876543210) Tj\n"
        b"0 -16 Td\n(GitHub: https://github.com/arjunkumar | LinkedIn: https://linkedin.com/in/arjunkumar) Tj\n"
        b"0 -24 Td\n(PROFESSIONAL SUMMARY) Tj\n"
        b"0 -16 Td\n(Experienced Full Stack Engineer specialized in Python, FastAPI, and scalable microservices.) Tj\n"
        b"0 -24 Td\n(TECHNICAL SKILLS) Tj\n"
        b"0 -16 Td\n(Languages and Frameworks: Python, FastAPI, React.js, TypeScript, SQL, Docker, k8s, Postgres, Redis, AWS, Git) Tj\n"
        b"0 -24 Td\n(WORK EXPERIENCE) Tj\n"
        b"0 -16 Td\n(Senior Backend Developer at CloudTech Solutions - Jan 2022 to Present) Tj\n"
        b"0 -14 Td\n(- Built distributed microservices serving 2M users using FastAPI and PostgreSQL.) Tj\n"
        b"0 -14 Td\n(- Reduced API latency by 45% using Redis caching and asynchronous queues.) Tj\n"
        b"0 -24 Td\n(EDUCATION) Tj\n"
        b"0 -16 Td\n(Bachelor of Technology in Computer Science - IIT Delhi - 2018 to 2022) Tj\n"
        b"0 -24 Td\n(PROJECTS) Tj\n"
        b"0 -16 Td\n(HireSense Platform (FastAPI, React, Docker)) Tj\n"
        b"0 -14 Td\n(- AI assisted recruitment intelligence system with real-time feedback.) Tj\n"
        b"ET\nendstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"0000000009 00000 n \n"
        b"0000000058 00000 n \n"
        b"0000000115 00000 n \n"
        b"0000000244 00000 n \n"
        b"0000001146 00000 n \n"
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n1220\n%%EOF\n"
    )

def main():
    print("=== Testing Phase 4: Resume AI ===")

    # 1. Candidate Login
    print("--- 1. Candidate Login ---")
    s, r = req_json("/auth/login", method="POST", data={
        "email": "arjun.candidate@example.com",
        "password": "CandidatePass123!",
        "expected_role": "candidate"
    })
    assert s == 200, f"Candidate login failed: {r}"
    cand_token = r["access_token"]
    print("✓ Candidate login OK")

    # 2. Recruiter Login
    print("--- 2. Recruiter Login ---")
    s, r = req_json("/auth/login", method="POST", data={
        "email": "priya.recruiter@example.com",
        "password": "SecurePassword123!",
        "expected_role": "recruiter"
    })
    assert s == 200, f"Recruiter login failed: {r}"
    rec_token = r["access_token"]
    print("✓ Recruiter login OK")

    # 3. Test Invalid Uploads
    print("\n--- 3. Testing Upload Validation ---")
    # 3a. Non-PDF file
    s, r = req_multipart("/candidates/resume", "resume.txt", b"plain text is not a pdf", content_type="text/plain", token=cand_token)
    assert s == 400, f"Expected 400 for non-pdf, got {s}: {r}"
    print("✓ Non-PDF file rejected (400):", r.get("detail"))

    # 3b. Corrupt PDF
    s, r = req_multipart("/candidates/resume", "corrupt.pdf", b"%PDF-1.4 corrupted data", token=cand_token)
    assert s == 400, f"Expected 400 for corrupt PDF, got {s}: {r}"
    print("✓ Corrupt PDF rejected (400):", r.get("detail"))

    # 4. Upload Valid Resume PDF
    print("\n--- 4. Upload Valid PDF Resume ---")
    pdf_bytes = create_sample_resume_pdf()
    s, r = req_multipart("/candidates/resume", "Arjun_Kumar_Resume.pdf", pdf_bytes, token=cand_token)
    assert s == 201, f"Upload failed ({s}): {r}"
    analysis = r
    print(f"✓ Resume successfully uploaded and analyzed! Analysis ID: {analysis['id']}")
    
    extracted = analysis["extracted_json"]
    print(f"  Extracted Name: {extracted.get('name')}")
    print(f"  Extracted Email: {extracted.get('email')}")
    print(f"  Extracted Phone: {extracted.get('phone')}")
    print(f"  Extracted Skills ({len(extracted.get('skills', []))}): {extracted.get('skills')}")
    print(f"  Extracted Education: {extracted.get('education')}")
    print(f"  Extracted Experience: {extracted.get('experience')}")
    print(f"  Extracted Links: {extracted.get('links')}")

    # Verify skill normalization:
    assert "Kubernetes" in extracted["skills"], "k8s was not normalized to Kubernetes"
    assert "PostgreSQL" in extracted["skills"], "Postgres was not normalized to PostgreSQL"
    assert "React" in extracted["skills"], "React.js was not normalized to React"
    assert "FastAPI" in extracted["skills"]
    assert "Python" in extracted["skills"]
    print("✓ Skill normalization taxonomy verified (k8s -> Kubernetes, Postgres -> PostgreSQL, React.js -> React).")

    # 5. Candidate retrieves own resume analysis
    print("\n--- 5. Candidate Retrieves Own Analysis (/candidates/me/resume) ---")
    s, r = req_json("/candidates/me/resume", token=cand_token)
    assert s == 200, f"GET /candidates/me/resume failed: {r}"
    assert r["id"] == analysis["id"]
    print(f"✓ Candidate retrieved analysis (Candidate ID: {r['candidate_id']})")

    # 6. Recruiter inspects candidate's analysis and downloads original PDF
    candidate_id = analysis["candidate_id"]
    print(f"\n--- 6. Recruiter Inspects Resume & Evidence (/candidates/{candidate_id}/resume) ---")
    s, r = req_json(f"/candidates/{candidate_id}/resume", token=rec_token)
    assert s == 200, f"Recruiter view failed: {r}"
    print(f"✓ Recruiter inspected candidate's analysis: {r['file_name']}")

    # Download original PDF
    dl_url = f"{BASE_URL}/candidates/{candidate_id}/resume/download"
    dl_req = urllib.request.Request(dl_url, headers={"Authorization": f"Bearer {rec_token}"})
    with urllib.request.urlopen(dl_req) as dl_resp:
        assert dl_resp.status == 200
        assert dl_resp.headers.get("Content-Type") == "application/pdf"
        dl_data = dl_resp.read()
        assert len(dl_data) == len(pdf_bytes)
        print(f"✓ Recruiter downloaded exact original PDF evidence ({len(dl_data)} bytes).")

    # 7. Candidate-in-the-loop Profile Correction (PUT /candidates/{id}/profile)
    print("\n--- 7. Candidate Profile Correction / Enrichment ---")
    update_payload = {
        "skills": extracted["skills"] + ["GraphQL", "Next.js"],
        "phone": "+91 9999888877",
        "education": "B.Tech Computer Science - IIT Delhi (Honors)",
        "experience_years": "3+ years"
    }
    s, r = req_json(f"/candidates/{candidate_id}/profile", method="PUT", token=cand_token, data=update_payload)
    assert s == 200, f"Profile update failed: {r}"
    assert "GraphQL" in r["skills"]
    assert r["phone"] == "+91 9999888877"
    assert r["education"] == "B.Tech Computer Science - IIT Delhi (Honors)"
    print("✓ Candidate profile successfully corrected / enriched via candidate-in-the-loop endpoint.")

    print("\n🎉 ALL PHASE 4 BACKEND TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    main()
