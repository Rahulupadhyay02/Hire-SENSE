# 🧠 HireSense Backend — Architecture & Admin Guide

Welcome to the **HireSense Backend** documentation. This guide details what has been built, how the architecture works, and step-by-step instructions for **Admins and Developers** to access, manage, and verify the backend services.

---

## 📌 1. What Has Been Built (Phases 1–6 Complete)

The backend is built with **FastAPI**, **SQLAlchemy ORM**, **Pydantic V2**, and **JWT Authentication**:

- **Framework**: FastAPI (high-performance asynchronous Python API framework)
- **Database Engine**: SQLAlchemy ORM with SQLite for zero-config local development (`hiresense.db`) and instant PostgreSQL compatibility via `DATABASE_URL`.
- **Database Models & Relationships**:
  - `User`: Recruiter, Candidate, and Admin accounts.
  - `Job`: Job postings with title, description, required skills, preferred skills, experience, and status (`active`, `draft`, `closed`).
  - `Candidate`: Candidate profiles with verified skills, education, and experience.
  - `Application`: Application submissions linking candidates to jobs with status pipeline (`Pending`, `Reviewing`, `Shortlisted`, `Hold`, `Rejected`).
  - `ResumeAnalysis`: Structured resume intelligence extracted from candidate PDFs with original file metadata, raw text, and canonical skill taxonomy normalization.
  - `MatchScore`: Phase 5 matching AI model with overall score, 4-factor component scores, structured explainability JSON, narrative explanation, and recruiter override tracking.
- **AI & Resume Intelligence (Phase 4)**:
  - High-precision PDF text extraction using `pypdf`.
  - Section segmentation (Work Experience, Education, Skills, Projects, Certifications, Summary).
  - Canonical Skill Taxonomy normalization (150+ tech terms: `k8s` → `Kubernetes`, `react.js` → `React`, `postgres` → `PostgreSQL`, etc.).
  - Evidence preservation: Raw PDF files saved in `backend/uploads/resumes/` for auditability.
  - Human-in-the-loop candidate correction (`PUT /candidates/{id}/profile`).
- **Job–Candidate Matching AI & Explainability Engine (Phase 5)**:
  - Multi-factor deterministic scoring formula:
    $$\text{Overall} = 0.45 \times \text{Skills} + 0.20 \times \text{Experience} + 0.20 \times \text{Projects} + 0.15 \times \text{Coverage}$$
  - **Responsible AI & Bias Guardrails**: Strictly excludes all sensitive demographic traits (Name, Gender, Photo, Age, Phone, Email, Location/Nationality) from scoring calculations.
  - Full Itemized Explainability Matrix: Evaluates each required and preferred skill with explicit statuses (`✓ matched`, `⚠ unclear`, `✕ missing`) alongside cited evidence excerpts from project records.
  - **Recruiter Manual Override**: Recruiter score calibration with documented justification and audit trail.
- **Interview Upload & Speech-to-Text Pipeline (Phase 6)**:
  - Full media upload endpoint accepting **Video** (MP4, WebM, MOV, AVI, MKV) and **Audio** (MP3, WAV, M4A, OGG, FLAC, AAC) formats up to 500 MB.
  - **Background processing** using Python `ThreadPoolExecutor` — uploads return immediately, transcription runs non-blocking.
  - **FFmpeg integration** (optional): Auto-extracts audio from video containers for transcription.
  - **Whisper STT** (local `openai-whisper` package): Generates full transcript + timestamped segment list `[{start, end, text}]`.
  - **Mock STT fallback**: If `openai-whisper` is not installed, a deterministic mock transcript is returned — zero dependency on external services for dev/CI.
  - **Interview status machine**: `uploaded → queued → processing → completed / failed` — live-pollable by frontend.
  - **Authorization**: Candidates can only access their own interview recordings; recruiters access interviews for their job applications; admin has full access.
  - **Responsible AI Notice**: All transcripts are clearly labeled as AI-generated and subject to review.
- **Authentication & Security**:
  - `bcrypt` password hashing (passwords are **never** stored in plain text).
  - Signed JSON Web Tokens (JWT) using `HS256` with 24-hour expiration.
  - Role-Based Access Control (RBAC): `recruiter`, `candidate`, and `admin`.
  - Route guards: `require_recruiter`, `require_candidate`, and `get_current_user`.
  - Cross-portal unauthorized access prevention.
- **CORS Middleware**: Pre-configured for Vite React frontend (`http://localhost:5173` and `http://localhost:3000`).
- **Automated Table Creation**: Tables are verified and created on startup via FastAPI application lifespan.
- **Seed Data & Testing**: Seed utilities (`seed_data.py`, `create_admin.py`) and automated test suites (`test_phase4.py`, `test_phase5_matching.py`, `test_phase6_interviews.py`).

### Project Structure
```
backend/
├── app/
│   ├── config.py             # Environment configuration & settings
│   ├── database.py           # SQLAlchemy database engine & session dependency
│   ├── main.py               # FastAPI app entrypoint, CORS, routers
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py           # User model (recruiter, candidate, admin)
│   │   ├── job.py            # Job model (title, skills, experience, status)
│   │   ├── candidate.py      # Candidate profile model
│   │   ├── application.py    # Application model & status pipeline
│   │   ├── resume_analysis.py# PDF resume extraction & evidence model
│   │   ├── match_score.py    # Phase 5 MatchScore model & override tracking
│   │   └── interview.py      # Phase 6 Interview model & InterviewStatus enum
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py           # Authentication & login endpoints
│   │   ├── jobs.py           # Job CRUD & job applicants lookup
│   │   ├── applications.py   # Application pipeline, Phase 5 analyze & match, Phase 6 interviews list
│   │   ├── candidates.py     # Candidate profiles lookup
│   │   ├── resumes.py        # Resume PDF upload, download, and profile correction
│   │   └── interviews.py     # Phase 6 interview upload, status, transcript, delete
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── user.py           # User & auth validation schemas
│   │   ├── job.py            # Job validation & response schemas
│   │   ├── candidate.py      # Candidate response schemas
│   │   ├── application.py    # Application response schemas
│   │   ├── resume_analysis.py# Resume parsing & extraction schemas
│   │   ├── match.py          # Phase 5 match score & override schemas
│   │   └── interview.py      # Phase 6 interview upload, status & transcript schemas
│   ├── services/
│   │   ├── __init__.py
│   │   ├── resume_parser.py  # Phase 4 PDF extraction & skill normalization
│   │   ├── matcher.py        # Phase 5 multi-factor explainable matching engine
│   │   ├── stt_service.py    # Phase 6 Whisper STT abstraction (real + mock fallback)
│   │   └── interview_processor.py # Phase 6 background processing pipeline
│   └── utils/
│       ├── __init__.py
│       ├── deps.py           # Security dependencies (get_current_user, require_recruiter)
│       └── security.py       # Bcrypt hashing & PyJWT token generator
├── scratch/
│   ├── test_phase4.py        # Phase 4 integration test suite
│   └── test_phase5_matching.py # Phase 5 matching & explainability test suite
├── create_admin.py           # Admin account creation / seeding CLI script
├── seed_data.py              # Sample jobs, candidates, applications & match scores seed
├── hiresense.db              # Local SQLite database file
├── requirements.txt          # Python dependencies
└── README.md                 # This guide
```

---

## 🔑 2. Admin Quick Start & How to Access

### Step 1: Open the Interactive Admin API Documentation
FastAPI provides auto-generated, interactive Swagger UI documentation where you can test any endpoint directly from your browser:

- **Swagger UI (Interactive)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc (Specification view)**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

### Step 2: Pre-Seeded Admin Credentials
A default Admin user has been initialized in the database:

| Field | Value |
|---|---|
| **Email** | `admin@hiresense.com` |
| **Password** | `AdminPassword123!` |
| **Role** | `admin` |

*(You can also use the Recruiter account: `priya.recruiter@example.com` / `SecurePassword123!` or Candidate account: `arjun.candidate@example.com` / `CandidatePass123!`)*

---

### Step 3: Authenticating as Admin in Swagger UI (`/docs`)

1. Go to [http://localhost:8000/docs](http://localhost:8000/docs).
2. Expand the `POST /api/v1/auth/login` endpoint.
3. Click **"Try it out"**, enter the admin credentials:
   ```json
   {
     "email": "admin@hiresense.com",
     "password": "AdminPassword123!"
   }
   ```
4. Click **Execute**. The server will return your access token:
   ```json
   {
     "access_token": "eyJhbGciOi...",
     "token_type": "bearer",
     "user": {
       "id": 3,
       "name": "System Administrator",
       "email": "admin@hiresense.com",
       "role": "admin"
     }
   }
   ```
5. Copy the `access_token` string (without quotes).
6. Scroll to the top of Swagger UI and click the green **"Authorize"** button (with the lock icon 🔓).
7. Paste your token into the **Value** box and click **Authorize**.
8. Now you can execute any protected endpoint (like `GET /api/v1/auth/me`, `/test-recruiter`, or `/test-candidate`), and Swagger will automatically include your Bearer token!

---

### Step 4: Creating or Resetting an Admin via Command Line
If you want to create a custom admin account or reset an existing admin's password:

```bash
# Navigate to backend directory
cd /Users/rahulupadhyay/Desktop/HireSense/backend

# Run the create_admin utility
./venv/bin/python create_admin.py "myadmin@hiresense.com" "Lead Admin" "MySecretPassword123!"
```

Output:
```
[✓] Admin account created successfully!
--- ADMIN CREDENTIALS ---
Email:    myadmin@hiresense.com
Password: MySecretPassword123!
Role:     admin
-------------------------
```

---

## 🗄️ 3. Database Architecture, Schema & Connection Guide

### 🏗️ What Was Built in the Database Layer
- **ORM**: Built on **SQLAlchemy 2.0** using declarative class mapping.
- **Engine**: Zero-configuration local database using **SQLite** (`backend/hiresense.db`).
- **Connection URL**: Configured via `app/config.py`: `sqlite:///./hiresense.db`.
- **Thread Safety**: Initialized with `check_same_thread=False` to safely support concurrent async requests in FastAPI without thread locking.
- **Session Management**: Handled via the `get_db()` dependency generator in `app/database.py`, ensuring sessions are cleanly committed and automatically closed after each request, preventing memory leaks and dangling locks.
- **Auto-Provisioning**: Tables are automatically verified and created on server startup via `Base.metadata.create_all(bind=engine)` inside FastAPI's lifespan event.

---

### 📋 Current Table Schema: `users`
The `users` table holds all user credentials, profiles, and permissions.

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'recruiter', 'candidate', or 'admin'
    is_active BOOLEAN NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE INDEX ix_users_id ON users (id);
```

#### Field Details:
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `INTEGER` | Primary Key, Auto-increment | Unique system identifier for the user. |
| `name` | `VARCHAR(120)` | `NOT NULL` | Full display name. |
| `email` | `VARCHAR(255)` | `NOT NULL`, `UNIQUE`, Indexed | Login email (always stored and compared in lowercase). |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Secure salted Bcrypt hash. **Never plaintext.** |
| `role` | `VARCHAR(20)` | `NOT NULL` | Role enum: `recruiter`, `candidate`, or `admin`. |
| `is_active` | `BOOLEAN` | `NOT NULL`, Default `1` | Soft-disable flag. If `0`, login is blocked. |
| `created_at` | `DATETIME` | Server default (UTC) | Registration timestamp. |
| `updated_at` | `DATETIME` | Auto-update (UTC) | Timestamp of last account modification. |

---

### 🔌 How to Connect and Inspect the Database

#### Method 1: Using the Terminal (`sqlite3` CLI)
You can directly query the database file using the built-in macOS `sqlite3` tool:

```bash
# 1. Open the database in SQLite CLI
sqlite3 /Users/rahulupadhyay/Desktop/HireSense/backend/hiresense.db

# 2. (Optional) Turn on pretty table formatting
.headers on
.mode column

# 3. View all tables
.tables

# 4. View users table schema
.schema users

# 5. Query all users
SELECT id, name, email, role, is_active, created_at FROM users;

# 6. Exit SQLite prompt
.exit
```

**Quick One-Liner (runs query and immediately exits):**
```bash
sqlite3 /Users/rahulupadhyay/Desktop/HireSense/backend/hiresense.db ".mode column" ".headers on" "SELECT id, name, email, role, created_at FROM users;"
```

---

#### Method 2: Using Python Shell / Script
You can query using the application's own SQLAlchemy models:

```bash
cd /Users/rahulupadhyay/Desktop/HireSense/backend

# Print all users in a readable format
./venv/bin/python -c "
from app.database import SessionLocal
from app.models.user import User

db = SessionLocal()
for u in db.query(User).all():
    print(f'ID: {u.id:<3} | Role: {u.role.value:<10} | Email: {u.email:<30} | Name: {u.name}')
db.close()
"
```

---

#### Method 3: Using a GUI Database Client (Recommended for Visual Inspection)
You can open `backend/hiresense.db` in any visual database manager:
- **VS Code Extension**: "SQLite Viewer" or "SQLTools SQLite"
- **Free GUI Apps**: [TablePlus](https://tableplus.com/), [DB Browser for SQLite](https://sqlitebrowser.org/), or [DBeaver](https://dbeaver.io/)

**Connection Settings for GUI:**
- **Connection Type**: `SQLite`
- **Database File Path**: `/Users/rahulupadhyay/Desktop/HireSense/backend/hiresense.db`
- *(No username, password, or port required).*

---

### 🐘 How to Connect to PostgreSQL (Production / Team Setup)
HireSense is 100% database-agnostic through SQLAlchemy. To switch from SQLite to PostgreSQL:

1. Install the PostgreSQL driver in your virtual environment:
   ```bash
   ./venv/bin/pip install psycopg2-binary
   ```
2. Create or edit `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:mysecretpassword@localhost:5432/hiresense
   ```
3. Restart the backend server. SQLAlchemy will automatically connect to PostgreSQL and create the tables if they don't already exist!

---

### ⚠️ Important Database Rules & Administrative Operations

1. **Password Security**:
   - Never insert passwords directly into the DB using SQL `INSERT` statements unless pre-hashed with Bcrypt.
   - Always use `create_admin.py` or the `/auth/register` endpoint to create accounts.
2. **Email Normalization**:
   - The application automatically lowercases and strips whitespace from emails upon registration and login.
3. **Backing Up the Database**:
   - Because SQLite is a single file, you can create a complete instant backup anytime:
     ```bash
     cp /Users/rahulupadhyay/Desktop/HireSense/backend/hiresense.db /Users/rahulupadhyay/Desktop/HireSense/backend/hiresense_backup_$(date +%Y%m%d).db
     ```
4. **Resetting to a Clean State**:
   - If you ever want to completely wipe the test data and start fresh:
     ```bash
     # 1. Stop backend if running
     # 2. Delete the database file
     rm /Users/rahulupadhyay/Desktop/HireSense/backend/hiresense.db
     
     # 3. Seed fresh admin account (this automatically recreates the database and tables)
     ./venv/bin/python create_admin.py
     ```

---

## 🌐 4. API Endpoints Reference

### Public Endpoints
- `GET /health` — Check server status (`{"status": "ok", "app": "HireSense API", "version": "1.0.0"}`)
- `POST /api/v1/auth/register` — Create a new Recruiter or Candidate account.
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "role": "recruiter"
  }
  ```
- `POST /api/v1/auth/login` — Authenticate and receive a JWT token (supports role protection).
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "expected_role": "recruiter"
  }
  ```
  *(Note: If `expected_role` is provided, accounts with a mismatched role are denied with `HTTP 403 Forbidden` to prevent cross-portal unauthorized access. Admins are exempt and can access any portal).*

### Protected Endpoints (Requires `Authorization: Bearer <token>`)

#### User Profile:
- `GET /api/v1/auth/me` — Inspect profile of the authenticated user.

#### Jobs Management:
- `POST /api/v1/jobs` — Create a new job posting (Recruiter or Admin only).
  ```json
  {
    "title": "Senior Python Developer",
    "description": "Lead development of our FastAPI microservices.",
    "experience": "2+ years",
    "required_skills": ["Python", "FastAPI", "SQL", "Docker"],
    "preferred_skills": ["AWS", "Redis"],
    "status": "active"
  }
  ```
- `GET /api/v1/jobs` — List all open jobs (supports `?status=active` and `?search=python`).
- `GET /api/v1/jobs/{id}` — Get detailed job posting with real-time application and shortlist counts.
- `PUT /api/v1/jobs/{id}` — Update job description, skills, or status.
- `DELETE /api/v1/jobs/{id}` — Delete or close a job posting.
- `GET /api/v1/jobs/{id}/applications` — View all candidates who applied to this specific job.

#### Candidates & Applications:
- `GET /api/v1/applications` — List all applications (supports `?status=Shortlisted` and `?job_id=1`).
- `PATCH /api/v1/applications/{id}/status` — Update candidate hiring status (Recruiter or Admin only).
  ```json
  {
    "status": "Shortlisted",
    "notes": "Strong background in FastAPI and PostgreSQL."
  }
  ```
- `POST /api/v1/applications` — Candidate applies to a job (`{"job_id": 1}`).
- `GET /api/v1/candidates` — List candidate profiles (Recruiter or Admin only).
- `GET /api/v1/candidates/{id}` — View detailed candidate profile with resume highlights.

#### Resume AI & Evidence (Phase 4):
- `POST /api/v1/candidates/resume` — Upload candidate PDF resume (multipart/form-data).
  - Validates format (`.pdf`) and size (&le; 10MB).
  - Extracts text via `pypdf`, performs section segmentation, and normalizes skills via taxonomy.
  - Saves original PDF to `backend/uploads/resumes/` for recruiter auditability.
  - Updates candidate skills, education, and structured profile JSON.
- `GET /api/v1/candidates/me/resume` — Candidate retrieves their latest structured resume analysis.
- `GET /api/v1/candidates/{id}/resume` — Recruiter/Admin inspects candidate's structured resume analysis.
- `GET /api/v1/candidates/{id}/resume/download` — Download exact original PDF uploaded by candidate for evidence verification.
- `PUT /api/v1/candidates/{id}/profile` — **Candidate-in-the-loop**: Allows candidates to correct, add, or edit missing or misparsed fields (phone, education, skills, experience).

#### Job–Candidate Matching AI & Explainability (Phase 5):
- `POST /api/v1/applications/{id}/analyze` — Run or re-calculate explainable AI matching on an application (Recruiter or Admin only).
  - Evaluates Skills (45%), Experience (20%), Project Evidence (20%), and Requirement Coverage (15%).
  - Returns overall score, component scores, full explainability matrix with citations, and AI evaluation narrative.
- `GET /api/v1/applications/{id}/match` — Retrieve structured match score & explainability breakdown (accessible by Recruiter or Candidate for their own application).
  - Auto-computes match fit on-the-fly if not already stored.
  - Response Schema:
    ```json
    {
      "id": 1,
      "application_id": 1,
      "overall_score": 86.4,
      "skills_score": 90.0,
      "experience_score": 100.0,
      "projects_score": 80.0,
      "coverage_score": 80.0,
      "components": {
        "formula": "Overall = 0.45 × Skills + 0.20 × Experience + 0.20 × Projects + 0.15 × Coverage",
        "skills_matrix": [
          {
            "skill": "Python",
            "category": "required",
            "status": "matched",
            "evidence": "Explicitly listed in verified candidate skills as 'Python'"
          },
          {
            "skill": "FastAPI",
            "category": "required",
            "status": "matched",
            "evidence": "Demonstrated in project records: '...High throughput REST backend written in Python with FastAPI...'"
          },
          {
            "skill": "AWS",
            "category": "preferred",
            "status": "missing",
            "evidence": "Not found in skills inventory or project details"
          }
        ],
        "sensitive_attributes_excluded": ["name", "gender", "photo", "age", "phone", "email", "location", "nationality"]
      },
      "explanation": "HireSense Match Analysis: 86.4%...",
      "is_overridden": false,
      "override_reason": null
    }
    ```
- `POST /api/v1/applications/{id}/match/override` — **Recruiter Score Calibration**: Recruiter manually adjusts the overall score with mandatory documented justification:
  ```json
  {
    "override_score": 94.5,
    "reason": "Demonstrated exceptional system design and coding competence in live interview."
  }
  ```
  *(Audit trail records `is_overridden: true`, `override_reason`, and `overridden_by` recruiter ID).*

---

### 🎙️ Phase 6 — Interview Upload & Speech-to-Text API

- `POST /api/v1/interviews/upload` — **Upload Interview Media** (multipart/form-data):
  ```
  Form fields:
    file: <binary>          — Video or audio file
    application_id: <int>   — Target application ID
  ```
  Supported formats: `video/mp4`, `video/webm`, `video/quicktime`, `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/ogg`, `audio/flac`, `audio/aac`. Max size: **500 MB**.

  Response (201 Created):
  ```json
  {
    "id": 4,
    "application_id": 2,
    "original_filename": "interview_response.mp3",
    "file_type": "audio/mpeg",
    "file_size_bytes": 4800000,
    "status": "queued"
  }
  ```
  *(Background processing begins immediately — poll status to track progress.)*

- `GET /api/v1/interviews/{id}` — **Get Interview Status & Metadata** (returns full record including transcript when completed):
  ```json
  {
    "id": 4,
    "status": "completed",
    "transcript": "Hello, thank you for having me...",
    "transcript_segments": [
      {"start": 0.0, "end": 5.1, "text": "Hello, thank you for having me..."},
      ...
    ],
    "duration_seconds": 53.0,
    "processing_error": null
  }
  ```

- `GET /api/v1/interviews/{id}/transcript` — **Get Full Transcript** (only when status = `completed`, authorized users only):

- `GET /api/v1/applications/{id}/interviews` — **List All Interviews** for a specific application (returns metadata list, no transcript body):

- `DELETE /api/v1/interviews/{id}` — **Delete Interview** (Recruiter/Admin only). Removes DB record and stored file.

**Interview Status Flow:**
```
uploaded → queued → processing → completed
                              ↘ failed
```

**STT Configuration** (in `.env`):
```env
STT_MODEL=base          # Whisper model: tiny | base | small | medium | large
INTERVIEW_UPLOADS_DIR=uploads/interviews
MAX_UPLOAD_SIZE_MB=500
```

---

### 📊 Phase 7 — Interview Communication Metrics Engine

Phase 7 analyzes completed interview transcripts and generates structured, explainable, and deterministic **communication quality metrics** without requiring external LLM dependencies:

#### Metrics Computed:
| Metric | Description | Benchmark / Scale |
|---|---|---|
| **Speaking Pace (WPM)** | Words per minute calculated from word count and audio duration | Ideal: 120–160 WPM |
| **Filler Word Rate (%)** | Percentage of filler words & phrases (`um`, `uh`, `like`, `you know`, etc.) | Target: < 3.0% |
| **Answer Structure** | Heuristic evaluation of STAR methodology (Situation, Task, Action, Result) | 0–100 score |
| **Clarity Score** | Type-token lexical diversity ratio combined with sentence length balance | 0–100 score |
| **Relevance Score** | Semantic keyword overlap with the job posting's required skills | 0–100 score |
| **Overall Communication Score** | Weighted composite: `0.25×pace + 0.20×filler + 0.25×structure + 0.15×clarity + 0.15×relevance` | 0–100 indexed score |

#### Phase 7 API Endpoints:
- `GET /api/v1/interviews/{id}/metrics` — Full communication metrics, strengths, improvements, and radar breakdown.
- `POST /api/v1/interviews/{id}/recompute-metrics` — Recalculates metrics deterministically from existing transcript.
- `GET /api/v1/applications/{app_id}/communication-summary` — Aggregated communication summary, latest metrics, and longitudinal trend history.
- `GET /api/v1/applications/{app_id}/interviews` — Lists application interviews with `communication_score` for fast badges.

#### Coaching & Explainability Features:
- **Strengths Generator**: Automatically creates 2–4 concrete evidence points on speech pace, clarity, and job skill coverage.
- **Actionable Improvements**: Prioritizes coaching recommendations with current vs. target metrics and concrete actions.
- **Competency Radar**: 5-axis dimensional breakdown (Relevance, Structure, Fluency, Clarity, Pace) visualized via Recharts.
- **Attempt History Tracking**: Tracks progress across repeated practice attempts for candidates.

---

## ⚙️ 5. Server Management (Start, Stop, Restart)

### How to start the backend server manually:
```bash
cd /Users/rahulupadhyay/Desktop/HireSense/backend
./venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Running Automated Test Suites:
```bash
cd /Users/rahulupadhyay/Desktop/HireSense/backend
./venv/bin/python scratch/test_phase4.py            # Phase 4: Resume AI & Ingestion
./venv/bin/python scratch/test_phase5_matching.py  # Phase 5: Matching AI & Explainability
./venv/bin/python scratch/test_phase6_interviews.py # Phase 6: Interview Upload & STT (27 tests)
./venv/bin/python scratch/test_phase7_metrics.py    # Phase 7: Communication Metrics (37 tests)
```

### Switching to PostgreSQL in Production:
Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hiresense
JWT_SECRET=your-production-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```
FastAPI will automatically load these variables via `pydantic-settings` without changing a single line of application code!

---

## 🚀 6. Next Steps Roadmap
- [x] **Phase 1**: Application foundation (React + FastAPI health check).
- [x] **Phase 2**: Database & role-based authentication (Recruiter, Candidate, Admin).
- [x] **Phase 3**: Recruiter workflow (Jobs CRUD, application pipeline, candidate profiles).
- [x] **Phase 4**: Resume AI (PDF ingestion, section segmentation, skill normalization taxonomy, evidence audit, candidate-in-the-loop).
- [x] **Phase 5**: Explainable job–candidate matching algorithm.
- [x] **Phase 6**: Speech-to-Text with Whisper & background async processing pipeline.
- [x] **Phase 7**: Interview communication quality metrics (WPM, filler rate, STAR structure, clarity, relevance, radar chart & trend analytics).
- [ ] **Phase 8 & 9**: Unified candidate report & candidate feedback loop.
- [ ] **Phase 10**: Testing, AI evaluation dataset & user validation.
- [ ] **Phase 11 & 12**: Deployment, operations & final MVP demo.

