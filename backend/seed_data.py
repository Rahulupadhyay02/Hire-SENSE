"""
Seed Script for Phase 3–6: Recruiter Workflow & Sample Data
Populates:
- Recruiter & Admin accounts
- Realistic Engineering Jobs
- Candidate users & detailed profiles
- Applications across hiring stages (Shortlisted, Reviewing, Pending)
- Phase 5: Match scores with explainability breakdowns
- Phase 6: Mock interview records with pre-generated transcripts
"""
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.job import Job, JobStatus
from app.models.candidate import Candidate
from app.models.application import Application, ApplicationStatus
from app.models.resume_analysis import ResumeAnalysis
from app.models.match_score import MatchScore
from app.models.interview import Interview, InterviewStatus
from app.services.matcher import evaluate_job_candidate_match
from app.utils.security import hash_password

def seed_database():
    print("[*] Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Ensure Recruiter User exists
        recruiter = db.query(User).filter(User.email == "priya.recruiter@example.com").first()
        if not recruiter:
            recruiter = User(
                name="Priya Sharma",
                email="priya.recruiter@example.com",
                password_hash=hash_password("SecurePassword123!"),
                role=UserRole.RECRUITER,
                is_active=True
            )
            db.add(recruiter)
            db.commit()
            db.refresh(recruiter)
        print(f"[✓] Recruiter user verified: {recruiter.email} (ID: {recruiter.id})")

        # 2. Seed Sample Jobs if none exist
        if db.query(Job).count() == 0:
            sample_jobs = [
                Job(
                    recruiter_id=recruiter.id,
                    title="Senior Python Developer",
                    description="We are looking for an experienced Python developer with strong expertise in FastAPI, PostgreSQL, and distributed architectures to build reliable AI-assisted tools.",
                    experience="2+ years",
                    required_skills=["Python", "FastAPI", "SQL", "Docker", "Git"],
                    preferred_skills=["Celery", "Redis", "AWS"],
                    status=JobStatus.ACTIVE
                ),
                Job(
                    recruiter_id=recruiter.id,
                    title="ML Engineer",
                    description="Join our AI engineering team to build scalable ML pipelines, model fine-tuning workflows, and semantic similarity scoring systems.",
                    experience="1-3 years",
                    required_skills=["Python", "TensorFlow", "PyTorch", "SQL"],
                    preferred_skills=["HuggingFace", "LangChain", "Vector Databases"],
                    status=JobStatus.ACTIVE
                ),
                Job(
                    recruiter_id=recruiter.id,
                    title="Full Stack Developer",
                    description="Looking for a versatile full-stack engineer proficient in React, modern JavaScript, and RESTful APIs to deliver delightful user experiences.",
                    experience="1+ years",
                    required_skills=["React", "Node.js", "MongoDB", "TypeScript"],
                    preferred_skills=["Tailwind CSS", "Vite", "GraphQL"],
                    status=JobStatus.ACTIVE
                ),
                Job(
                    recruiter_id=recruiter.id,
                    title="Data Analyst",
                    description="Transform hiring and talent market data into actionable visual insights, executive dashboards, and KPI metrics.",
                    experience="1-2 years",
                    required_skills=["Python", "Tableau", "SQL", "Power BI"],
                    preferred_skills=["Pandas", "Statistics", "Excel"],
                    status=JobStatus.ACTIVE
                ),
                Job(
                    recruiter_id=recruiter.id,
                    title="DevOps Engineer",
                    description="Maintain CI/CD pipelines, container orchestration with Docker and Kubernetes, and monitor production reliability.",
                    experience="2+ years",
                    required_skills=["AWS", "Docker", "Kubernetes", "CI/CD"],
                    preferred_skills=["Terraform", "Prometheus", "Linux"],
                    status=JobStatus.DRAFT
                ),
            ]
            db.add_all(sample_jobs)
            db.commit()
            print(f"[✓] Seeded {len(sample_jobs)} sample jobs.")

        # 3. Seed Candidates
        candidate_data = [
            {
                "name": "Priya Mehta",
                "email": "priya.mehta@example.com",
                "phone": "+91 9876543210",
                "education": "B.Tech Computer Science, IIT Bombay",
                "experience": "2 years",
                "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git", "REST APIs"],
                "highlights": ["Built an ML pipeline for fraud detection (94% accuracy)", "2 years Python backend at TechStartup", "Open-source FastAPI contributor"]
            },
            {
                "name": "Arjun Kumar",
                "email": "arjun.candidate@example.com",
                "phone": "+91 9876543211",
                "education": "B.Sc Software Engineering",
                "experience": "1.5 years",
                "skills": ["React", "Node.js", "MongoDB", "TypeScript", "JavaScript"],
                "highlights": ["Built fullstack SaaS application with React & Node", "Strong frontend state management & responsive design"]
            },
            {
                "name": "Sneha Patel",
                "email": "sneha.patel@example.com",
                "phone": "+91 9876543212",
                "education": "M.Tech AI & ML",
                "experience": "2.5 years",
                "skills": ["Python", "TensorFlow", "Scikit-learn", "SQL", "PyTorch"],
                "highlights": ["Published research on NLP transformers", "Implemented automated recommendation engine"]
            },
            {
                "name": "Rohit Joshi",
                "email": "rohit.joshi@example.com",
                "phone": "+91 9876543213",
                "education": "B.Tech Information Technology",
                "experience": "1 year",
                "skills": ["Java", "Spring Boot", "MySQL", "Git"],
                "highlights": ["Backend banking microservices development", "Database query optimization and caching"]
            },
            {
                "name": "Ananya Singh",
                "email": "ananya.singh@example.com",
                "phone": "+91 9876543214",
                "education": "B.Sc Statistics & Data Analytics",
                "experience": "1.5 years",
                "skills": ["Python", "Tableau", "SQL", "Power BI", "Pandas"],
                "highlights": ["Designed automated reporting dashboards", "Analyzed customer retention datasets for e-commerce"]
            }
        ]

        seeded_candidates = []
        for cdata in candidate_data:
            # Check or create user
            u = db.query(User).filter(User.email == cdata["email"]).first()
            if not u:
                u = User(
                    name=cdata["name"],
                    email=cdata["email"],
                    password_hash=hash_password("CandidatePass123!"),
                    role=UserRole.CANDIDATE,
                    is_active=True
                )
                db.add(u)
                db.commit()
                db.refresh(u)

            # Check or create candidate profile
            cand = db.query(Candidate).filter(Candidate.user_id == u.id).first()
            if not cand:
                cand = Candidate(
                    user_id=u.id,
                    phone=cdata["phone"],
                    education=cdata["education"],
                    experience_years=cdata["experience"],
                    skills=cdata["skills"],
                    profile_json={"highlights": cdata["highlights"]}
                )
                db.add(cand)
                db.commit()
                db.refresh(cand)
            seeded_candidates.append(cand)

        print(f"[✓] Seeded {len(seeded_candidates)} candidate profiles.")

        # 4. Seed Applications if none exist
        if db.query(Application).count() == 0:
            jobs = db.query(Job).order_by(Job.id).all()
            python_job = jobs[0]  # Senior Python Dev
            ml_job = jobs[1]      # ML Engineer
            fullstack_job = jobs[2] # Full Stack
            data_job = jobs[3]    # Data Analyst

            sample_applications = [
                Application(
                    job_id=python_job.id,
                    candidate_id=seeded_candidates[0].id, # Priya Mehta
                    status=ApplicationStatus.SHORTLISTED,
                    match_score=91.0,
                    notes="Exceptional candidate with FastAPI open-source contributions."
                ),
                Application(
                    job_id=python_job.id,
                    candidate_id=seeded_candidates[3].id, # Rohit Joshi
                    status=ApplicationStatus.PENDING,
                    match_score=62.0,
                    notes="Solid background, requires Python transition evaluation."
                ),
                Application(
                    job_id=ml_job.id,
                    candidate_id=seeded_candidates[2].id, # Sneha Patel
                    status=ApplicationStatus.SHORTLISTED,
                    match_score=85.0,
                    notes="Strong NLP and PyTorch experience."
                ),
                Application(
                    job_id=fullstack_job.id,
                    candidate_id=seeded_candidates[1].id, # Arjun Kumar
                    status=ApplicationStatus.REVIEWING,
                    match_score=78.0,
                    notes="Good React/Node portfolio."
                ),
                Application(
                    job_id=data_job.id,
                    candidate_id=seeded_candidates[4].id, # Ananya Singh
                    status=ApplicationStatus.REVIEWING,
                    match_score=73.0,
                    notes="Strong SQL and visualization skills."
                )
            ]
            db.add_all(sample_applications)
            db.commit()
            print(f"[✓] Seeded {len(sample_applications)} sample applications across hiring stages.")

        # 5. Populate Phase 5 Match Scores & Explainability
        print("[*] Generating Phase 5 AI Match Scores and Explainability records...")
        all_apps = db.query(Application).all()
        created_match_scores = 0
        for app in all_apps:
            existing_ms = db.query(MatchScore).filter(MatchScore.application_id == app.id).first()
            if not existing_ms:
                latest_resume = db.query(ResumeAnalysis).filter(
                    ResumeAnalysis.candidate_id == app.candidate_id
                ).order_by(ResumeAnalysis.created_at.desc()).first()
                eval_result = evaluate_job_candidate_match(app.job, app.candidate, latest_resume)
                ms = MatchScore(
                    application_id=app.id,
                    overall_score=eval_result["overall_score"],
                    skills_score=eval_result["skills_score"],
                    experience_score=eval_result["experience_score"],
                    projects_score=eval_result["projects_score"],
                    coverage_score=eval_result["coverage_score"],
                    components_json=eval_result["components_json"],
                    explanation=eval_result["explanation"]
                )
                db.add(ms)
                app.match_score = eval_result["overall_score"]
                created_match_scores += 1

        db.commit()
        print(f"[✓] Populated {created_match_scores} Phase 5 MatchScore records with full explainability.")

        # ── Phase 6: Seed mock Interview records ──────────────────────────────
        MOCK_TRANSCRIPT_SEGMENTS = [
            {"start": 0.0,  "end": 5.1,  "text": "Hello, thank you for having me. I'm excited to be here for this role."},
            {"start": 5.1,  "end": 12.4, "text": "I've been working as a Python developer for about three years now, primarily building RESTful APIs."},
            {"start": 12.4, "end": 19.8, "text": "In my current company I use FastAPI with SQLAlchemy and PostgreSQL for a high-traffic data platform."},
            {"start": 19.8, "end": 27.0, "text": "One of my proudest achievements was reducing a reporting query from 12 seconds to under 400 milliseconds using proper indexing."},
            {"start": 27.0, "end": 34.5, "text": "I'm comfortable with Docker and have experience deploying services on AWS using EC2 and RDS."},
            {"start": 34.5, "end": 41.2, "text": "I believe in writing clean, testable code. I use pytest extensively and aim for over 80% test coverage."},
            {"start": 41.2, "end": 47.6, "text": "I'm a quick learner and I've picked up Redis and Celery recently for background job processing."},
            {"start": 47.6, "end": 53.0, "text": "Thank you for this opportunity. I believe this role aligns perfectly with my career goals and I'd love to join your team."},
        ]
        MOCK_TRANSCRIPT = " ".join(s["text"] for s in MOCK_TRANSCRIPT_SEGMENTS)

        created_interviews = 0
        all_apps = db.query(Application).all()
        for app in all_apps[:3]:   # Seed 3 applications with mock interviews
            existing_iv = db.query(Interview).filter(Interview.application_id == app.id).first()
            if not existing_iv:
                iv = Interview(
                    application_id=app.id,
                    uploaded_by=recruiter.id,
                    original_filename="candidate_interview.mp3",
                    stored_filename=f"/dev/null/mock_interview_{app.id}.mp3",  # mock path
                    file_type="audio/mpeg",
                    file_size_bytes=4_800_000,  # ~4.8 MB mock
                    status=InterviewStatus.COMPLETED,
                    transcript=MOCK_TRANSCRIPT,
                    transcript_segments=MOCK_TRANSCRIPT_SEGMENTS,
                    duration_seconds=53.0,
                    processing_error=None,
                )
                db.add(iv)
                created_interviews += 1

        db.commit()
        print(f"[✓] Populated {created_interviews} Phase 6 Interview records with mock transcripts.")

        # ── Phase 7: Compute Communication Metrics for Interviews ─────────────
        from app.services import metrics_service
        all_interviews = db.query(Interview).all()
        updated_metrics_count = 0
        for iv in all_interviews:
            if iv.status == InterviewStatus.COMPLETED and (iv.metrics_json is None or iv.communication_score is None):
                job_skills = iv.application.job.required_skills if (iv.application and iv.application.job and iv.application.job.required_skills) else []
                m = metrics_service.compute_metrics(
                    transcript=iv.transcript or "",
                    segments=iv.transcript_segments or [],
                    duration_seconds=iv.duration_seconds or 53.0,
                    job_skills=job_skills,
                )
                iv.metrics_json = m
                iv.communication_score = m.get("overall_score")
                updated_metrics_count += 1
        db.commit()
        print(f"[✓] Computed and saved Phase 7 communication metrics for {updated_metrics_count} interviews.")

        print("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!\n")

    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
