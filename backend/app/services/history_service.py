import json
import logging
from typing import List, Dict, Any, Optional
from backend.app.database import get_db
from backend.app.models.schemas import FindingStatusEnum

logger = logging.getLogger("phantom.history")

async def save_investigation(data: Dict[str, Any]) -> str:
    """Save an investigation and its associated findings to SQLite."""
    inv_id = data["investigation_id"]
    db = await get_db()
    try:
        await db.execute(
            """
            INSERT OR REPLACE INTO investigations (
                id, project_name, workspace_path, created_at, status,
                total_files, scanned_size_bytes, critical_count, high_count,
                medium_count, low_count, info_count, summary, model_used,
                languages, file_extensions, git_branch
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                inv_id,
                data.get("project_name", "Unknown"),
                data.get("workspace_path", ""),
                data.get("created_at", ""),
                data.get("status", "completed"),
                data.get("total_files", 0),
                data.get("scanned_size_bytes", 0),
                data.get("critical_count", 0),
                data.get("high_count", 0),
                data.get("medium_count", 0),
                data.get("low_count", 0),
                data.get("info_count", 0),
                data.get("summary", ""),
                data.get("model_used", ""),
                json.dumps(data.get("languages", {})),
                json.dumps(data.get("file_extensions", {})),
                data.get("git_branch", "")
            )
        )

        # Insert findings
        for f in data.get("findings", []):
            f_dict = f.model_dump() if hasattr(f, "model_dump") else f
            await db.execute(
                """
                INSERT OR REPLACE INTO findings (
                    id, investigation_id, severity, category, file_path,
                    line_number, title, explanation, evidence, remediation,
                    source, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    f_dict["id"],
                    inv_id,
                    f_dict["severity"],
                    f_dict["category"],
                    f_dict["file_path"],
                    f_dict.get("line_number"),
                    f_dict["title"],
                    f_dict["explanation"],
                    f_dict["evidence"],
                    f_dict["remediation"],
                    f_dict.get("source", "deterministic"),
                    f_dict.get("status", "open"),
                    f_dict.get("created_at", data.get("created_at", ""))
                )
            )

        await db.commit()
        return inv_id
    finally:
        await db.close()

async def list_investigations(limit: int = 50, search: Optional[str] = None) -> List[Dict[str, Any]]:
    """List recent investigations, optionally filtered by project name or path."""
    db = await get_db()
    try:
        query = "SELECT * FROM investigations"
        params = []
        if search:
            query += " WHERE project_name LIKE ? OR workspace_path LIKE ?"
            params.extend([f"%{search}%", f"%{search}%"])
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)

        cursor = await db.execute(query, params)
        rows = await cursor.fetchall()
        result = []
        for r in rows:
            result.append({
                "id": r["id"],
                "project_name": r["project_name"],
                "workspace_path": r["workspace_path"],
                "created_at": r["created_at"],
                "status": r["status"],
                "total_files": r["total_files"],
                "scanned_size_bytes": r["scanned_size_bytes"],
                "critical_count": r["critical_count"],
                "high_count": r["high_count"],
                "medium_count": r["medium_count"],
                "low_count": r["low_count"],
                "info_count": r["info_count"],
                "summary": r["summary"],
                "model_used": r["model_used"],
                "languages": json.loads(r["languages"]) if r["languages"] else {},
                "file_extensions": json.loads(r["file_extensions"]) if r["file_extensions"] else {},
                "git_branch": r["git_branch"]
            })
        return result
    finally:
        await db.close()

async def get_investigation(investigation_id: str) -> Optional[Dict[str, Any]]:
    """Fetch full investigation details including all findings."""
    db = await get_db()
    try:
        cursor = await db.execute("SELECT * FROM investigations WHERE id = ?", (investigation_id,))
        row = await cursor.fetchone()
        if not row:
            return None

        findings_cursor = await db.execute(
            "SELECT * FROM findings WHERE investigation_id = ? ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 WHEN 'Low' THEN 4 ELSE 5 END",
            (investigation_id,)
        )
        finding_rows = await findings_cursor.fetchall()
        findings = [dict(f) for f in finding_rows]

        return {
            "id": row["id"],
            "project_name": row["project_name"],
            "workspace_path": row["workspace_path"],
            "created_at": row["created_at"],
            "status": row["status"],
            "total_files": row["total_files"],
            "scanned_size_bytes": row["scanned_size_bytes"],
            "critical_count": row["critical_count"],
            "high_count": row["high_count"],
            "medium_count": row["medium_count"],
            "low_count": row["low_count"],
            "info_count": row["info_count"],
            "summary": row["summary"],
            "model_used": row["model_used"],
            "languages": json.loads(row["languages"]) if row["languages"] else {},
            "file_extensions": json.loads(row["file_extensions"]) if row["file_extensions"] else {},
            "git_branch": row["git_branch"],
            "findings": findings
        }
    finally:
        await db.close()

async def update_finding_status(finding_id: str, new_status: FindingStatusEnum) -> bool:
    """Update a finding's resolution status (open, acknowledged, resolved, false_positive)."""
    db = await get_db()
    try:
        cursor = await db.execute(
            "UPDATE findings SET status = ? WHERE id = ?",
            (new_status.value, finding_id)
        )
        await db.commit()
        return cursor.rowcount > 0
    finally:
        await db.close()

async def delete_investigation(investigation_id: str) -> bool:
    """Delete an investigation and cascade delete its findings."""
    db = await get_db()
    try:
        await db.execute("DELETE FROM findings WHERE investigation_id = ?", (investigation_id,))
        cursor = await db.execute("DELETE FROM investigations WHERE id = ?", (investigation_id,))
        await db.commit()
        return cursor.rowcount > 0
    finally:
        await db.close()

async def compare_scans(id_a: str, id_b: str) -> Dict[str, Any]:
    """Compare two scans to show newly detected, resolved, or recurring findings."""
    scan_a = await get_investigation(id_a)
    scan_b = await get_investigation(id_b)

    if not scan_a or not scan_b:
        raise ValueError("One or both investigation IDs could not be found.")

    findings_a = {f"{f['file_path']}::{f['title']}": f for f in scan_a.get("findings", [])}
    findings_b = {f"{f['file_path']}::{f['title']}": f for f in scan_b.get("findings", [])}

    new_findings = [f for key, f in findings_b.items() if key not in findings_a]
    resolved_findings = [f for key, f in findings_a.items() if key not in findings_b]
    persistent_findings = [f for key, f in findings_b.items() if key in findings_a]

    return {
        "base_scan": {"id": id_a, "created_at": scan_a["created_at"]},
        "comparison_scan": {"id": id_b, "created_at": scan_b["created_at"]},
        "new_count": len(new_findings),
        "resolved_count": len(resolved_findings),
        "persistent_count": len(persistent_findings),
        "new_findings": new_findings,
        "resolved_findings": resolved_findings,
        "persistent_findings": persistent_findings
    }

async def get_system_counts() -> Dict[str, int]:
    """Return total number of investigations and findings recorded."""
    db = await get_db()
    try:
        c1 = await db.execute("SELECT COUNT(*) as count FROM investigations")
        inv_count = (await c1.fetchone())["count"]
        c2 = await db.execute("SELECT COUNT(*) as count FROM findings")
        fin_count = (await c2.fetchone())["count"]
        return {"total_investigations": inv_count, "total_findings": fin_count}
    except Exception:
        return {"total_investigations": 0, "total_findings": 0}
    finally:
        await db.close()
