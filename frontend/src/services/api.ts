import {
  SystemStatus,
  WorkspaceValidation,
  Investigation,
  Finding,
  FindingStatus,
  AppSettings,
  ChatMessage,
  ScanComparison
} from '../types';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `Request failed: ${res.status} ${res.statusText}`;
    try {
      const errData = await res.json();
      if (errData && errData.detail) {
        errMsg = errData.detail;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  async getHealth(): Promise<{ status: string; entity: string; version: string }> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getSystemStatus(): Promise<SystemStatus> {
    const res = await fetch(`${API_BASE}/system/status`);
    return handleResponse(res);
  },

  async validateWorkspace(path: string): Promise<WorkspaceValidation> {
    const res = await fetch(`${API_BASE}/workspaces/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path })
    });
    return handleResponse(res);
  },

  async startInvestigation(workspace_path: string, investigation_title?: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspace_path, investigation_title })
    });
    return handleResponse(res);
  },

  async getInvestigations(limit = 50, search?: string): Promise<Investigation[]> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/investigations?${params.toString()}`);
    return handleResponse(res);
  },

  async getInvestigation(id: string): Promise<Investigation> {
    const res = await fetch(`${API_BASE}/investigations/${id}`);
    return handleResponse(res);
  },

  async deleteInvestigation(id: string): Promise<{ message: string; id: string }> {
    const res = await fetch(`${API_BASE}/investigations/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async compareInvestigations(id_a: string, id_b: string): Promise<ScanComparison> {
    const res = await fetch(`${API_BASE}/investigations/compare/${id_a}/${id_b}`);
    return handleResponse(res);
  },

  async updateFindingStatus(finding_id: string, status: FindingStatus): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/findings/${finding_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return handleResponse(res);
  },

  async getAIStatus(): Promise<{ reachable: boolean; available_models: string[]; active_model: string; model_installed: boolean; error?: string }> {
    const res = await fetch(`${API_BASE}/ai/status`);
    return handleResponse(res);
  },

  async getAIModels(): Promise<{ models: string[]; active_model: string; installed: boolean }> {
    const res = await fetch(`${API_BASE}/ai/models`);
    return handleResponse(res);
  },

  async testAIConnection(): Promise<{ success: boolean; message: string; active_model?: string }> {
    const res = await fetch(`${API_BASE}/ai/test`, { method: 'POST' });
    return handleResponse(res);
  },

  async chatWithPhantom(message: string, investigation_id?: string, history: ChatMessage[] = []): Promise<{ reply: string; model: string }> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, investigation_id, history })
    });
    return handleResponse(res);
  },

  async getSettings(): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse(res);
  },

  async updateSettings(data: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  getMarkdownReportUrl(id: string): string {
    return `${API_BASE}/reports/${id}/markdown`;
  },

  async getJSONReport(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/${id}/json`);
    return handleResponse(res);
  }
};
