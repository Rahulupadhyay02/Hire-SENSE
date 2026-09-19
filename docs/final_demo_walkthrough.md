# HireSense — Master MVP Demo Walkthrough Script

This script provides an executive, step-by-step walkthrough for presenting HireSense to stakeholders, customers, and evaluators.

---

## 0. Demo Prerequisites & Launch

### Quick Launch Command
```bash
# In one terminal (Backend):
cd backend
source venv/bin/activate
python seed_demo.py # Ensures master demo dataset is loaded
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# In second terminal (Frontend):
cd frontend
npm run dev # Serves UI on http://localhost:5174
```

### Pre-Seeded Accounts
| Role | Email | Password | Pre-loaded Data |
| :--- | :--- | :--- | :--- |
| **Recruiter** | `recruiter@hiresense.ai` | `RecruiterPass123!` | 3 Jobs, 3 Applicants, Audit logs, Match Breakdowns |
| **Candidate** | `arjun.candidate@example.com` | `CandidatePass123!` | Profile, Resume, 2 Practice Sessions (+11 pts delta), Feedback |

---

## Act 1: The Recruiter Experience (Hiring Workflow)

### Step 1.1: Authentication & Dashboard Overview
1. Navigate to `http://localhost:5174/login`.
2. Enter `recruiter@hiresense.ai` / `RecruiterPass123!`.
3. **Presenter Talking Points**:
   > *"Welcome to HireSense Recruiter Workspace. Notice the clear separation of concerns — recruiters see open positions, applicant counts, and a high-level candidate funnel without black-box automation."*

### Step 1.2: Job Management & Skill Taxonomy
1. Click **Jobs** in the top navigation or sidebar.
2. Select **Senior Full-Stack Engineer** (`/recruiter/jobs`).
3. View the extracted required technical skills (`React`, `FastAPI`, `PostgreSQL`, `Docker`, `Python`) and experience levels.
4. **Presenter Talking Points**:
   > *"Jobs in HireSense aren't just text descriptions; our NLP engine parses required vs. preferred competencies, establishing an objective rubric for match scoring."*

### Step 1.3: Explainable Applicant Pipeline
1. Click **Pipeline** (`/recruiter/pipeline`).
2. Filter or select **Senior Full-Stack Engineer**.
3. Point out candidate **Arjun Patel** ranked with an **84% Match Score**.
4. Click **View Details** to inspect the **5-Tab Review Console**:
   * **Tab 1 - Profile**: Parsed resume, contact info, experience summary.
   * **Tab 2 - Match Breakdown**: Explainable radar/bar breakdown showing Skill Match (85%), Experience Match (82%), Education Match (90%), and Role Relevance (80%).
   * **Tab 3 - Gap Analysis**: Clear list of missing competencies (`GraphQL`) vs. matched competencies.
   * **Tab 4 - Communication Assessment**: Practice interview metrics (138 WPM pace, 2.1% filler rate, STAR format detected).
   * **Tab 5 - Audit & Decision**: Immutable history of past notes.
5. **Presenter Talking Points**:
   > *"Notice there is zero automated rejection. The AI presents clear, explainable evidence. The recruiter maintains 100% decision authority."*

### Step 1.4: Human-in-the-Loop Decision Recording
1. In the candidate drawer or review modal, change stage to **Shortlisted**.
2. Add a decision note: *"Strong full-stack foundations, excellent verbal clarity. Approved for technical panel."*
3. Click **Submit Decision**.
4. Verify the green confirmation toast and note that an immutable entry was immediately committed to `audit_logs`.

---

## Act 2: The Candidate Experience (Growth & Practice)

### Step 2.1: Candidate Portal Login
1. Log out or open an Incognito window at `http://localhost:5174/login`.
2. Enter `arjun.candidate@example.com` / `CandidatePass123!`.
3. Arrive at `/candidate/dashboard`.

### Step 2.2: Resume Parsing & Editable Entity Extraction
1. Click **My Resume** (`/candidate/resume`).
2. Show the parsed entities: Contact info, extracted skills list, work history items.
3. Show the **Candidate Edit Override**: Candidates can manually add skills or correct OCR inaccuracies before applying, ensuring agency over their own algorithmic representation.

### Step 2.3: AI Practice Interview Studio
1. Click **Practice Studio** (`/candidate/interview`).
2. Point out the prompt question: *"Describe a challenging technical project you led and how you resolved team conflict."*
3. Demonstrate the real-time audio recorder / upload simulator:
   * Displays audio wave visualizer, recording timer, and upload status.
4. Explain how speech is routed through STT, acoustic metrics calculation (WPM, pause detection, pitch variance), and NLP STAR structure analysis.

### Step 2.4: 4-Pillar Coaching & Unified Feedback Report
1. Click **Feedback Reports** (`/candidate/feedback` or `/report`).
2. Review the structured evaluation:
   * **Pillar 1 - Delivery & Pace**: 138 WPM (Optimal conversational range: 130–160 WPM).
   * **Pillar 2 - Fluency**: Low filler word frequency (2.1% - 'um', 'like').
   * **Pillar 3 - Behavioral Structure**: STAR detected (Situation, Task, Action, Result) with strong actionable verbs.
   * **Pillar 4 - Actionable Advice**: Constructive coaching hints without demoralizing language.

### Step 2.5: Multi-Attempt Progress Analytics
1. Click **Progress** (`/candidate/progress`).
2. Observe the interactive Recharts analytics:
   * **Session 1**: Baseline Overall Score: 74% (122 WPM, 4.2% filler words).
   * **Session 2**: Improved Overall Score: 85% (138 WPM, 2.1% filler words).
   * **Delta Metric**: **+11% Overall Score Improvement**, demonstrating candidate learning curve and skill growth.
3. **Presenter Talking Points**:
   > *"HireSense doesn't just assess; it trains candidates to perform better. Candidates who practice see an average +11 point increase in communication scores across consecutive attempts."*

---

## Act 3: Verification & Auditing (Responsible AI & Security)

1. Show the automated test suite passing:
   ```bash
   pytest tests/ -v # 33 automated tests passing
   ```
2. Point to the evidence documentation:
   * `docs/kpi_dashboard_evidence.md` — Platform metrics & recruiter ROI.
   * `docs/responsible_ai_assessment.md` — Counterfactual fairness & ethical governance.
   * `docs/security_operations_runbook.md` — Enterprise security, RBAC & containerization.
   * `docs/known_limitations_future_roadmap.md` — Engineering boundaries & Phase 13 roadmap.

---

## Conclusion
> *"HireSense transforms hiring from a chaotic, biased black-box into a transparent, explainable, and empowering experience for both recruiters and candidates."*
