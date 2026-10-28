import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Terminal, CheckCircle2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import { Finding, FindingStatus } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { NeonButton } from '../ui/NeonButton';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  onUpdateStatus: (findingId: string, status: FindingStatus) => Promise<void>;
  onAskPhantom: (finding: Finding) => void;
}

export const FindingDetailModal: React.FC<FindingDetailModalProps> = ({
  finding,
  onClose,
  onUpdateStatus,
  onAskPhantom
}) => {
  const [updating, setUpdating] = useState(false);

  if (!finding) return null;

  const handleStatusChange = async (newStatus: FindingStatus) => {
    setUpdating(true);
    try {
      await onUpdateStatus(finding.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          className="relative w-full max-w-2xl glass-panel p-6 sm:p-8 rounded-3xl border border-phantom-purple/40 bg-[#0E0620] shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-phantom-purple/20 mb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <SeverityBadge severity={finding.severity} size="md" />
                <span className="text-xs font-mono text-phantom-muted bg-black/40 px-2 py-0.5 rounded border border-phantom-purple/20">
                  {finding.category}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                {finding.title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-phantom-muted hover:text-white hover:bg-phantom-purple/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Location info */}
          <div className="mb-6 p-3 rounded-xl bg-black/50 border border-phantom-purple/20 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-phantom-lavender">
              <FileText className="w-4 h-4 text-phantom-cyan" />
              <span>{finding.file_path}</span>
              {finding.line_number && (
                <span className="text-phantom-green font-semibold">
                  (Line {finding.line_number})
                </span>
              )}
            </div>
            <span className="text-phantom-muted">Source: {finding.source}</span>
          </div>

          {/* Explanation */}
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-phantom-cyan">
              Spectral Analysis & Explanation
            </h4>
            <p className="text-sm text-phantom-lavender/90 leading-relaxed font-sans bg-phantom-violet/30 p-4 rounded-xl border border-phantom-purple/20">
              {finding.explanation}
            </p>
          </div>

          {/* Evidence snippet (Safely Redacted) */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono uppercase tracking-wider text-phantom-pink">
                Discovered Evidence (Redacted)
              </h4>
              <span className="text-[10px] font-mono text-phantom-green">
                Zero secret leakage guaranteed
              </span>
            </div>
            <pre className="p-4 rounded-xl bg-black/80 border border-phantom-purple/30 font-mono text-xs text-phantom-green overflow-x-auto selection:bg-phantom-purple">
              <code>{finding.evidence}</code>
            </pre>
          </div>

          {/* Remediation */}
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-phantom-green">
              Containment & Remediation Remedy
            </h4>
            <div className="p-4 rounded-xl bg-phantom-green/5 border border-phantom-green/30 text-xs sm:text-sm text-phantom-lavender leading-relaxed">
              {finding.remediation}
            </div>
          </div>

          {/* Status & Actions Footer */}
          <div className="pt-4 border-t border-phantom-purple/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-mono text-phantom-muted">Status:</span>
              <select
                disabled={updating}
                value={finding.status}
                onChange={(e) => handleStatusChange(e.target.value as FindingStatus)}
                className="px-3 py-1.5 rounded-lg bg-black/60 border border-phantom-purple/30 text-xs font-mono text-white focus:outline-none focus:border-phantom-green"
              >
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <NeonButton
                variant="terminal"
                size="sm"
                icon={<Terminal className="w-4 h-4" />}
                onClick={() => {
                  onAskPhantom(finding);
                  onClose();
                }}
              >
                Ask PHANTOM
              </NeonButton>
              <NeonButton variant="secondary" size="sm" onClick={onClose}>
                Close
              </NeonButton>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
