from fastapi import APIRouter, HTTPException
from pathlib import Path
from backend.app.models.schemas import WorkspaceValidationRequest, WorkspaceValidationResponse
from backend.app.services.scanner import is_path_safe, check_git_info

router = APIRouter(prefix="/workspaces", tags=["Workspaces"])

@router.post("/validate", response_model=WorkspaceValidationResponse)
async def validate_workspace(req: WorkspaceValidationRequest):
    safe, msg_or_path = is_path_safe(req.path)
    if not safe:
        return WorkspaceValidationResponse(
            valid=False,
            path=req.path,
            exists=False,
            is_dir=False,
            readable=False,
            file_count_estimate=0,
            is_git_repo=False,
            message=msg_or_path
        )

    resolved = Path(msg_or_path)
    is_git, _ = check_git_info(resolved)
    
    # Quick file count estimation (shallow)
    try:
        count = sum(1 for _ in resolved.glob("*"))
        readable = True
    except PermissionError:
        readable = False
        count = 0

    return WorkspaceValidationResponse(
        valid=readable,
        path=str(resolved),
        exists=True,
        is_dir=True,
        readable=readable,
        file_count_estimate=count,
        is_git_repo=is_git,
        message="Workspace verified and ready for PHANTOM surveillance." if readable else "Permission denied on workspace."
    )
