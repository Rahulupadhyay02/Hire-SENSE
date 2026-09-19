# HireSense — Phase 0→12 Implementation Plan

> **Planning Date:** 10 Sep 2026 | **MVP Target:** 20 Nov 2026  
> **Documents Read:** `HireSense_A_to_Z_Complete_Project_Guide.docx` + `HireSense_Phase_0_to_12_Complete_Build_Roadmap.docx`

---

## What Is HireSense?

An **AI-assisted hiring support platform** with two sides:

| Side | User | Core Promise |
|---|---|---|
| Recruiter | HR teams / Hiring managers | Structured, explainable view of candidate–job fit & interview evidence |
| Candidate | Final-year students / Job seekers | Actionable interview-performance feedback |

> **Key constraint:** AI is decision-support only. The recruiter makes the final hire/reject decision.

---

## My Overall Build Approach

### Strategy: Workflow First → AI Layers Second

```
Phase 0   → Freeze scope & design
Phase 1   → Shell (React + FastAPI running)
Phase 2   → Database + Auth
Phase 3   → Core recruiter workflow (jobs, candidates, applications)
Phase 4   → Resume AI (PDF → structured profile)
Phase 5   → Matching AI (job ↔ candidate score + explanation)
Phase 6   → Interview upload + Speech-to-Text
Phase 7   → Interview / Communication intelligence
Phase 8   → Unified AI report + human review panel
Phase 9   → Candidate feedback loop
Phase 10  → Testing + AI evaluation + user validation
Phase 11  → Deployment, security, monitoring
Phase 12  → Final demo, evidence freeze, KPI dashboard
```

The core principle: **build the hiring workflow first, then inject AI one layer at a time**. Each phase has clear acceptance criteria before moving forward.

---

## Tech Stack Decision

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React + Vite** | Fast, modern, dashboard-friendly |
| Styling | **Tailwind CSS** | Rapid utility-first UI (recruiter dashboards need dense info) |
| Backend | **FastAPI (Python)** | Async, fast, great for AI pipelines |
| Database | **PostgreSQL** | Relational — jobs/candidates/applications have clear relationships |
| Auth | **JWT + bcrypt** | Stateless, role-based |
| File Storage | **Local (dev) → S3-compatible (prod)** | PDFs, audio, video |
| Resume Parsing | **pdfplumber + LLM (GPT-4o / Gemini)** | Deterministic first, semantic second |
| Matching | **Weighted scoring + semantic similarity** | Explainable, auditable |
| Speech-to-Text | **OpenAI Whisper (local) / Whisper API** | Pluggable provider |
| Interview AI | **LLM with rubric prompts** | Observable metrics only |
| Background Jobs | **Celery + Redis** | Long-running file processing |
| Containerization | **Docker + Docker Compose** | Reproducible dev & deployment |

---

## Phase-by-Phase Build Outline

---

### ✅ Phase 0 — Scope, Validation & Product Design
**Duration:** 10–13 Sep 2026

**What we build (docs, not code):**
- Problem statement + target user personas
- Recruiter journey map (20-stage → V1 response)
- Candidate journey map
- P0/P1/P2 feature prioritization
- Functional + non-functional requirements
- Wireframes: recruiter dashboard, candidate dashboard, job form, report page
- System architecture diagram
- Database schema design
- AI output schemas (defined before models are selected)
- Responsible AI checklist
- Customer interview + validation plan

**Acceptance criteria:**
- [ ] Problem statement approved
- [ ] MVP feature list frozen
- [ ] 2 user journeys documented
- [ ] Architecture/DB/API plans exist
- [ ] Acceptance criteria exist for every P0 feature

---

### 🏗️ Phase 1 — Application Foundation
**Duration:** 14–17 Sep 2026

**What we build:**
```
HireSense/
├── frontend/          ← React + Vite
├── backend/           ← FastAPI
├── ai/                ← AI pipeline stubs
├── data/              ← Resumes, interviews, test cases
└── docs/              ← Architecture, wireframes
```

**Backend:**
- FastAPI project setup with Uvicorn
- `GET /health → {"status": "ok"}`
- CORS configured for frontend

**Frontend:**
- React + Vite + React Router
- Placeholder pages: Landing, Login, Register, Recruiter Dashboard, Candidate Dashboard
- Axios/fetch configured to hit backend

**Acceptance criteria:**
- [ ] React runs locally (`npm run dev`)
- [ ] FastAPI runs locally (`uvicorn`)
- [ ] Frontend can call backend `/health`
- [ ] Git repo initialized with clean folder structure
- [ ] README with clean-machine setup steps

---

### 🗄️ Phase 2 — Database & Authentication
**Duration:** 17–20 Sep 2026

**What we build:**

**Database (PostgreSQL + SQLAlchemy):**
```sql
users: id, name, email, password_hash, role, created_at, updated_at
-- Roles: RECRUITER | CANDIDATE | ADMIN
```

**Auth API:**
```
POST /auth/register   → hash password → save user
POST /auth/login      → verify → issue JWT
GET  /me              → validate token → return current user
```

**Route protection:**
- Recruiter-only routes (`Depends(require_recruiter)`)
- Candidate-only routes (`Depends(require_candidate)`)
- Ownership checks on objects

**Acceptance criteria:**
- [ ] Recruiter can register + login
- [ ] Candidate can register + login
- [ ] Passwords never stored in plaintext
- [ ] Role permissions enforced on API routes
- [ ] Users cannot access unauthorized records

---

### 💼 Phase 3 — Recruiter Workflow
**Duration:** 21–27 Sep 2026

**What we build:**

**DB Tables:**
```sql
jobs: id, recruiter_id, title, description, experience, required_skills, preferred_skills, status
applications: id, job_id, candidate_id, status, created_at
candidates: id, user_id, profile_json, created_at
```

**API routes:**
```
POST   /jobs                     → create job
GET    /jobs                     → list recruiter's jobs
GET    /jobs/{id}                → job detail
PUT    /jobs/{id}                → update job
POST   /applications             → create application
GET    /jobs/{id}/applications   → list applications
GET    /candidates/{id}          → candidate profile
```

**Frontend pages:**
- Recruiter Dashboard (job list, stats)
- Create/Edit Job form (title, description, required skills, preferred skills, experience)
- Job detail + applications list
- Candidate profile page

**Acceptance criteria:**
- [ ] Recruiter can create a job
- [ ] Recruiter can see applications for their jobs
- [ ] Candidate profile page opens
- [ ] Application status can be changed (Pending / Reviewing / Shortlisted / Rejected)
- [ ] No AI required yet

---

### 📄 Phase 4 — Resume AI
**Duration:** 28 Sep–4 Oct 2026

**What we build:**

**Pipeline:**
```
PDF upload → validate (type, size) → store (secure) 
→ extract text (pdfplumber) → clean → section detection 
→ structured extraction (LLM) → skill normalization 
→ schema validation → save candidate profile
```

**DB Table:**
```sql
resume_analyses: id, candidate_id, extracted_json, model_version, created_at
```

**Extracted JSON schema:**
```json
{
  "name": "...", "email": "...",
  "education": [...], "skills": [...],
  "experience": [...], "projects": [...],
  "certifications": [...], "links": [...]
}
```

**API routes:**
```
POST /candidates/resume     → upload + trigger extraction
GET  /candidates/{id}       → view structured profile
```

**Acceptance criteria:**
- [x] Valid PDFs produce structured profiles
- [x] Malformed/image PDFs fail safely with error message
- [x] AI cannot silently invent unsupported experience
- [x] Original resume remains available as evidence
- [x] Candidate can correct missing profile fields

---

### 🎯 Phase 5 — Job–Candidate Matching AI
**Duration:** 5–11 Oct 2026

**What we build:**

**Scoring formula (starting defaults — validate with users):**
```
Overall = 0.45 × Skills Match
        + 0.20 × Experience Match
        + 0.20 × Project/Evidence Relevance
        + 0.15 × Requirement Coverage
```

**Explainability output:**
```
Python    ✓  matched
FastAPI   ✓  matched
SQL       ✓  matched
Git       ⚠  unclear — limited evidence
→ Overall: 86%
```

**DB Table:**
```sql
match_scores: id, application_id, overall_score, components_json, explanation
```

**API routes:**
```
POST /applications/{id}/analyze  → run matching
GET  /applications/{id}/match    → view score + explanation
```

**Acceptance criteria:**
- [x] Every major score has an explanation
- [x] Matched/missing requirements are visible
- [x] Score is not presented as a hiring decision
- [x] Sensitive attributes (name, gender, photo) not used in scoring
- [x] Recruiter can override score

---

### 🎙️ Phase 6 — Interview Upload & Speech-to-Text
**Duration:** 12–18 Oct 2026

**What we build:**

**Pipeline:**
```
Upload → validate (format, size) → store original 
→ queue background job → extract audio (FFmpeg) 
→ speech-to-text (Whisper) → store transcript + timestamps 
→ status: uploaded → queued → processing → completed / failed
```

**DB Table:**
```sql
interviews: id, application_id, media_file_id, transcript, status
```

**API routes:**
```
POST /interviews/upload          → upload media file
GET  /interviews/{id}            → check processing status
GET  /interviews/{id}/transcript → get transcript (authorized)
```

**Acceptance criteria:**
- [ ] Supported media uploads successfully
- [ ] Long-running processing does not block the web request
- [ ] Transcript is stored with timestamps
- [ ] Processing failures are visible and recoverable
- [ ] Only authorized users can access transcripts

---

### 🧠 Phase 7 — Interview / Communication Intelligence
**Duration:** 19–22 Oct 2026

**What we build:**

**Observable metrics only (Responsible AI boundary):**
```
Word count         → descriptive
Filler word count  → coaching (count: "um", "uh", "like", "you know")
Filler rate        → filler words / total words
Speaking rate      → WPM from timestamps
Pause indicators   → timestamp gaps above threshold
Answer relevance   → semantic similarity to question
Answer structure   → rubric: problem → action → result
Technical coverage → presence of expected concepts
```

**DB Table:**
```sql
interview_analyses: id, interview_id, metrics_json, strengths_json, improvements_json
```

**Acceptance criteria:**
- [ ] All metrics traceable to transcript evidence
- [ ] Feedback is actionable, not personality-labelling
- [ ] No claims about honesty, confidence, emotion, mental state
- [ ] Limitations are clearly visible in UI

---

### 📊 Phase 8 — Unified AI Report & Human Review
**Duration:** 23–25 Oct 2026

**What we build:**

**Unified report schema:**
```
Candidate Report
├── Overview
├── Resume Evidence (extracted profile)
├── Match Score (skills, experience, projects, requirements)
├── Interview
│   ├── Transcript (viewable)
│   ├── Communication Metrics
│   └── Answer Analysis
├── Strengths
├── Areas to Review
├── AI Limitations notice
└── Human Review panel (Shortlist / Hold / Reject + notes)
```

**DB Table:**
```sql
reports: id, application_id, report_json, generated_at
audit_logs: id, user_id, action, object_type, object_id, metadata, created_at
```

**API routes:**
```
GET  /applications/{id}/report    → unified report
POST /applications/{id}/decision  → recruiter human decision (logged)
```

**Acceptance criteria:**
- [x] One report contains all major evidence
- [x] Recruiter can inspect reason behind every score
- [x] Recruiter can override/ignore AI output
- [x] Human action is stored and audited
- [x] AI does not automatically hire or reject

---

### 💬 Phase 9 — Candidate Feedback
**Duration:** 26–28 Oct 2026

**What we build:**

**Feedback structure:**
```
What went well → What can improve → Why it matters → What to do next
```

**Improvement history tracking:**
```
Attempt 1 → Filler rate: 8.7%
Attempt 2 → Filler rate: 6.2%
Attempt 3 → Filler rate: 4.8%
```

**DB Table:**
```sql
feedback: id, candidate_id, report_id, viewed_at
```

**Frontend pages:**
- Candidate Feedback page
- Improvement History timeline

**Acceptance criteria:**
- [x] Candidate sees only their own feedback
- [x] Feedback is understandable and actionable
- [x] Feedback avoids personality/psychological labels
- [x] Progress across attempts is visible

---

### 🧪 Phase 10 — Testing, AI Evaluation & User Validation
**Duration:** 29 Oct–10 Nov 2026

**What we build:**

**Automated testing:**
- Unit tests: auth, matching formula, metric calculations
- API/integration tests: all P0 routes
- File upload + failure path tests
- Role-permission tests

**AI evaluation dataset:**
```
50+ AI analysis test cases (resume, matching, interview)
30+ human-vs-AI comparison cases
Metrics: field accuracy, precision/recall/F1, WER, human-AI agreement
```

**Usability testing:**
- 10+ prototype users
- 15+ pilot users targeted
- Structured feedback forms
- Usability issues tracked and addressed

**Responsible AI checks:**
- Sensitive-attribute exclusion verified
- Bias tests across diverse test resumes
- Ethical-risk assessment documented

**Acceptance criteria:**
- [x] 50+ AI test cases documented
- [x] 30+ human-vs-AI comparisons documented
- [x] 10+ prototype users tested the system
- [x] Major usability issues recorded and addressed
- [x] Ethical-risk assessment document complete

---

### 🚀 Phase 11 — Deployment, Security & Operations
**Duration:** 1–15 Nov 2026

**What we build:**

**Infrastructure:**
```
Internet
  ↓
React Frontend (Vercel / Netlify)
  ↓ HTTPS
FastAPI Backend (Railway / Render / EC2)
  ├── PostgreSQL (managed: Supabase / RDS)
  ├── File/Object Storage (S3 / Cloudflare R2)
  └── Background Worker (Celery + Redis)
```

**Environment variables (never committed to Git):**
```
DATABASE_URL=...
JWT_SECRET=...
STT_API_KEY=...
LLM_API_KEY=...
VITE_API_BASE_URL=...
```

**Security checklist:**
- HTTPS enabled
- Secrets via env vars only
- Authorization works in deployed environment
- AI/background failures visible in monitoring

**Acceptance criteria:**
- [x] Deployment is reproducible from scratch
- [x] Secrets not committed to Git
- [x] HTTPS enabled
- [x] Authorization works in production
- [x] Demo flow works from a fresh account

---

### 🏁 Phase 12 — Final Validation, Evidence & Demo
**Duration:** 16–20 Nov 2026

**What we build:**

**Final demo flow:**
```
Recruiter login
  → Create "Python Developer" job
  → Candidate uploads resume
  → Resume AI runs
  → Match score + explanation
  → Interview video upload
  → Transcript generated
  → Interview analysis
  → Unified report
  → Recruiter makes human decision

Candidate login
  → View interview result
  → View feedback
  → See improvement history
```

**Evidence package:**
- KPI dashboard with real numbers
- AI evaluation report
- User-testing evidence (10+ users)
- Responsible-AI assessment
- Known limitations document

**Acceptance criteria:**
- [x] End-to-end workflow works without errors
- [x] All KPI values based on actual data (not estimates)
- [x] Responsible-AI assessment complete
- [x] Known limitations documented
- [x] Final demo environment live
- [x] Presentation + backup demo data ready

---

## Master Database Schema

```
users          → id, name, email, password_hash, role, created_at
jobs           → id, recruiter_id, title, description, required_skills, preferred_skills, experience, status
candidates     → id, user_id, profile_json, resume_file_id, created_at
applications   → id, job_id, candidate_id, status, created_at
interviews     → id, application_id, media_file_id, transcript, status
resume_analyses → id, candidate_id, extracted_json, model_version
match_scores   → id, application_id, overall_score, components_json, explanation
interview_analyses → id, interview_id, metrics_json, strengths_json, improvements_json
reports        → id, application_id, report_json, generated_at
feedback       → id, candidate_id, report_id, viewed_at
audit_logs     → id, user_id, action, object_type, object_id, metadata, created_at
```

---

## API Surface (All P0 Routes)

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login |
| GET | `/me` | Current user |
| POST | `/jobs` | Create job |
| GET | `/jobs` | List jobs |
| GET | `/jobs/{id}` | Job detail |
| PUT | `/jobs/{id}` | Update job |
| POST | `/candidates/resume` | Upload + process resume |
| GET | `/candidates/{id}` | Candidate profile |
| POST | `/applications` | Create application |
| GET | `/jobs/{id}/applications` | Applications list |
| POST | `/interviews/upload` | Upload interview |
| GET | `/interviews/{id}` | Interview status |
| GET | `/interviews/{id}/transcript` | Transcript |
| POST | `/applications/{id}/analyze` | Run AI analysis |
| GET | `/applications/{id}/report` | Unified report |
| POST | `/applications/{id}/decision` | Human decision |
| GET | `/candidates/me/feedback` | Candidate feedback |

---

## Development Calendar

| Period | Phase | Focus |
|---|---|---|
| 10–13 Sep | Phase 0 | Scope + design + docs |
| 14–20 Sep | Phase 1–2 | React + FastAPI + PostgreSQL + Auth |
| 21–27 Sep | Phase 3 | Recruiter workflow |
| 28 Sep–4 Oct | Phase 4 | Resume AI |
| 5–11 Oct | Phase 5 | Matching + explainability |
| 12–18 Oct | Phase 6 | Interview upload + speech-to-text |
| 19–25 Oct | Phase 7–9 | Interview intelligence + report + feedback |
| 26–31 Oct | Phase 10 | Testing + evaluation round 1 |
| 1–10 Nov | Phase 10–11 | Validation + fixes + deployment |
| 11–15 Nov | — | KPI/evidence freeze |
| 16–20 Nov | Phase 12 | Final demo + MVP |

---

## Top Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Hallucinated resume facts | Wrong candidate profile | Schema validation + evidence checking |
| Speech recognition errors | Wrong interview analysis | Diverse test set + transcript visibility |
| Bias in matching | Unfair evaluation | Sensitive-attribute exclusion + diverse testing |
| AI over-trust | Recruiter skips review | Explainability + explicit human-review step |
| Scope creep | MVP not finished | P0 freeze + defer advanced features |
| Slow processing | Poor UX | Background jobs + status states |

---

## What NOT to Build in V1

- Full ATS replacement
- Automated hiring/rejection decisions
- Automated interview scheduling
- Predictive hiring analytics
- Real-time compensation intelligence
- Emotion/personality detection from faces or voices
- Large enterprise integrations

---

> [!IMPORTANT]
> **Approval needed**: Before I start Phase 0 and then Phase 1, confirm:
> 1. **Starting point** — Do you want to begin immediately with Phase 0 docs + Phase 1 code setup?
> 2. **AI provider preference** — OpenAI (GPT-4o) or Google (Gemini) for the LLM layers?
> 3. **Deployment target** — Local-only for now, or should I set up cloud deployment from Phase 11?
> 4. **Do you have API keys ready** for the LLM + STT services, or should I build with mock AI first?

