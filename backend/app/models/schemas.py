from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class SeverityEnum(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"
    INFORMATIONAL = "Informational"

class FindingStatusEnum(str, Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"

class FindingSchema(BaseModel):
    id: str
    investigation_id: str
    severity: SeverityEnum
    category: str
    file_path: str
    line_number: Optional[int] = None
    title: str
    explanation: str
    evidence: str  # Always redacted
    remediation: str
    source: str = "deterministic"  # "deterministic" or "ai_suggestion"
    status: FindingStatusEnum = FindingStatusEnum.OPEN
    created_at: str

class FindingUpdateSchema(BaseModel):
    status: FindingStatusEnum

class ScanRequest(BaseModel):
    workspace_path: str
    investigation_title: Optional[str] = None
    custom_exclusions: Optional[List[str]] = None

class WorkspaceValidationRequest(BaseModel):
    path: str

class WorkspaceValidationResponse(BaseModel):
    valid: bool
    path: str
    exists: bool
    is_dir: bool
    readable: bool
    file_count_estimate: Optional[int] = None
    is_git_repo: bool = False
    message: str

class InvestigationSchema(BaseModel):
    id: str
    project_name: str
    workspace_path: str
    created_at: str
    status: str  # "completed", "scanning", "failed"
    total_files: int
    scanned_size_bytes: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    info_count: int
    summary: Optional[str] = None
    model_used: Optional[str] = None
    findings: Optional[List[FindingSchema]] = None
    languages: Optional[Dict[str, int]] = None
    file_extensions: Optional[Dict[str, int]] = None
    git_branch: Optional[str] = None

class DirectoryNode(BaseModel):
    name: str
    path: str
    type: str  # "directory" or "file"
    size: Optional[int] = None
    children: Optional[List['DirectoryNode']] = None
    finding_severity: Optional[SeverityEnum] = None

class AIChatMessage(BaseModel):
    role: str  # "user", "assistant", "system"
    content: str
    timestamp: Optional[str] = None

class AIChatRequest(BaseModel):
    investigation_id: Optional[str] = None
    message: str
    history: Optional[List[AIChatMessage]] = []

class AIChatResponse(BaseModel):
    reply: str
    model: str
    spooky_rating: str = "Eerie & Accurate"

class SystemStatusResponse(BaseModel):
    app_name: str
    version: str
    backend_status: str
    ollama_reachable: bool
    ollama_version: Optional[str] = None
    available_models: List[str]
    active_model: str
    model_installed: bool
    workspace_root: str
    total_investigations: int
    total_findings: int
    database_path: str
    git_available: bool

class SettingsSchema(BaseModel):
    ollama_base_url: str
    ollama_model: str
    ollama_timeout_seconds: int
    max_scan_files: int
    max_file_size_bytes: int
    default_workspace_root: str
    animation_level: str
    database_path: str

class SettingsUpdateSchema(BaseModel):
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None
    ollama_timeout_seconds: Optional[int] = None
    max_scan_files: Optional[int] = None
    max_file_size_bytes: Optional[int] = None
    animation_level: Optional[str] = None
