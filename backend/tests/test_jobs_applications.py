from fastapi import status
from app.models.job import JobStatus
from app.models.application import ApplicationStatus

def test_recruiter_create_job_success(client, recruiter_headers):
    payload = {
        "title": "Senior Python Backend Engineer",
        "description": "Looking for a FastAPI and PostgreSQL expert.",
        "experience": "3+ years",
        "required_skills": ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL"],
        "preferred_skills": ["Docker", "Redis", "Celery"],
        "status": "active"
    }
    response = client.post("/api/v1/jobs", json=payload, headers=recruiter_headers)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Senior Python Backend Engineer"
    assert "id" in data
    assert data["required_skills"] == ["Python", "FastAPI", "SQLAlchemy", "PostgreSQL"]

def test_candidate_cannot_create_job(client, candidate_headers):
    payload = {
        "title": "Unauthorized Job",
        "description": "Attempted by candidate",
        "experience": "1 year",
        "required_skills": ["Python"],
        "status": "active"
    }
    response = client.post("/api/v1/jobs", json=payload, headers=candidate_headers)
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_list_jobs(client, recruiter_headers):
    # First create a job
    payload = {
        "title": "Full Stack React/Python",
        "description": "Modern web stack",
        "experience": "2+ years",
        "required_skills": ["React", "Python"],
        "status": "active"
    }
    client.post("/api/v1/jobs", json=payload, headers=recruiter_headers)
    
    response = client.get("/api/v1/jobs", headers=recruiter_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1

def test_candidate_apply_to_job(client, recruiter_headers, candidate_headers):
    # Create active job
    job_payload = {
        "title": "Data Engineer",
        "description": "ETL and data pipelines",
        "experience": "2+ years",
        "required_skills": ["Python", "SQL"],
        "status": "active"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    # Candidate applies
    app_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    assert app_res.status_code == status.HTTP_201_CREATED
    app_data = app_res.json()
    assert app_data["job_id"] == job_id
    assert app_data["status"] == "Pending"

def test_candidate_duplicate_apply_fails(client, recruiter_headers, candidate_headers):
    job_payload = {
        "title": "QA Engineer",
        "description": "Testing automated pipelines",
        "experience": "1+ years",
        "required_skills": ["Python", "Selenium"],
        "status": "active"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    # First application
    client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    
    # Second application to same job
    dup_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    assert dup_res.status_code == status.HTTP_400_BAD_REQUEST
    assert "already applied" in dup_res.json()["detail"]

def test_recruiter_update_application_status(client, recruiter_headers, candidate_headers):
    job_payload = {
        "title": "DevOps Engineer",
        "description": "Kubernetes and Terraform",
        "experience": "3+ years",
        "required_skills": ["Docker", "Kubernetes"],
        "status": "active"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    app_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    app_id = app_res.json()["id"]

    # Recruiter updates status
    patch_res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "Shortlisted", "notes": "Strong background in containers"},
        headers=recruiter_headers
    )
    assert patch_res.status_code == status.HTTP_200_OK
    assert patch_res.json()["status"] == "Shortlisted"

def test_candidate_cannot_update_application_status(client, recruiter_headers, candidate_headers):
    job_payload = {
        "title": "Security Analyst",
        "description": "Application security",
        "experience": "2+ years",
        "required_skills": ["Cybersecurity"],
        "status": "active"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    app_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    app_id = app_res.json()["id"]

    # Candidate attempts to change their own status to 'Shortlisted'
    patch_res = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "Shortlisted"},
        headers=candidate_headers
    )
    assert patch_res.status_code == status.HTTP_403_FORBIDDEN

def test_candidate_cannot_view_other_candidate_application(client, recruiter_headers, candidate_headers, candidate_headers_2):
    job_payload = {
        "title": "ML Engineer",
        "description": "PyTorch models",
        "experience": "2+ years",
        "required_skills": ["Python", "PyTorch"],
        "status": "active"
    }
    job_res = client.post("/api/v1/jobs", json=job_payload, headers=recruiter_headers)
    job_id = job_res.json()["id"]

    # Candidate 1 applies
    app_res = client.post("/api/v1/applications", json={"job_id": job_id}, headers=candidate_headers)
    app_id = app_res.json()["id"]

    # Candidate 2 attempts to view candidate 1's application
    view_res = client.get(f"/api/v1/applications/{app_id}", headers=candidate_headers_2)
    assert view_res.status_code == status.HTTP_403_FORBIDDEN
