from fastapi import status
from app.models.user import User

def test_register_recruiter_success(client):
    payload = {
        "name": "David Recruiter",
        "email": "david.new@hiresense.internal",
        "password": "SecurePassword123!",
        "role": "recruiter"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "david.new@hiresense.internal"
    assert data["user"]["role"] == "recruiter"

def test_register_candidate_success(client):
    payload = {
        "name": "Maria Candidate",
        "email": "maria.candidate@hiresense.internal",
        "password": "SecurePassword123!",
        "role": "candidate"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["user"]["role"] == "candidate"

def test_register_duplicate_email_fails(client, recruiter_user):
    payload = {
        "name": "Duplicate User",
        "email": recruiter_user.email,
        "password": "Password123!",
        "role": "recruiter"
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == status.HTTP_400_BAD_REQUEST
    assert "already exists" in response.json()["detail"]

def test_login_success(client, recruiter_user):
    payload = {
        "email": recruiter_user.email,
        "password": "RecruiterPass123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == recruiter_user.email

def test_login_invalid_password_fails(client, recruiter_user):
    payload = {
        "email": recruiter_user.email,
        "password": "WrongPassword999!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_login_nonexistent_email_fails(client):
    payload = {
        "email": "does.not.exist@hiresense.internal",
        "password": "Password123!"
    }
    response = client.post("/api/v1/auth/login", json=payload)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user_me_success(client, recruiter_headers, recruiter_user):
    response = client.get("/api/v1/auth/me", headers=recruiter_headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == recruiter_user.email
    assert data["role"] == "recruiter"

def test_get_current_user_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_get_current_user_me_invalid_token(client):
    response = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.token.value"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
