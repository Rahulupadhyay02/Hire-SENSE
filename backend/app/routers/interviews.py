"""
Interviews Router — Phase 6: Interview Upload & Speech-to-Text

Endpoints:
  POST   /interviews/upload                    → Upload media file (any authenticated user)
  GET    /interviews/{id}                      → Get interview status + metadata
  GET    /interviews/{id}/transcript           → Get full transcript (authorized only)
  GET    /applications/{app_id}/interviews     → List interviews for an application
  DELETE /interviews/{id}                      → Delete interview (recruiter/admin only)
"""

import os
import uuid
import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.models.candidate import Candidate
from app.models.application import Application
from app.models.interview import Interview, InterviewStatus
from app.schemas.interview import InterviewUploadResponse, InterviewStatusResponse, InterviewMetricsResponse
from app.services.interview_processor import enqueue_interview
from app.services import metrics_service
from app.utils.deps import get_current_user, require_recruiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/interviews", tags=["Interviews"])


# ── Helpers ────────────────────────────────────────────────────────────────────

def _ensure_upload_dir() -> str:
    """Create interview uploads directory if it doesn't exist."""
    upload_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
        settings.INTERVIEW_UPLOADS_DIR
    )
    os.makedirs(upload_dir, exist_ok=True)
    return upload_dir


def _check_interview_access(interview: Interview, current_user: User, db: Session) -> None:
    """Verify that the current user is authorized to access this interview."""
    if current_user.role == UserRole.ADMIN:
        return  # Admins can access everything

    app = db.query(Application).filter(Application.id == interview.application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")
    elif current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access forbidden")


def _format_upload_response(iv: Interview) -> InterviewUploadResponse:
    return InterviewUploadResponse(
        id=iv.id,
        application_id=iv.application_id,
        uploaded_by=iv.uploaded_by,
        original_filename=iv.original_filename,
        file_type=iv.file_type,
        file_size_bytes=iv.file_size_bytes,
        status=iv.status,
        communication_score=iv.communication_score,
        created_at=iv.created_at,
    )


def _format_status_response(iv: Interview) -> InterviewStatusResponse:
    segs = None
    if iv.transcript_segments:
        segs = iv.transcript_segments  # already a list of dicts

    return InterviewStatusResponse(
        id=iv.id,
        application_id=iv.application_id,
        uploaded_by=iv.uploaded_by,
        original_filename=iv.original_filename,
        stored_filename=iv.stored_filename,
        file_type=iv.file_type,
        file_size_bytes=iv.file_size_bytes,
        status=iv.status,
        processing_error=iv.processing_error,
        transcript=iv.transcript,
        transcript_segments=segs,
        duration_seconds=iv.duration_seconds,
        communication_score=iv.communication_score,
        metrics_json=iv.metrics_json,
        created_at=iv.created_at,
        updated_at=iv.updated_at,
    )


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=InterviewUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_interview(
    file: UploadFile = File(...),
    application_id: int = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Upload an interview video or audio file for a specific application.
    Triggers background STT processing immediately after upload.
    
    Supported formats:
    - Video: mp4, webm, mov, avi, mkv
    - Audio: mp3, wav, m4a, ogg, flac, aac
    
    Size limit: 500 MB
    """
    # ── Validate application exists ────────────────────────────────────────────
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    # ── Authorization check ────────────────────────────────────────────────────
    if current_user.role == UserRole.CANDIDATE:
        cand = db.query(Candidate).filter(Candidate.user_id == current_user.id).first()
        if not cand or app.candidate_id != cand.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only upload interviews for your own applications")
    elif current_user.role == UserRole.RECRUITER:
        if app.job.recruiter_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only upload interviews for your own job listings")

    # ── Validate file type ─────────────────────────────────────────────────────
    file_type = file.content_type or ""
    allowed_types = settings.ALLOWED_VIDEO_TYPES + settings.ALLOWED_AUDIO_TYPES
    if file_type not in allowed_types:
        # Try to infer from filename extension as a fallback
        ext = os.path.splitext(file.filename or "")[-1].lower()
        ext_map = {
            ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
            ".avi": "video/x-msvideo", ".mkv": "video/x-matroska",
            ".mp3": "audio/mpeg", ".wav": "audio/wav", ".m4a": "audio/mp4",
            ".ogg": "audio/ogg", ".flac": "audio/flac", ".aac": "audio/aac",
        }
        if ext in ext_map:
            file_type = ext_map[ext]
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type '{file_type}'. Supported: mp4, webm, mov, avi, mkv, mp3, wav, m4a, ogg, flac, aac"
            )

    # ── Read file content & validate size ─────────────────────────────────────
    content = await file.read()
    size_mb = len(content) / (1024 * 1024)
    if size_mb > settings.MAX_UPLOAD_SIZE_MB:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large: {size_mb:.1f} MB. Maximum allowed is {settings.MAX_UPLOAD_SIZE_MB} MB."
        )

    # ── Store file securely ───────────────────────────────────────────────────
    upload_dir = _ensure_upload_dir()
    original_ext = os.path.splitext(file.filename or "interview")[-1].lower() or ".bin"
    safe_name = f"{uuid.uuid4().hex}{original_ext}"
    stored_path = os.path.join(upload_dir, safe_name)

    with open(stored_path, "wb") as f:
        f.write(content)

    logger.info(f"Interview file stored: {stored_path} ({size_mb:.1f} MB)")

    # ── Create DB record ──────────────────────────────────────────────────────
    interview = Interview(
        application_id=application_id,
        uploaded_by=current_user.id,
        original_filename=file.filename or safe_name,
        stored_filename=stored_path,       # absolute path for processor
        file_type=file_type,
        file_size_bytes=len(content),
        status=InterviewStatus.QUEUED,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)

    # ── Enqueue background processing ─────────────────────────────────────────
    enqueue_interview(interview.id, str(settings.DATABASE_URL))
    logger.info(f"Interview {interview.id} enqueued for processing")

    return _format_upload_response(interview)


@router.get("/{interview_id}", response_model=InterviewStatusResponse)
def get_interview_status(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get interview status, metadata, and transcript (when completed)."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    _check_interview_access(interview, current_user, db)
    return _format_status_response(interview)


@router.get("/{interview_id}/transcript", response_model=InterviewStatusResponse)
def get_interview_transcript(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the full transcript for a completed interview (authorized users only)."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    _check_interview_access(interview, current_user, db)

    if interview.status != InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Transcript not available — interview status is '{interview.status}'. Wait for processing to complete."
        )
    return _format_status_response(interview)


@router.get("/{interview_id}/metrics", response_model=InterviewMetricsResponse)
def get_interview_metrics(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get full communication metrics for a completed interview."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    _check_interview_access(interview, current_user, db)

    if interview.status != InterviewStatus.COMPLETED:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Metrics not available — interview status is '{interview.status}'. Wait for processing to complete."
        )

    metrics = interview.metrics_json
    if not metrics:
        # On-demand computation if missing
        app = db.query(Application).filter(Application.id == interview.application_id).first()
        job_skills = app.job.required_skills if app and app.job and app.job.required_skills else []
        metrics = metrics_service.compute_metrics(
            transcript=interview.transcript or "",
            segments=interview.transcript_segments or [],
            duration_seconds=interview.duration_seconds,
            job_skills=job_skills,
        )
        interview.metrics_json = metrics
        interview.communication_score = metrics.get("overall_score")
        db.commit()

    return InterviewMetricsResponse(
        interview_id=interview.id,
        application_id=interview.application_id,
        communication_score=interview.communication_score,
        status=interview.status,
        **metrics
    )


@router.post("/{interview_id}/recompute-metrics", response_model=InterviewMetricsResponse)
def recompute_interview_metrics(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Force recomputing communication metrics from existing transcript."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")
    _check_interview_access(interview, current_user, db)

    if interview.status != InterviewStatus.COMPLETED or not interview.transcript:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Cannot recompute metrics without a completed transcript"
        )

    app = db.query(Application).filter(Application.id == interview.application_id).first()
    job_skills = app.job.required_skills if app and app.job and app.job.required_skills else []
    metrics = metrics_service.compute_metrics(
        transcript=interview.transcript or "",
        segments=interview.transcript_segments or [],
        duration_seconds=interview.duration_seconds,
        job_skills=job_skills,
    )
    interview.metrics_json = metrics
    interview.communication_score = metrics.get("overall_score")
    db.commit()

    return InterviewMetricsResponse(
        interview_id=interview.id,
        application_id=interview.application_id,
        communication_score=interview.communication_score,
        status=interview.status,
        **metrics
    )


@router.delete("/{interview_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_interview(
    interview_id: int,
    current_user: User = Depends(require_recruiter),
    db: Session = Depends(get_db)
):
    """Delete an interview record and its stored file (Recruiter/Admin only)."""
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview not found")

    # Authorization: admin or owning recruiter only
    app = db.query(Application).filter(Application.id == interview.application_id).first()
    if current_user.role != UserRole.ADMIN and app and app.job.recruiter_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this interview")

    # Remove file from disk
    if os.path.isfile(interview.stored_filename):
        try:
            os.remove(interview.stored_filename)
            logger.info(f"Deleted file: {interview.stored_filename}")
        except OSError as e:
            logger.warning(f"Could not delete file {interview.stored_filename}: {e}")

    db.delete(interview)
    db.commit()
