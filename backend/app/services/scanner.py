import os
import uuid
import subprocess
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime, timezone

from backend.app.config import settings
from backend.app.models.schemas import (
    SeverityEnum, FindingStatusEnum, FindingSchema, DirectoryNode
)
from backend.app.services.rules import check_file_content, check_file_presence_issues

# Standard directories and files to exclude from deep scanning
DEFAULT_EXCLUSIONS = {
    ".git", "node_modules", ".venv", "venv", "__pycache__", "dist", "build",
    ".next", ".cache", ".pytest_cache", ".turbo", ".idea", ".vscode",
    ".mypy_cache", ".ruff_cache", "coverage", ".parcel-cache"
}

# Binary and non-code extensions to skip for text inspection
BINARY_EXTENSIONS = {
    ".png", ".jpg", ".jpeg", ".gif", ".ico", ".svg", ".webp", ".pdf",
    ".zip", ".tar", ".gz", ".7z", ".rar", ".exe", ".dll", ".so", ".dylib",
    ".pyc", ".pyd", ".woff", ".woff2", ".ttf", ".eot", ".mp3", ".mp4",
    ".wav", ".bin", ".dat", ".db", ".sqlite", ".sqlite3"
}

# Language mapping by extension
LANGUAGE_MAP = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript (React)",
    ".js": "JavaScript",
    ".jsx": "JavaScript (React)",
    ".html": "HTML",
    ".css": "CSS",
    ".scss": "SCSS",
    ".json": "JSON",
    ".yaml": "YAML",
    ".yml": "YAML",
    ".toml": "TOML",
    ".md": "Markdown",
    ".rs": "Rust",
    ".go": "Go",
    ".java": "Java",
    ".c": "C",
    ".cpp": "C++",
    ".sh": "Shell Script",
    ".ps1": "PowerShell",
    ".sql": "SQL"
}

def is_path_safe(target_path: str, base_root: Optional[str] = None) -> Tuple[bool, str]:
    """
    Validate target path to prevent path traversal and restrict scanning to safe workspace areas.
    Disallows system critical roots.
    """
    try:
        resolved = Path(target_path).resolve()
        
        # Check system critical roots
        resolved_str = str(resolved).lower()
        forbidden_roots = [
            "c:\\windows", "c:\\program files", "c:\\program files (x86)",
            "/etc", "/bin", "/sbin", "/usr", "/boot", "/sys", "/dev", "/proc"
        ]
        
        # Don't allow root drive directly (e.g. C:\ or /)
        if resolved.parent == resolved:
            return False, "Cannot scan system root drive directly."

        for f_root in forbidden_roots:
            if resolved_str.startswith(f_root):
                return False, f"Scanning system path '{target_path}' is forbidden."

        if not resolved.exists():
            return False, f"Directory does not exist: {target_path}"

        if not resolved.is_dir():
            return False, f"Path is not a directory: {target_path}"

        return True, str(resolved)
    except Exception as e:
        return False, f"Invalid path validation error: {str(e)}"

def is_binary_file(file_path: Path) -> bool:
    """Check extension first, then probe first 1024 bytes for null bytes."""
    if file_path.suffix.lower() in BINARY_EXTENSIONS:
        return True
    try:
        with open(file_path, "rb") as f:
            chunk = f.read(1024)
            if b"\x00" in chunk:
                return True
    except Exception:
        return True
    return False

def check_git_info(workspace_path: Path) -> Tuple[bool, Optional[str]]:
    """Determine if directory is a Git repo and retrieve branch if git is available."""
    git_dir = workspace_path / ".git"
    if not git_dir.exists():
        return False, None
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=str(workspace_path),
            capture_output=True,
            text=True,
            timeout=3
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
    except Exception:
        pass
    return True, "main"

def build_directory_tree(
    root_path: Path,
    current_path: Path,
    findings_by_path: Dict[str, SeverityEnum],
    max_depth: int = 4,
    current_depth: int = 0
) -> Optional[DirectoryNode]:
    """Build a hierarchical tree representation for directory visualization."""
    if current_depth > max_depth:
        return None

    try:
        rel_path = current_path.relative_to(root_path).as_posix()
        if rel_path == ".":
            rel_path = ""
    except ValueError:
        rel_path = current_path.name

    if current_path.is_file():
        sev = findings_by_path.get(rel_path.lower())
        return DirectoryNode(
            name=current_path.name,
            path=rel_path,
            type="file",
            size=current_path.stat().st_size if current_path.exists() else 0,
            finding_severity=sev
        )

    # It's a directory
    children_nodes = []
    try:
        for entry in sorted(current_path.iterdir(), key=lambda p: (not p.is_dir(), p.name.lower())):
            if entry.name in DEFAULT_EXCLUSIONS:
                continue
            child = build_directory_tree(
                root_path, entry, findings_by_path, max_depth, current_depth + 1
            )
            if child:
                children_nodes.append(child)
    except PermissionError:
        pass

    return DirectoryNode(
        name=current_path.name or root_path.name,
        path=rel_path,
        type="directory",
        children=children_nodes
    )

async def scan_project_workspace(
    target_path: str,
    investigation_id: str,
    custom_exclusions: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Perform a complete, deterministic, safe project investigation scan.
    """
    is_safe, resolved_path = is_path_safe(target_path)
    if not is_safe:
        raise ValueError(resolved_path)

    workspace = Path(resolved_path)
    exclusions = DEFAULT_EXCLUSIONS.copy()
    if custom_exclusions:
        exclusions.update(custom_exclusions)

    is_git, git_branch = check_git_info(workspace)

    discovered_relative_files: List[str] = []
    findings: List[FindingSchema] = []
    file_extensions: Dict[str, int] = {}
    languages: Dict[str, int] = {}
    total_scanned_bytes = 0
    scanned_file_count = 0
    now_iso = datetime.now(timezone.utc).isoformat()

    # Step 1: Walk files safely
    for root, dirs, files in os.walk(workspace):
        # Modify dirs in-place to avoid descending into ignored folders
        dirs[:] = [d for d in dirs if d not in exclusions and not d.startswith(".git")]

        for file in files:
            if scanned_file_count >= settings.MAX_SCAN_FILES:
                break

            file_path = Path(root) / file
            try:
                rel_path = file_path.relative_to(workspace).as_posix()
            except ValueError:
                rel_path = file

            discovered_relative_files.append(rel_path)
            scanned_file_count += 1

            ext = file_path.suffix.lower()
            if ext:
                file_extensions[ext] = file_extensions.get(ext, 0) + 1
                if ext in LANGUAGE_MAP:
                    lang = LANGUAGE_MAP[ext]
                    languages[lang] = languages.get(lang, 0) + 1

            # Check file size before opening
            try:
                file_size = file_path.stat().st_size
                total_scanned_bytes += file_size
            except Exception:
                file_size = 0

            # Skip binary files or oversized files for content inspection
            if file_size > settings.MAX_FILE_SIZE_BYTES or is_binary_file(file_path):
                continue

            # Read text safely with utf-8 fallback to latin-1
            try:
                content = ""
                with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()

                content_issues = check_file_content(rel_path, content)
                for issue in content_issues:
                    finding_obj = FindingSchema(
                        id=f"{issue['id']}-{uuid.uuid4().hex[:6]}",
                        investigation_id=investigation_id,
                        severity=issue["severity"],
                        category=issue["category"],
                        file_path=issue["file_path"],
                        line_number=issue.get("line_number"),
                        title=issue["title"],
                        explanation=issue["explanation"],
                        evidence=issue["evidence"],
                        remediation=issue["remediation"],
                        source=issue.get("source", "deterministic"),
                        status=FindingStatusEnum.OPEN,
                        created_at=now_iso
                    )
                    findings.append(finding_obj)
            except Exception:
                # Silently and safely skip unreadable files
                continue

    # Step 2: File presence and hygiene checks (.gitignore, .env, private keys)
    presence_issues = check_file_presence_issues(discovered_relative_files, is_git)
    for issue in presence_issues:
        finding_obj = FindingSchema(
            id=f"{issue['id']}-{uuid.uuid4().hex[:6]}",
            investigation_id=investigation_id,
            severity=issue["severity"],
            category=issue["category"],
            file_path=issue["file_path"],
            line_number=None,
            title=issue["title"],
            explanation=issue["explanation"],
            evidence=issue["evidence"],
            remediation=issue["remediation"],
            source=issue.get("source", "deterministic"),
            status=FindingStatusEnum.OPEN,
            created_at=now_iso
        )
        findings.append(finding_obj)

    # Calculate severity counts
    critical_count = sum(1 for f in findings if f.severity == SeverityEnum.CRITICAL)
    high_count = sum(1 for f in findings if f.severity == SeverityEnum.HIGH)
    medium_count = sum(1 for f in findings if f.severity == SeverityEnum.MEDIUM)
    low_count = sum(1 for f in findings if f.severity == SeverityEnum.LOW)
    info_count = sum(1 for f in findings if f.severity == SeverityEnum.INFORMATIONAL)

    # Step 3: Directory Tree mapping
    findings_by_path = {f.file_path.lower(): f.severity for f in findings}
    dir_tree = build_directory_tree(workspace, workspace, findings_by_path)

    return {
        "investigation_id": investigation_id,
        "project_name": workspace.name or "workspace",
        "workspace_path": str(workspace),
        "created_at": now_iso,
        "status": "completed",
        "total_files": scanned_file_count,
        "scanned_size_bytes": total_scanned_bytes,
        "critical_count": critical_count,
        "high_count": high_count,
        "medium_count": medium_count,
        "low_count": low_count,
        "info_count": info_count,
        "languages": languages,
        "file_extensions": file_extensions,
        "git_branch": git_branch,
        "findings": findings,
        "directory_tree": dir_tree.model_dump() if dir_tree else None
    }
