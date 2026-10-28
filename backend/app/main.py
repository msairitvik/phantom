from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from backend.app.config import settings
from backend.app.database import init_db
from backend.app.api.system import router as system_router
from backend.app.api.workspaces import router as workspaces_router
from backend.app.api.investigations import router as investigations_router
from backend.app.api.findings import router as findings_router
from backend.app.api.ai import router as ai_router
from backend.app.api.reports import router as reports_router
from backend.app.api.settings_api import router as settings_router

# Configure clean logging
logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] [%(levelname)s] [%(name)s]: %(message)s"
)
logger = logging.getLogger("phantom")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("👻 PHANTOM core has awakened...")
    await init_db()
    yield
    logger.info("👻 PHANTOM core returning to the shadows...")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="The AI That Haunts Your Terminal — Local-First Security & Anomaly Investigator",
    lifespan=lifespan
)

# CORS middleware for local frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom exception handler for clean error responses
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Spectral anomaly on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"PHANTOM internal error: {str(exc)}"}
    )

# Register routes under /api
app.include_router(system_router, prefix="/api")
app.include_router(workspaces_router, prefix="/api")
app.include_router(investigations_router, prefix="/api")
app.include_router(findings_router, prefix="/api")
app.include_router(ai_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(settings_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
