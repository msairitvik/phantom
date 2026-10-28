from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import FindingUpdateSchema
from backend.app.services.history_service import update_finding_status

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.patch("/{finding_id}")
async def patch_finding_status(finding_id: str, body: FindingUpdateSchema):
    success = await update_finding_status(finding_id, body.status)
    if not success:
        raise HTTPException(status_code=404, detail="Finding not found.")
    return {
        "finding_id": finding_id,
        "status": body.status.value,
        "message": f"Anomaly status transitioned to '{body.status.value}'."
    }
