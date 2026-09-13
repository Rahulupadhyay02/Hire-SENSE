"""
Speech-to-Text Service — Phase 6

Abstraction layer over Whisper (local CPU model).
Falls back gracefully to a deterministic mock if openai-whisper is not installed,
so the rest of the pipeline always works in pure dev/CI environments.

Provider priority:
  1. Local Whisper (openai-whisper pip package)
  2. Mock transcription (deterministic, for dev/testing)
"""

import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# ── Try to import Whisper (optional dependency) ────────────────────────────────
try:
    import whisper as _whisper
    _WHISPER_AVAILABLE = True
    logger.info("openai-whisper found — real STT enabled")
except ImportError:
    _WHISPER_AVAILABLE = False
    logger.warning(
        "openai-whisper not installed. Using mock STT. "
        "Install with: pip install openai-whisper"
    )

_WHISPER_MODEL: Optional[Any] = None   # Lazy-loaded singleton


def _get_whisper_model(model_name: str = "base") -> Any:
    """Lazy-load and cache the Whisper model."""
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        logger.info(f"Loading Whisper model '{model_name}'... (first load may take ~30s)")
        _WHISPER_MODEL = _whisper.load_model(model_name)
        logger.info("Whisper model loaded successfully.")
    return _WHISPER_MODEL


def _mock_transcribe(audio_path: str) -> Dict[str, Any]:
    """
    Deterministic mock transcription used when Whisper is not available.
    Returns realistic-looking output for dev/testing purposes.
    """
    filename = os.path.basename(audio_path)
    mock_segments = [
        {"start": 0.0,  "end": 4.2,  "text": "Hello, thank you for the opportunity to interview for this position."},
        {"start": 4.2,  "end": 9.8,  "text": "I have been working in software development for about three years now."},
        {"start": 9.8,  "end": 16.5, "text": "In my previous role I built several Python and FastAPI microservices that processed high-volume data pipelines."},
        {"start": 16.5, "end": 22.1, "text": "I enjoy working with databases and I have hands-on experience with both SQL and NoSQL systems."},
        {"start": 22.1, "end": 27.4, "text": "One challenge I am particularly proud of solving was optimizing a slow database query by adding proper indexes,"},
        {"start": 27.4, "end": 33.0, "text": "which reduced the response time from eight seconds down to under two hundred milliseconds."},
        {"start": 33.0, "end": 38.5, "text": "I am very excited about this role and I believe my skills are a strong match for what you are looking for."},
        {"start": 38.5, "end": 42.0, "text": "Thank you for your time, and I look forward to hearing from you."},
    ]
    full_transcript = " ".join(seg["text"] for seg in mock_segments)
    return {
        "transcript": f"[MOCK TRANSCRIPT — {filename}]\n\n{full_transcript}",
        "segments": mock_segments,
        "duration": mock_segments[-1]["end"]
    }


def transcribe(audio_path: str, model_name: str = "base") -> Dict[str, Any]:
    """
    Main STT entry point. Transcribes the given audio/video file.

    Args:
        audio_path:  Absolute path to the audio file (wav, mp3, m4a, etc.)
        model_name:  Whisper model size ('tiny', 'base', 'small', 'medium', 'large')

    Returns:
        {
            "transcript": str,               # Full transcript text
            "segments":   List[dict],        # [{start, end, text}, ...]
            "duration":   float              # Total duration in seconds
        }

    Raises:
        RuntimeError: If transcription fails for any reason.
    """
    if not os.path.isfile(audio_path):
        raise RuntimeError(f"Audio file not found: {audio_path}")

    if not _WHISPER_AVAILABLE:
        logger.info(f"[Mock STT] Transcribing: {audio_path}")
        return _mock_transcribe(audio_path)

    try:
        model = _get_whisper_model(model_name)
        logger.info(f"[Whisper STT] Transcribing: {audio_path}")
        result = model.transcribe(audio_path, fp16=False, verbose=False)

        segments = [
            {
                "start": round(seg["start"], 2),
                "end":   round(seg["end"],   2),
                "text":  seg["text"].strip()
            }
            for seg in result.get("segments", [])
        ]
        duration = segments[-1]["end"] if segments else 0.0

        return {
            "transcript": result.get("text", "").strip(),
            "segments":   segments,
            "duration":   duration
        }
    except Exception as exc:
        logger.error(f"[Whisper STT] Transcription failed: {exc}")
        raise RuntimeError(f"Transcription failed: {exc}") from exc
