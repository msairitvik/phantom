export type Severity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';

export type FindingStatus = 'open' | 'acknowledged' | 'resolved' | 'false_positive';

export interface Finding {
  id: string;
  investigation_id: string;
  severity: Severity;
  category: string;
  file_path: string;
  line_number?: number | null;
  title: string;
  explanation: string;
  evidence: string;
  remediation: string;
  source: string;
  status: FindingStatus;
  created_at: string;
}

export interface DirectoryNode {
  name: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  children?: DirectoryNode[];
  finding_severity?: Severity | null;
}

export interface Investigation {
  id: string;
  project_name: string;
  workspace_path: string;
  created_at: string;
  status: string;
  total_files: number;
  scanned_size_bytes: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  info_count: number;
  summary?: string | null;
  model_used?: string | null;
  findings?: Finding[];
  languages?: Record<string, number>;
  file_extensions?: Record<string, number>;
  git_branch?: string | null;
}

export interface SystemStatus {
  app_name: string;
  version: string;
  backend_status: string;
  ollama_reachable: boolean;
  ollama_version?: string;
  available_models: string[];
  active_model: string;
  model_installed: boolean;
  workspace_root: string;
  total_investigations: number;
  total_findings: number;
  database_path: string;
  git_available: boolean;
}

export interface WorkspaceValidation {
  valid: boolean;
  path: string;
  exists: boolean;
  is_dir: boolean;
  readable: boolean;
  file_count_estimate?: number;
  is_git_repo: boolean;
  message: string;
}

export interface AppSettings {
  ollama_base_url: string;
  ollama_model: string;
  ollama_timeout_seconds: number;
  max_scan_files: number;
  max_file_size_bytes: number;
  default_workspace_root: string;
  animation_level: string;
  database_path: string;
}

export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface ScanComparison {
  base_scan: { id: string; created_at: string };
  comparison_scan: { id: string; created_at: string };
  new_count: number;
  resolved_count: number;
  persistent_count: number;
  new_findings: Finding[];
  resolved_findings: Finding[];
  persistent_findings: Finding[];
}
