from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import AIChatRequest, AIChatResponse
from backend.app.services.ollama_client import ollama_client
from backend.app.services.history_service import get_investigation

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/status")
async def get_ai_status():
    return await ollama_client.get_status()

@router.get("/models")
async def get_ai_models():
    status = await ollama_client.get_status()
    return {
        "models": status.get("available_models", []),
        "active_model": status.get("active_model"),
        "installed": status.get("model_installed", False)
    }

@router.post("/test")
async def test_ai_connection():
    status = await ollama_client.get_status()
    if not status["reachable"]:
        return {
            "success": False,
            "message": status["error"] or "Ollama service is unreachable at configured endpoint."
        }
    return {
        "success": True,
        "active_model": status["active_model"],
        "model_installed": status["model_installed"],
        "available_models": status["available_models"],
        "message": "Local intelligence link operational."
    }

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_phantom(req: AIChatRequest):
    findings_list = []
    project_name = "System Workspace"

    if req.investigation_id:
        inv = await get_investigation(req.investigation_id)
        if inv:
            findings_list = inv.get("findings", [])
            project_name = inv.get("project_name", project_name)

    reply = await ollama_client.chat_with_investigator(
        message=req.message,
        findings=findings_list,
        history=[m.model_dump() for m in (req.history or [])],
        project_name=project_name
    )

    return AIChatResponse(
        reply=reply,
        model=ollama_client.model,
        spooky_rating="Spectral Grade"
    )
