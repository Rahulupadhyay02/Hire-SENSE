from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "HireSense API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    DATABASE_URL: str = "sqlite:///./hiresense.db"
    
    JWT_SECRET: str = "hiresense-super-secure-jwt-secret-key-phase2-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    # ── Phase 6: Interview Upload & STT ─────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 500
    INTERVIEW_UPLOADS_DIR: str = "uploads/interviews"
    STT_MODEL: str = "base"   # Whisper model: tiny | base | small | medium | large

    ALLOWED_VIDEO_TYPES: List[str] = [
        "video/mp4", "video/webm", "video/quicktime",
        "video/x-msvideo", "video/x-matroska", "video/avi"
    ]
    ALLOWED_AUDIO_TYPES: List[str] = [
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav",
        "audio/mp4", "audio/m4a", "audio/ogg", "audio/flac",
        "audio/x-flac", "audio/aac"
    ]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()

