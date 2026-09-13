from app.routers.auth import router as auth_router
from app.routers.jobs import router as jobs_router
from app.routers.applications import router as applications_router
from app.routers.candidates import router as candidates_router
from app.routers.resumes import router as resumes_router
from app.routers.interviews import router as interviews_router

__all__ = [
    "auth_router",
    "jobs_router",
    "applications_router",
    "candidates_router",
    "resumes_router",
    "interviews_router"
]
