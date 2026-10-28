from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
import uuid

from backend.app.models.schemas import ScanRequest, InvestigationSchema
from backend.app.services.scanner import scan_project_workspace
from backend.app.services.ollama_client import ollama_client
from backend.app.services.history_service import (
    save_investigation, list_investigations, get_investigation,
    delete_investigation, compare_scans
)

router = APIRouter(prefix="/investigations", tags=["Investigations"])

@router.post("", response_model=InvestigationSchema)
async def create_investigation(req: ScanRequest):
    inv_id = f"inv-{uuid.uuid4().hex[:8]}"
    try:
        # Run deterministic scan
        scan_result = await scan_project_workspace(
            target_path=req.workspace_path,
            investigation_id=inv_id,
            custom_exclusions=req.custom_exclusions
        )
        scan_result["id"] = inv_id
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Investigation scan error: {str(e)}")

    if req.investigation_title:
        scan_result["project_name"] = req.investigation_title

    # Ask local Ollama to craft the haunting yet accurate executive summary
    try:
        ai_summary = await ollama_client.generate_scan_summary(
            project_name=scan_result["project_name"],
            total_files=scan_result["total_files"],
            critical_count=scan_result["critical_count"],
            high_count=scan_result["high_count"],
            medium_count=scan_result["medium_count"],
            findings=scan_result["findings"]
        )
    except Exception:
        ai_summary = (
            f"Scanned {scan_result['total_files']} files. Found {scan_result['critical_count']} critical issues."
        )

    scan_result["summary"] = ai_summary
    scan_result["model_used"] = ollama_client.model

    # Persist to SQLite
    await save_investigation(scan_result)

    return InvestigationSchema(**scan_result)

@router.get("", response_model=List[InvestigationSchema])
async def get_all_investigations(
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = None
):
    invs = await list_investigations(limit=limit, search=search)
    return [InvestigationSchema(**i) for i in invs]

@router.get("/{investigation_id}")
async def get_investigation_by_id(investigation_id: str):
    inv = await get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found in the archives.")
    return inv

@router.delete("/{investigation_id}")
async def remove_investigation(investigation_id: str):
    deleted = await delete_investigation(investigation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    return {"message": "Investigation purged from spectral memory.", "id": investigation_id}

@router.get("/compare/{id_a}/{id_b}")
async def compare_two_investigations(id_a: str, id_b: str):
    try:
        return await compare_scans(id_a, id_b)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Comparison error: {str(e)}")
