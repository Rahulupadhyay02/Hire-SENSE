from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    Token,
    TokenPayload
)
from app.schemas.job import (
    JobBase,
    JobCreate,
    JobUpdate,
    JobResponse
)
from app.schemas.candidate import (
    CandidateBase,
    CandidateCreate,
    CandidateResponse
)
from app.schemas.application import (
    ApplicationCreate,
    ApplicationStatusUpdate,
    ApplicationResponse
)
from app.schemas.report import (          # Phase 8
    UnifiedReportResponse,
    HumanDecisionRequest,
    HumanDecisionResponse,
)
from app.schemas.feedback import (        # Phase 9
    FeedbackPillar,
    AttemptProgressionItem,
    CandidateFeedbackResponse,
    FeedbackHistoryItem,
    FeedbackHistoryResponse,
)

__all__ = [
    "UserRegister",
    "UserLogin",
    "UserResponse",
    "Token",
    "TokenPayload",
    "JobBase",
    "JobCreate",
    "JobUpdate",
    "JobResponse",
    "CandidateBase",
    "CandidateCreate",
    "CandidateResponse",
    "ApplicationCreate",
    "ApplicationStatusUpdate",
    "ApplicationResponse",
    "UnifiedReportResponse",    # Phase 8
    "HumanDecisionRequest",     # Phase 8
    "HumanDecisionResponse",    # Phase 8
    "FeedbackPillar",           # Phase 9
    "AttemptProgressionItem",   # Phase 9
    "CandidateFeedbackResponse",# Phase 9
    "FeedbackHistoryItem",      # Phase 9
    "FeedbackHistoryResponse",  # Phase 9
]
