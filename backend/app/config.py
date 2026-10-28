from pydantic_settings import BaseSettings
from pydantic import Field
from pathlib import Path
import os
from typing import List

class Settings(BaseSettings):
    APP_NAME: str = "PHANTOM — The AI That Haunts Your Terminal"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # AI / Ollama configuration
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "qwen3:4b"
    OLLAMA_TIMEOUT_SECONDS: int = 120
    
    # Workspace & File safety limits
    DEFAULT_WORKSPACE_ROOT: str = str(Path(__file__).resolve().parent.parent.parent)
    ALLOWED_WORKSPACES: List[str] = []
    MAX_SCAN_FILES: int = 2000
    MAX_FILE_SIZE_BYTES: int = 1024 * 1024  # 1 MB limit per file content scan
    
    # SQLite Database
    DATABASE_PATH: str = str(Path(__file__).resolve().parent.parent / "data" / "phantom.db")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Reduced Motion / UI defaults
    DEFAULT_ANIMATION_LEVEL: str = "high" # "high", "low", "off"

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore"
    }

settings = Settings()

# Ensure backend data directory exists
os.makedirs(Path(settings.DATABASE_PATH).parent, exist_ok=True)
