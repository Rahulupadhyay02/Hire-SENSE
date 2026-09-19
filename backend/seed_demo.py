"""
Phase 12 — Master Demo Seeding Script
======================================
Sets up an end-to-end, reproducible presentation environment for HireSense:
- 1 Recruiter: recruiter@hiresense.ai / RecruiterPass123!
- 3 Candidates: arjun.candidate@example.com, priya.candidate@example.com, rohan.candidate@example.com
- 3 Active Jobs: Full Stack, Frontend, Cloud/DevOps
- 3 Complete Applications with explainable MatchScores
- 4 Multi-Attempt Interview sessions with Whisper transcripts, WPM, filler rates & STAR structures
- 2 Unified AI Reports with multi-source evidence
- 2 Recruiter human decision audit logs with rationales
- 2 Candidate coaching feedback dossiers with viewed_at tracking

Run anytime:
    cd backend
    ./venv/bin/python seed_demo.py
"""

import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Ensure app is importable
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.models.match_score import MatchScore
from app.models.interview import Interview, InterviewStatus
from app.models.report import Report
from app.models.audit_log import AuditLog
from app.models.feedback import Feedback
from app.utils.security import hash_password

def seed_demo():
    print("=" * 70)
    print("HireSense — Phase 12 Master Demo Seeding")
    print("=" * 70)

    # Initialize all database tables
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # ── 1. Create or Update Recruiter ──────────────────────────────────────
        recruiter = db.query(User).filter(User.email == "recruiter@hiresense.ai").first()
        if not recruiter:
            recruiter = User(
                name="Sarah Jenkins",
                email="recruiter@hiresense.ai",
                password_hash=hash_password("RecruiterPass123!"),
                role=UserRole.RECRUITER,
                is_active=True
            )
            db.add(recruiter)
            db.commit()
            db.refresh(recruiter)
            print("✓ Created Recruiter: recruiter@hiresense.ai (Sarah Jenkins)")
        else:
            recruiter.password_hash = hash_password("RecruiterPass123!")
            db.commit()
            print("✓ Verified Recruiter: recruiter@hiresense.ai")

        # ── 2. Create or Update Candidates ─────────────────────────────────────
        candidate_specs = [
            {
                "name": "Arjun Kumar",
                "email": "arjun.candidate@example.com",
                "phone": "+91-9876543210",
                "education": "B.Tech Computer Science, IIT Delhi",
                "experience_years": "4.0 years",
                "skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis", "Git", "REST APIs"]
            },
            {
                "name": "Priya Mehta",
                "email": "priya.candidate@example.com",
                "phone": "+91-9811223344",
                "education": "B.S. Information Technology, Mumbai University",
                "experience_years": "3.0 years",
                "skills": ["React", "TypeScript", "JavaScript", "HTML", "CSS", "Tailwind CSS", "Redux", "Vite"]
            },
            {
                "name": "Rohan Varma",
                "email": "rohan.candidate@example.com",
                "phone": "+91-9844556677",
                "education": "M.Tech Data Science, BITS Pilani",
                "experience_years": "2.5 years",
                "skills": ["Python", "Machine Learning", "PyTorch", "SQL", "Pandas", "Docker"]
            }
        ]

        cand_users = {}
        cands = {}

        for spec in candidate_specs:
            u = db.query(User).filter(User.email == spec["email"]).first()
            if not u:
                u = User(
                    name=spec["name"],
                    email=spec["email"],
                    password_hash=hash_password("CandidatePass123!"),
                    role=UserRole.CANDIDATE,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)
            else:
                u.password_hash = hash_password("CandidatePass123!")
                db.commit()

            c = db.query(Candidate).filter(Candidate.user_id == u.id).first()
            if not c:
                c = Candidate(
                    user_id=u.id,
                    phone=spec["phone"],
                    education=spec["education"],
                    experience_years=spec["experience_years"],
                    skills=spec["skills"]
                )
                db.add(c)
                db.commit()
                db.refresh(c)
            else:
                c.phone = spec["phone"]
                c.education = spec["education"]
                c.experience_years = spec["experience_years"]
                c.skills = spec["skills"]
                db.commit()

            cand_users[spec["email"]] = u
            cands[spec["email"]] = c
            print(f"✓ Configured Candidate: {spec['email']} ({spec['name']})")

        # ── 3. Create Jobs ─────────────────────────────────────────────────────
        job_specs = [
            {
                "title": "Senior Full Stack Developer (Python & React)",
                "description": "Building high-throughput microservices in FastAPI with modern React and PostgreSQL.",
                "experience": "3+ years",
                "required_skills": ["Python", "FastAPI", "React", "PostgreSQL"],
                "preferred_skills": ["Docker", "Redis", "Celery"],
                "status": JobStatus.ACTIVE
            },
            {
                "title": "Frontend React Specialist",
                "description": "Crafting responsive, high-performance web dashboards using React and TypeScript.",
                "experience": "2+ years",
                "required_skills": ["React", "TypeScript", "JavaScript", "CSS"],
                "preferred_skills": ["Tailwind CSS", "Vite"],
                "status": JobStatus.ACTIVE
            },
            {
                "title": "Cloud & DevOps Engineer",
                "description": "Managing AWS Kubernetes clusters, CI/CD pipelines, and infrastructure as code.",
                "experience": "3+ years",
                "required_skills": ["AWS", "Docker", "Kubernetes", "Terraform"],
                "preferred_skills": ["CI/CD", "Linux"],
                "status": JobStatus.ACTIVE
            }
        ]

        jobs = []
        for js in job_specs:
            j = db.query(Job).filter(Job.title == js["title"], Job.recruiter_id == recruiter.id).first()
            if not j:
                j = Job(
                    recruiter_id=recruiter.id,
                    title=js["title"],
                    description=js["description"],
                    experience=js["experience"],
                    required_skills=js["required_skills"],
                    preferred_skills=js["preferred_skills"],
                    status=js["status"]
                )
                db.add(j)
                db.commit()
                db.refresh(j)
            jobs.append(j)
            print(f"✓ Configured Job: {js['title']}")

        full_stack_job = jobs[0]
        frontend_job = jobs[1]

        # ── 4. Create Applications ─────────────────────────────────────────────
        # Arjun -> Full Stack Job
        app_arjun = db.query(Application).filter(
            Application.job_id == full_stack_job.id,
            Application.candidate_id == cands["arjun.candidate@example.com"].id
        ).first()

        if not app_arjun:
            app_arjun = Application(
                job_id=full_stack_job.id,
                candidate_id=cands["arjun.candidate@example.com"].id,
                status=ApplicationStatus.SHORTLISTED,
                match_score=88.5,
                notes="Excellent candidate. Strong FastAPI & React alignment. Approved for final interview."
            )
            db.add(app_arjun)
            db.commit()
            db.refresh(app_arjun)
        else:
            app_arjun.status = ApplicationStatus.SHORTLISTED
            app_arjun.match_score = 88.5
            db.commit()

        # Priya -> Frontend Job
        app_priya = db.query(Application).filter(
            Application.job_id == frontend_job.id,
            Application.candidate_id == cands["priya.candidate@example.com"].id
        ).first()

        if not app_priya:
            app_priya = Application(
                job_id=frontend_job.id,
                candidate_id=cands["priya.candidate@example.com"].id,
                status=ApplicationStatus.SHORTLISTED,
                match_score=92.0,
                notes="Outstanding frontend portfolio. Very strong TypeScript and component structure."
            )
            db.add(app_priya)
            db.commit()
            db.refresh(app_priya)
        else:
            app_priya.status = ApplicationStatus.SHORTLISTED
            app_priya.match_score = 92.0
            db.commit()

        # Rohan -> Full Stack Job
        app_rohan = db.query(Application).filter(
            Application.job_id == full_stack_job.id,
            Application.candidate_id == cands["rohan.candidate@example.com"].id
        ).first()

        if not app_rohan:
            app_rohan = Application(
                job_id=full_stack_job.id,
                candidate_id=cands["rohan.candidate@example.com"].id,
                status=ApplicationStatus.REVIEWING,
                match_score=72.0,
                notes="Strong Python ML foundation; review needed for React frontend depth."
            )
            db.add(app_rohan)
            db.commit()
            db.refresh(app_rohan)

        print("✓ Created 3 Applications with Match Scores and Hiring Statuses")

        # ── 5. Seed Multi-Attempt Practice Interviews ──────────────────────────
        # Clean existing demo interviews for Arjun
        db.query(Interview).filter(Interview.application_id == app_arjun.id).delete()
        db.commit()

        # Arjun Attempt 1 (Baseline)
        iv_arjun_1 = Interview(
            application_id=app_arjun.id,
            original_filename="arjun_interview_attempt1.mp4",
            stored_filename="demo_arjun_attempt1.mp4",
            file_type="video/mp4",
            file_size_bytes=10485760,
            duration_seconds=52.0,
            status=InterviewStatus.COMPLETED,
            transcript=(
                "Um, when I was at my previous company, uh, we had to like, scale our backend APIs. "
                "And, uh, it was basically kind of slow, so you know, I wrote some Python code with FastAPI. "
                "And um, we added a Redis cache, right? So query latency was sort of reduced."
            ),
            communication_score=74.0,
            metrics_json={
                "wpm": 136,
                "filler_word_rate": 4.5,
                "filler_count": 6,
                "filler_types_found": ["um", "uh", "like", "basically", "you know", "right"],
                "structure_score": 60.0,
                "clarity_score": 75.0,
                "relevance_score": 85.0,
                "overall_score": 74.0,
                "strengths": [
                    "Solid technical vocabulary mentioning FastAPI and Redis caching",
                    "Speaking pace of 136 WPM is clear and conversational"
                ],
                "improvements": [
                    {
                        "label": "Filler Word Frequency",
                        "current": "4.5%",
                        "target": "< 2.5%",
                        "action": "Pause deliberately for 1-2 seconds between ideas instead of using 'um' or 'like'."
                    },
                    {
                        "label": "STAR Result Quantification",
                        "current": "Vague ('sort of reduced')",
                        "target": "Quantified Metrics",
                        "action": "State exact impact, e.g. 'reduced latency from 400ms to 45ms'."
                    }
                ],
                "radar": [
                    {"area": "Relevance", "value": 85},
                    {"area": "Structure", "value": 60},
                    {"area": "Fluency", "value": 55},
                    {"area": "Clarity", "value": 75},
                    {"area": "Pace", "value": 90}
                ]
            },
            created_at=datetime.now(timezone.utc) - timedelta(days=4)
        )
        db.add(iv_arjun_1)
        db.commit()
        db.refresh(iv_arjun_1)

        # Arjun Attempt 2 (Practiced - Improvement of +11 pts, -2.4% fillers)
        iv_arjun_2 = Interview(
            application_id=app_arjun.id,
            original_filename="arjun_interview_attempt2.mp4",
            stored_filename="demo_arjun_attempt2.mp4",
            file_type="video/mp4",
            file_size_bytes=9437184,
            duration_seconds=45.0,
            status=InterviewStatus.COMPLETED,
            transcript=(
                "When I was working as a backend engineer, our payment processing API experienced high latency. "
                "My goal was to decrease latency by forty percent. I implemented an asynchronous worker queue "
                "using Celery and Redis, and optimized our PostgreSQL database queries with composite indexes. "
                "As a result, average latency was reduced from 450 milliseconds to 45 milliseconds, and throughput doubled."
            ),
            communication_score=85.0,
            metrics_json={
                "wpm": 142,
                "filler_word_rate": 2.1,
                "filler_count": 1,
                "filler_types_found": ["when"],
                "structure_score": 88.0,
                "clarity_score": 88.0,
                "relevance_score": 92.0,
                "overall_score": 85.0,
                "strengths": [
                    "Flawless STAR response structure with concrete quantified result (90% latency reduction)",
                    "Excellent fluency with filler rate reduced to 2.1%",
                    "Perfect keyword integration with Python, Redis, Celery, and PostgreSQL"
                ],
                "improvements": [
                    {
                        "label": "Delivery Consistency",
                        "current": "142 WPM",
                        "target": "130-145 WPM",
                        "action": "Maintain this disciplined pace across all interview responses."
                    }
                ],
                "radar": [
                    {"area": "Relevance", "value": 92},
                    {"area": "Structure", "value": 88},
                    {"area": "Fluency", "value": 79},
                    {"area": "Clarity", "value": 88},
                    {"area": "Pace", "value": 92}
                ]
            },
            created_at=datetime.now(timezone.utc) - timedelta(days=2)
        )
        db.add(iv_arjun_2)
        db.commit()
        print("✓ Created Multi-Attempt Practice Interviews for Arjun Kumar (+11 pts gain)")

        # ── 6. Seed Unified Reports ────────────────────────────────────────────
        db.query(Report).filter(Report.application_id == app_arjun.id).delete()
        db.commit()

        report_payload = {
            "application_id": app_arjun.id,
            "candidate_name": "Arjun Kumar",
            "job_title": full_stack_job.title,
            "overall_match_score": 88.5,
            "communication_score": 85.0,
            "recommendation": "Strong Fit — Recommend for Final Technical Interview",
            "skills_analysis": {
                "matched_skills": ["Python", "FastAPI", "React", "PostgreSQL", "Docker", "Redis"],
                "missing_skills": [],
                "coverage_pct": 100.0
            },
            "interview_summary": {
                "attempts_count": 2,
                "initial_score": 74.0,
                "latest_score": 85.0,
                "improvement_delta": "+11.0 pts",
                "speaking_pace": "142 WPM (Optimal)",
                "filler_rate": "2.1% (Low)",
                "star_structure": "88% (Exemplary)"
            },
            "responsible_ai_notice": (
                "This report is strictly an AI-assisted advisory synthesis. "
                "Hiring decisions remain the exclusive responsibility of human hiring managers."
            )
        }

        demo_report = Report(
            application_id=app_arjun.id,
            report_json=report_payload
        )
        db.add(demo_report)
        db.commit()
        print("✓ Seeded Unified AI Candidate Report for Arjun Kumar")

        # ── 7. Seed Decision Audit Logs ────────────────────────────────────────
        db.query(AuditLog).filter(AuditLog.object_id == app_arjun.id).delete()
        db.commit()

        audit = AuditLog(
            user_id=recruiter.id,
            action="decision_shortlisted",
            object_type="application",
            object_id=app_arjun.id,
            log_metadata={
                "previous_status": "Pending",
                "new_status": "Shortlisted",
                "recruiter_notes": "Reviewed full report: 88.5% match and +11 pts interview improvement. Verified FastAPI architecture depth.",
                "human_decider": recruiter.name
            }
        )
        db.add(audit)
        db.commit()
        print("✓ Seeded Immutable Human Decision Audit Log")

        # ── 8. Seed Candidate Feedback with Viewed Tracking ────────────────────
        db.query(Feedback).filter(Feedback.application_id == app_arjun.id).delete()
        db.commit()

        fb = Feedback(
            candidate_id=cands["arjun.candidate@example.com"].id,
            application_id=app_arjun.id,
            interview_id=iv_arjun_2.id,
            viewed_at=datetime.now(timezone.utc) - timedelta(hours=6),
            feedback_json={
                "latest_score": 85.0,
                "attempts": 2,
                "key_growth": "Filler words reduced by 2.4% with quantified STAR delivery"
            }
        )
        db.add(fb)
        db.commit()
        print("✓ Seeded Candidate Feedback with viewed_at tracking")

        print("=" * 70)
        print("Master Demo Environment Ready!")
        print(f"Recruiter Login: {recruiter.email} / RecruiterPass123!")
        print(f"Candidate Login: {cand_users['arjun.candidate@example.com'].email} / CandidatePass123!")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    seed_demo()
