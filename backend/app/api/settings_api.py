from fastapi import APIRouter
from backend.app.config import settings
from backend.app.models.schemas import SettingsSchema, SettingsUpdateSchema
from backend.app.services.ollama_client import ollama_client

router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("", response_model=SettingsSchema)
async def get_settings():
    return SettingsSchema(
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_model=settings.OLLAMA_MODEL,
        ollama_timeout_seconds=settings.OLLAMA_TIMEOUT_SECONDS,
        max_scan_files=settings.MAX_SCAN_FILES,
        max_file_size_bytes=settings.MAX_FILE_SIZE_BYTES,
        default_workspace_root=settings.DEFAULT_WORKSPACE_ROOT,
        animation_level=settings.DEFAULT_ANIMATION_LEVEL,
        database_path=settings.DATABASE_PATH
    )

@router.put("", response_model=SettingsSchema)
async def update_settings(update: SettingsUpdateSchema):
    if update.ollama_base_url:
        settings.OLLAMA_BASE_URL = update.ollama_base_url
        ollama_client.base_url = update.ollama_base_url.rstrip("/")
    if update.ollama_model:
        settings.OLLAMA_MODEL = update.ollama_model
        ollama_client.model = update.ollama_model
    if update.ollama_timeout_seconds is not None:
        settings.OLLAMA_TIMEOUT_SECONDS = update.ollama_timeout_seconds
        ollama_client.timeout = update.ollama_timeout_seconds
    if update.max_scan_files is not None:
        settings.MAX_SCAN_FILES = update.max_scan_files
    if update.max_file_size_bytes is not None:
        settings.MAX_FILE_SIZE_BYTES = update.max_file_size_bytes
    if update.animation_level:
        settings.DEFAULT_ANIMATION_LEVEL = update.animation_level

    return SettingsSchema(
        ollama_base_url=settings.OLLAMA_BASE_URL,
        ollama_model=settings.OLLAMA_MODEL,
        ollama_timeout_seconds=settings.OLLAMA_TIMEOUT_SECONDS,
        max_scan_files=settings.MAX_SCAN_FILES,
        max_file_size_bytes=settings.MAX_FILE_SIZE_BYTES,
        default_workspace_root=settings.DEFAULT_WORKSPACE_ROOT,
        animation_level=settings.DEFAULT_ANIMATION_LEVEL,
        database_path=settings.DATABASE_PATH
    )
