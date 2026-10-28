import React, { useState } from 'react';
import { Search, GitCompare, Trash2, FileText, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { Investigation, ScanComparison } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { SeverityBadge } from '../ui/SeverityBadge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface HistoryViewProps {
  investigations: Investigation[];
  onSelectInvestigation: (inv: Investigation) => void;
  onRefresh: () => void;
  onExportReport: (id: string) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  investigations,
  onSelectInvestigation,
  onRefresh,
  onExportReport
}) => {
  const [search, setSearch] = useState('');
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparison, setComparison] = useState<ScanComparison | null>(null);
  const [comparing, setComparing] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const { showToast } = useToast();

  const filtered = investigations.filter(
    (i) =>
      i.project_name.toLowerCase().includes(search.toLowerCase()) ||
      i.workspace_path.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCompareSelect = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter((i) => i !== id));
      setComparison(null);
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], id]);
      } else {
        setSelectedForCompare([...selectedForCompare, id]);
      }
    }
  };

  const handleRunComparison = async () => {
    if (selectedForCompare.length !== 2) return;
    setComparing(true);
    try {
      const diff = await api.compareInvestigations(selectedForCompare[0], selectedForCompare[1]);
      setComparison(diff);
      showToast('info', 'Investigation comparison ready');
    } catch (e: any) {
      showToast('error', 'Comparison failed', e.message);
    } finally {
      setComparing(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await api.deleteInvestigation(deleteTargetId);
      showToast('success', 'Investigation purged from memory');
      setDeleteTargetId(null);
      onRefresh();
    } catch (e: any) {
      showToast('error', 'Purge failed', e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and comparison banner */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-phantom-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search past investigations by project or path..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-phantom-purple/30 text-white placeholder-phantom-muted text-xs font-mono focus:outline-none focus:border-phantom-cyan"
          />
        </div>

        {selectedForCompare.length === 2 && (
          <NeonButton
            variant="cyan"
            size="sm"
            icon={<GitCompare className="w-4 h-4" />}
            onClick={handleRunComparison}
            loading={comparing}
          >
            Compare 2 Selected Scans
          </NeonButton>
        )}
      </div>

      {/* Comparison Diff Box if active */}
      {comparison && (
        <GlassCard gradientBorder className="p-6 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
            <div className="flex items-center gap-2 text-phantom-cyan">
              <GitCompare className="w-5 h-5" />
              <h3 className="font-bold text-white text-base">Investigation Differential</h3>
            </div>
            <button
              onClick={() => setComparison(null)}
              className="text-xs font-mono text-phantom-muted hover:text-white"
            >
              Close Diff
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4 text-center font-mono">
            <div className="p-3 rounded-xl bg-phantom-crimson/10 border border-phantom-crimson/30">
              <span className="text-xs text-phantom-muted block">NEW ANOMALIES</span>
              <span className="text-2xl font-bold text-phantom-crimson">{comparison.new_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-phantom-green/10 border border-phantom-green/30">
              <span className="text-xs text-phantom-muted block">RESOLVED ANOMALIES</span>
              <span className="text-2xl font-bold text-phantom-green">{comparison.resolved_count}</span>
            </div>
            <div className="p-3 rounded-xl bg-phantom-purple/10 border border-phantom-purple/30">
              <span className="text-xs text-phantom-muted block">PERSISTENT HAZARDS</span>
              <span className="text-2xl font-bold text-phantom-lavender">{comparison.persistent_count}</span>
            </div>
          </div>

          {comparison.new_findings.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="text-xs font-mono text-phantom-crimson font-bold uppercase">
                Newly Introduced Issues:
              </h4>
              <div className="space-y-1">
                {comparison.new_findings.map((f, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-black/40 border border-phantom-crimson/20 flex items-center justify-between text-xs">
                    <span className="text-white font-medium">{f.title} ({f.file_path})</span>
                    <SeverityBadge severity={f.severity} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      )}

      {/* Investigation List */}
      <div className="space-y-3">
        {filtered.map((inv) => {
          const isSelectedForCompare = selectedForCompare.includes(inv.id);
          return (
            <div
              key={inv.id}
              className={`p-5 rounded-2xl glass-panel border transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isSelectedForCompare
                  ? 'border-phantom-cyan/70 bg-phantom-cyan/5 shadow-glow-cyan'
                  : 'border-phantom-purple/20 hover:border-phantom-purple/50'
              }`}
            >
              <div className="flex items-start gap-4 flex-1 min-w-0">
                {/* Compare Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelectedForCompare}
                  onChange={() => toggleCompareSelect(inv.id)}
                  className="mt-1.5 w-4 h-4 accent-phantom-purple cursor-pointer rounded"
                  title="Select for comparison"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1">
                    <h4
                      onClick={() => onSelectInvestigation(inv)}
                      className="font-bold text-white text-base hover:text-phantom-cyan cursor-pointer transition-colors truncate"
                    >
                      {inv.project_name}
                    </h4>
                    <span className="text-[11px] font-mono text-phantom-muted bg-black/40 px-2 py-0.5 rounded border border-phantom-purple/20">
                      {inv.id}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-phantom-muted truncate mb-2">
                    {inv.workspace_path}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
                    <span className="text-phantom-lavender">
                      {inv.total_files} files
                    </span>
                    <span>•</span>
                    <span className={inv.critical_count > 0 ? 'text-phantom-crimson font-bold' : 'text-phantom-green'}>
                      {inv.critical_count} Critical
                    </span>
                    <span>•</span>
                    <span className={inv.high_count > 0 ? 'text-phantom-pink font-semibold' : 'text-phantom-muted'}>
                      {inv.high_count} High
                    </span>
                    <span>•</span>
                    <span className="text-phantom-muted">
                      {new Date(inv.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                <NeonButton
                  variant="ghost"
                  size="sm"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => onExportReport(inv.id)}
                >
                  Report
                </NeonButton>
                <NeonButton
                  variant="secondary"
                  size="sm"
                  onClick={() => onSelectInvestigation(inv)}
                >
                  Inspect
                </NeonButton>
                <button
                  onClick={() => setDeleteTargetId(inv.id)}
                  className="p-2 rounded-xl text-phantom-muted hover:text-phantom-crimson hover:bg-phantom-crimson/10 transition-colors"
                  title="Purge record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        title="Purge Investigation Memory?"
        message="This will permanently delete this investigation record and all associated finding metadata from SQLite storage."
        confirmLabel="Purge Permanently"
        danger
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
