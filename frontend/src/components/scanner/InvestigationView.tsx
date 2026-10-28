import React, { useState } from 'react';
import {
  Folder,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Terminal,
  Download,
  GitBranch,
  Layers,
  Sparkles
} from 'lucide-react';
import { Investigation, Finding, FindingStatus, DirectoryNode } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { StatCard } from '../ui/StatCard';
import { ProjectTree } from './ProjectTree';
import { FindingsTable } from './FindingsTable';
import { ScanProgress } from './ScanProgress';
import { FindingDetailModal } from './FindingDetailModal';
import { GhostLogo } from '../ui/GhostLogo';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface InvestigationViewProps {
  currentWorkspace: string;
  onChangeWorkspace: (path: string) => void;
  investigation: Investigation | null;
  onScanComplete: (inv: Investigation) => void;
  onOpenTerminalWithQuery: (query: string) => void;
  onExportReport: (id: string) => void;
  isScanning: boolean;
  setIsScanning: (s: boolean) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  currentWorkspace,
  onChangeWorkspace,
  investigation,
  onScanComplete,
  onOpenTerminalWithQuery,
  onExportReport,
  isScanning,
  setIsScanning
}) => {
  const [workspaceInput, setWorkspaceInput] = useState(currentWorkspace);
  const [scanStage, setScanStage] = useState('Initiating scan sequence...');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [selectedFileInTree, setSelectedFileInTree] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleStartScan = async () => {
    if (!workspaceInput.trim()) {
      showToast('warning', 'Please enter a valid workspace directory');
      return;
    }

    setIsScanning(true);
    setScanStage('Validating workspace boundaries...');

    try {
      // Validate workspace first
      const val = await api.validateWorkspace(workspaceInput);
      if (!val.valid) {
        showToast('error', 'Invalid Workspace', val.message);
        setIsScanning(false);
        return;
      }

      setScanStage('Scanning directory tree & hunting exposed credentials...');
      const inv = await api.startInvestigation(val.path);
      onScanComplete(inv);
      showToast('success', 'Investigation completed', `Found ${inv.critical_count} critical issues.`);
    } catch (e: any) {
      showToast('error', 'Investigation failed', e.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleStatusUpdate = async (findingId: string, newStatus: FindingStatus) => {
    try {
      await api.updateFindingStatus(findingId, newStatus);
      showToast('info', 'Status updated', `Finding marked as ${newStatus}`);
      if (investigation && investigation.findings) {
        const updatedFindings = investigation.findings.map((f) =>
          f.id === findingId ? { ...f, status: newStatus } : f
        );
        onScanComplete({ ...investigation, findings: updatedFindings });
      }
    } catch (e: any) {
      showToast('error', 'Failed to update status', e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Workspace Selector Bar */}
      <GlassCard className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2 p-1 rounded-xl bg-black/50 border border-phantom-purple/30">
            <Folder className="w-5 h-5 text-phantom-cyan ml-2 shrink-0" />
            <input
              type="text"
              value={workspaceInput}
              onChange={(e) => {
                setWorkspaceInput(e.target.value);
                onChangeWorkspace(e.target.value);
              }}
              placeholder="Enter absolute directory path (e.g. C:\Users\... or ./sample_project)..."
              className="flex-1 bg-transparent border-none text-white font-mono text-xs sm:text-sm px-2 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <NeonButton
              variant="primary"
              size="md"
              icon={<Play className="w-4 h-4 fill-current" />}
              onClick={handleStartScan}
              loading={isScanning}
            >
              Start Investigation
            </NeonButton>
          </div>
        </div>
      </GlassCard>

      {/* Scanning Active State */}
      {isScanning && (
        <div className="py-12">
          <ScanProgress stage={scanStage} />
        </div>
      )}

      {/* Results View */}
      {!isScanning && investigation && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          <GlassCard gradientBorder className="relative overflow-hidden">
            <div className="flex items-start gap-4">
              <GhostLogo size="lg" animated />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-phantom-green uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Spectral Intelligence Briefing</span>
                  </span>
                  <span className="text-[10px] font-mono text-phantom-muted bg-black/40 px-2 py-0.5 rounded border border-phantom-purple/20">
                    Model: {investigation.model_used || 'Local Heuristics'}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white mb-2">
                  {investigation.project_name}
                </h3>
                <p className="text-sm text-phantom-lavender leading-relaxed font-sans font-light">
                  {investigation.summary || 'Investigation finished with clean status.'}
                </p>
              </div>

              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => onExportReport(investigation.id)}
                >
                  Export Report
                </NeonButton>
                <NeonButton
                  variant="terminal"
                  size="sm"
                  icon={<Terminal className="w-3.5 h-3.5" />}
                  onClick={() =>
                    onOpenTerminalWithQuery('Summarize the top vulnerabilities in this scan.')
                  }
                >
                  Chat in Terminal
                </NeonButton>
              </div>
            </div>
          </GlassCard>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              title="Files Inspected"
              value={investigation.total_files}
              subtitle={`${Math.round(investigation.scanned_size_bytes / 1024)} KB scanned`}
              icon={<Folder className="w-5 h-5 text-phantom-cyan" />}
              color="cyan"
            />
            <StatCard
              title="Critical Hazards"
              value={investigation.critical_count}
              subtitle="Exposed keys or secrets"
              icon={<AlertCircle className="w-5 h-5 text-phantom-crimson" />}
              color="crimson"
            />
            <StatCard
              title="High Severity"
              value={investigation.high_count}
              subtitle="RCE or configuration risks"
              icon={<AlertCircle className="w-5 h-5 text-phantom-pink" />}
              color="purple"
            />
            <StatCard
              title="Medium & Low"
              value={investigation.medium_count + investigation.low_count}
              subtitle="Hygiene & git issues"
              icon={<CheckCircle2 className="w-5 h-5 text-phantom-green" />}
              color="green"
            />
          </div>

          {/* Main Content Grid: Explorer Tree on Left (1/3) & Findings Table on Right (2/3) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Tree & Languages */}
            <div className="lg:col-span-4 space-y-6">
              <GlassCard>
                <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Folder className="w-4 h-4 text-phantom-cyan" />
                    <span>Project Directory Tree</span>
                  </h4>
                  {investigation.git_branch && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-phantom-green">
                      <GitBranch className="w-3 h-3" />
                      <span>{investigation.git_branch}</span>
                    </span>
                  )}
                </div>

                {investigation && (
                  <ProjectTree
                    node={{
                      name: investigation.project_name,
                      path: '',
                      type: 'directory',
                      children: (investigation as any).directory_tree?.children || []
                    }}
                    selectedFile={selectedFileInTree}
                    onSelectFile={(f) => setSelectedFileInTree(f)}
                  />
                )}
              </GlassCard>

              {/* Language breakdown */}
              {investigation.languages && Object.keys(investigation.languages).length > 0 && (
                <GlassCard>
                  <h4 className="font-bold text-white text-sm flex items-center gap-2 pb-3 border-b border-phantom-purple/20 mb-3">
                    <Layers className="w-4 h-4 text-phantom-purple" />
                    <span>Languages Detected</span>
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    {Object.entries(investigation.languages).map(([lang, count]) => (
                      <div key={lang} className="flex justify-between items-center py-1 border-b border-phantom-purple/10">
                        <span className="text-phantom-lavender">{lang}</span>
                        <span className="text-phantom-green font-semibold">{count} files</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>

            {/* Right: Findings Table */}
            <div className="lg:col-span-8">
              <GlassCard>
                <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
                  <h4 className="font-bold text-white text-base">
                    Detected Anomalies & Containment
                  </h4>
                  <span className="text-xs font-mono text-phantom-muted">
                    {investigation.findings?.length || 0} Total Findings
                  </span>
                </div>

                <FindingsTable
                  findings={investigation.findings || []}
                  onSelectFinding={(f) => setSelectedFinding(f)}
                />
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Finding Detail Modal */}
      <FindingDetailModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={handleStatusUpdate}
        onAskPhantom={(f) =>
          onOpenTerminalWithQuery(
            `Explain the finding "${f.title}" in file "${f.file_path}" and suggest how to contain it safely.`
          )
        }
      />
    </div>
  );
};
