from fastapi import APIRouter
from backend.app.config import settings
from backend.app.models.schemas import SystemStatusResponse
from backend.app.services.ollama_client import ollama_client
from backend.app.services.history_service import get_system_counts
import shutil

router = APIRouter(tags=["System"])

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "entity": "PHANTOM",
        "awakened": True,
        "version": settings.VERSION
    }

@router.get("/system/status", response_model=SystemStatusResponse)
async def get_system_status():
    ai_status = await ollama_client.get_status()
    counts = await get_system_counts()
    git_installed = shutil.which("git") is not None

    return SystemStatusResponse(
        app_name=settings.APP_NAME,
        version=settings.VERSION,
        backend_status="operational",
        ollama_reachable=ai_status["reachable"],
        ollama_version="local",
        available_models=ai_status["available_models"],
        active_model=settings.OLLAMA_MODEL,
        model_installed=ai_status["model_installed"],
        workspace_root=settings.DEFAULT_WORKSPACE_ROOT,
        total_investigations=counts["total_investigations"],
        total_findings=counts["total_findings"],
        database_path=settings.DATABASE_PATH,
        git_available=git_installed
    )
