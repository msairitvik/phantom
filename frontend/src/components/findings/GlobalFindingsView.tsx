import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Filter, Download } from 'lucide-react';
import { Finding, FindingStatus, Investigation } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { FindingsTable } from '../scanner/FindingsTable';
import { FindingDetailModal } from '../scanner/FindingDetailModal';
import { EmptyState } from '../ui/EmptyState';
import { NeonButton } from '../ui/NeonButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface GlobalFindingsViewProps {
  currentInvestigation: Investigation | null;
  onNavigateToScan: () => void;
  onAskPhantom: (finding: Finding) => void;
}

export const GlobalFindingsView: React.FC<GlobalFindingsViewProps> = ({
  currentInvestigation,
  onNavigateToScan,
  onAskPhantom
}) => {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const { showToast } = useToast();

  const findings = currentInvestigation?.findings || [];

  const handleUpdateStatus = async (findingId: string, status: FindingStatus) => {
    try {
      await api.updateFindingStatus(findingId, status);
      showToast('success', 'Finding status updated', `Marked as ${status}`);
      if (currentInvestigation && currentInvestigation.findings) {
        currentInvestigation.findings = currentInvestigation.findings.map((f) =>
          f.id === findingId ? { ...f, status } : f
        );
      }
    } catch (e: any) {
      showToast('error', 'Status update error', e.message);
    }
  };

  if (!currentInvestigation || findings.length === 0) {
    return (
      <EmptyState
        title="No Findings to Display"
        description="Run an investigation to discover suspicious files, exposed secrets, or dangerous coding patterns."
        action={
          <NeonButton variant="primary" size="md" onClick={onNavigateToScan}>
            Launch New Investigation
          </NeonButton>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-phantom-purple/20 mb-4 gap-2">
          <div>
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-phantom-crimson" />
              <span>Discovered Anomalies Registry</span>
            </h3>
            <p className="text-xs font-mono text-phantom-muted">
              Project: {currentInvestigation.project_name} • {findings.length} Anomalies Tracked
            </p>
          </div>
        </div>

        <FindingsTable
          findings={findings}
          onSelectFinding={(f) => setSelectedFinding(f)}
          onQuickStatusChange={handleUpdateStatus}
        />
      </GlassCard>

      <FindingDetailModal
        finding={selectedFinding}
        onClose={() => setSelectedFinding(null)}
        onUpdateStatus={handleUpdateStatus}
        onAskPhantom={onAskPhantom}
      />
    </div>
  );
};
