"""
Interview Background Processor — Phase 6

Handles the async processing pipeline:
  uploaded → queued → processing → completed / failed

Pipeline:
  1. Update status to 'processing'
  2. If video file, extract audio via FFmpeg (optional — audio-only files skip this)
  3. Run Speech-to-Text via stt_service.transcribe()
  4. Save transcript + segments to Interview record
  5. Update status to 'completed' or 'failed'

Uses Python's ThreadPoolExecutor for non-blocking execution.
Fully upgradeable to Celery + Redis in Phase 11.
"""

import os
import logging
import tempfile
import subprocess
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from app.services import stt_service, metrics_service
from app.models.interview import Interview, InterviewStatus

logger = logging.getLogger(__name__)

# Shared thread pool (fire-and-forget background jobs)
_executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="interview_worker")

# ── FFmpeg helpers ─────────────────────────────────────────────────────────────
VIDEO_MIME_TYPES = {
    "video/mp4", "video/webm", "video/quicktime",
    "video/x-msvideo", "video/x-matroska", "video/avi",
}

def _is_video(file_type: str) -> bool:
    return file_type.lower() in VIDEO_MIME_TYPES


def _ffmpeg_available() -> bool:
    """Check if FFmpeg is installed on the system."""
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"], capture_output=True, timeout=5
        )
        return result.returncode == 0
    except (FileNotFoundError, subprocess.TimeoutExpired):
        return False


def _extract_audio(video_path: str, output_dir: str) -> str:
    """
    Extract audio from a video file using FFmpeg.
    Returns the path to the extracted .wav file.
    """
    audio_path = os.path.join(output_dir, "extracted_audio.wav")
    cmd = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-vn",                  # no video
        "-acodec", "pcm_s16le", # WAV encoding
        "-ar", "16000",         # 16kHz sample rate (optimal for Whisper)
        "-ac", "1",             # mono
        audio_path
    ]
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=300
        )
        if result.returncode != 0:
            raise RuntimeError(f"FFmpeg error: {result.stderr}")
        return audio_path
    except subprocess.TimeoutExpired:
        raise RuntimeError("FFmpeg audio extraction timed out (300s limit)")


# ── Core processing pipeline ───────────────────────────────────────────────────

def _run_pipeline(interview_id: int, db_url: str) -> None:
    """
    Full processing pipeline for a single interview.
    Runs in a background thread — uses its own DB session.
    """
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(bind=engine)
    db: Session = SessionLocal()

    tmp_dir: Optional[str] = None

    try:
        interview = db.query(Interview).filter(Interview.id == interview_id).first()
        if not interview:
            logger.error(f"[Processor] Interview {interview_id} not found in DB")
            return

        # ── Step 1: Mark as processing ─────────────────────────────────────────
        interview.status = InterviewStatus.PROCESSING
        db.commit()
        logger.info(f"[Processor] Interview {interview_id}: status → PROCESSING")

        # ── Step 2: Resolve audio path ─────────────────────────────────────────
        stored_path = interview.stored_filename   # absolute path saved at upload time
        audio_path  = stored_path

        tmp_dir = tempfile.mkdtemp(prefix="hiresense_interview_")

        if _is_video(interview.file_type):
            if _ffmpeg_available():
                logger.info(f"[Processor] Interview {interview_id}: extracting audio via FFmpeg")
                audio_path = _extract_audio(stored_path, tmp_dir)
            else:
                logger.warning(
                    f"[Processor] Interview {interview_id}: video file but FFmpeg not available. "
                    "Attempting direct transcription (may fail for video containers)."
                )

        # ── Step 3: Transcribe ─────────────────────────────────────────────────
        logger.info(f"[Processor] Interview {interview_id}: running STT on {audio_path}")
        stt_result = stt_service.transcribe(audio_path)

        # ── Step 4: Compute communication metrics (Phase 7) ─────────────────
        job_skills = []
        try:
            if interview.application and interview.application.job and interview.application.job.required_skills:
                job_skills = interview.application.job.required_skills
        except Exception as e:
            logger.warning(f"[Processor] Could not load job skills for metrics: {e}")

        metrics = metrics_service.compute_metrics(
            transcript=stt_result.get("transcript", ""),
            segments=stt_result.get("segments", []),
            duration_seconds=stt_result.get("duration"),
            job_skills=job_skills,
        )

        # ── Step 5: Persist results ────────────────────────────────────────────
        interview.transcript          = stt_result["transcript"]
        interview.transcript_segments = stt_result["segments"]
        interview.duration_seconds    = stt_result.get("duration")
        interview.metrics_json        = metrics
        interview.communication_score = metrics.get("overall_score")
        interview.status              = InterviewStatus.COMPLETED
        interview.processing_error    = None
        db.commit()
        logger.info(f"[Processor] Interview {interview_id}: status → COMPLETED ✓ (comm_score={interview.communication_score})")

    except Exception as exc:
        logger.error(f"[Processor] Interview {interview_id} failed: {exc}", exc_info=True)
        try:
            interview = db.query(Interview).filter(Interview.id == interview_id).first()
            if interview:
                interview.status           = InterviewStatus.FAILED
                interview.processing_error = str(exc)
                db.commit()
        except Exception as inner:
            logger.error(f"[Processor] Could not update failure status: {inner}")
    finally:
        db.close()
        # Clean up temp directory
        if tmp_dir and os.path.isdir(tmp_dir):
            import shutil
            shutil.rmtree(tmp_dir, ignore_errors=True)


def enqueue_interview(interview_id: int, db_url: str) -> None:
    """
    Submit interview for background processing (non-blocking).
    The caller returns immediately; processing happens in a thread pool.
    """
    logger.info(f"[Processor] Enqueueing interview {interview_id} for background processing")
    _executor.submit(_run_pipeline, interview_id, db_url)
