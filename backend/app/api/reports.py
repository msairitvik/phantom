from fastapi import APIRouter, HTTPException, Response
from backend.app.services.history_service import get_investigation
from backend.app.services.report_service import generate_markdown_report, generate_json_report

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{investigation_id}/markdown")
async def get_report_markdown(investigation_id: str):
    inv = await get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found.")

    markdown_text = generate_markdown_report(inv)
    return Response(
        content=markdown_text,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f"attachment; filename=phantom-report-{investigation_id}.md"
        }
    )

@router.get("/{investigation_id}/json")
async def get_report_json(investigation_id: str):
    inv = await get_investigation(investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation record not found.")

    return generate_json_report(inv)
