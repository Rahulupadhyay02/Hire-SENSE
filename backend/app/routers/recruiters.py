from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.recruiter_profile import RecruiterProfile
from app.models.job import Job
from app.schemas.recruiter import RecruiterProfileResponse, RecruiterProfileUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/recruiters", tags=["Recruiter Profile"])

def _build_profile_response(profile: RecruiterProfile, user: User) -> RecruiterProfileResponse:
    return RecruiterProfileResponse(
        id=profile.id,
        user_id=user.id,
        name=user.name,
        email=user.email,
        phone=profile.phone,
        title=profile.title,
        department=profile.department,
        timezone=profile.timezone,
        linkedin_url=profile.linkedin_url,
        calendly_url=profile.calendly_url,
        company_name=profile.company_name or "NeuralStack AI",
        company_website=profile.company_website or "https://neuralstack.ai",
        company_size=profile.company_size or "51-200 employees",
        industry=profile.industry or "AI & Machine Learning",
        address=profile.address or "Level 7, Cyber Green Tower, DLF Cyber City, Gurugram, India",
        bio=profile.bio or "Building the next generation of multimodal AI systems and scalable enterprise intelligence.",
        work_policy=profile.work_policy or "Hybrid (2-3 days)",
        hiring_preferences=profile.hiring_preferences or {
            "auto_match_threshold": 75,
            "notify_on_new_applicant": True,
            "auto_generate_ai_reports": True,
            "default_interview_format": "Live Coding & System Design"
        },
        created_at=profile.created_at,
        updated_at=profile.updated_at
    )

@router.get("/me/profile", response_model=RecruiterProfileResponse)
def get_recruiter_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve or initialize the recruiter's profile and company details"""
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to recruiters and admins."
        )

    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        # Check if user has jobs with company details
        first_job = db.query(Job).filter(Job.recruiter_id == current_user.id).first()
        initial_company = "NeuralStack AI"
        if first_job and hasattr(first_job, "company_name") and first_job.company_name:
            initial_company = first_job.company_name

        profile = RecruiterProfile(
            user_id=current_user.id,
            phone="+91 98112 34567",
            title="Lead Technical Recruiter",
            department="Engineering Talent",
            timezone="Asia/Kolkata (IST)",
            linkedin_url="https://linkedin.com/in/recruiter-priya",
            calendly_url="https://calendly.com/priya-hiresense",
            company_name=initial_company,
            company_website="https://neuralstack.ai",
            company_size="51-200 employees",
            industry="AI & Machine Learning",
            address="Level 7, Cyber Green Tower, DLF Cyber City, Gurugram, India",
            bio="Building the next generation of multimodal AI systems and scalable enterprise intelligence.",
            work_policy="Hybrid (2-3 days)",
            hiring_preferences={
                "auto_match_threshold": 75,
                "notify_on_new_applicant": True,
                "auto_generate_ai_reports": True,
                "default_interview_format": "Live Coding & System Design"
            }
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return _build_profile_response(profile, current_user)

@router.put("/me/profile", response_model=RecruiterProfileResponse)
def update_recruiter_profile(
    profile_in: RecruiterProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update recruiter personal details, company profile, address, and hiring preferences"""
    if current_user.role not in [UserRole.RECRUITER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access restricted to recruiters and admins."
        )

    profile = db.query(RecruiterProfile).filter(RecruiterProfile.user_id == current_user.id).first()
    if not profile:
        profile = RecruiterProfile(user_id=current_user.id)
        db.add(profile)

    # Update user name if provided
    if profile_in.name and profile_in.name.strip():
        current_user.name = profile_in.name.strip()
        db.add(current_user)

    # Update profile fields
    if profile_in.phone is not None:
        profile.phone = profile_in.phone.strip()
    if profile_in.title is not None:
        profile.title = profile_in.title.strip()
    if profile_in.department is not None:
        profile.department = profile_in.department.strip()
    if profile_in.timezone is not None:
        profile.timezone = profile_in.timezone.strip()
    if profile_in.linkedin_url is not None:
        profile.linkedin_url = profile_in.linkedin_url.strip()
    if profile_in.calendly_url is not None:
        profile.calendly_url = profile_in.calendly_url.strip()
    if profile_in.company_name is not None:
        profile.company_name = profile_in.company_name.strip()
    if profile_in.company_website is not None:
        profile.company_website = profile_in.company_website.strip()
    if profile_in.company_size is not None:
        profile.company_size = profile_in.company_size.strip()
    if profile_in.industry is not None:
        profile.industry = profile_in.industry.strip()
    if profile_in.address is not None:
        profile.address = profile_in.address.strip()
    if profile_in.bio is not None:
        profile.bio = profile_in.bio.strip()
    if profile_in.work_policy is not None:
        profile.work_policy = profile_in.work_policy.strip()
    if profile_in.hiring_preferences is not None:
        # Merge preferences
        current_prefs = dict(profile.hiring_preferences or {})
        current_prefs.update(profile_in.hiring_preferences)
        profile.hiring_preferences = current_prefs

    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    return _build_profile_response(profile, current_user)
