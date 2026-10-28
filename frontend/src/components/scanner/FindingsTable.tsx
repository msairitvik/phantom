import React, { useState, useMemo } from 'react';
import { Search, Filter, Eye, ShieldCheck, Check, Clock } from 'lucide-react';
import { Finding, Severity, FindingStatus } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';
import { NeonButton } from '../ui/NeonButton';

interface FindingsTableProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  onQuickStatusChange?: (findingId: string, status: FindingStatus) => void;
}

export const FindingsTable: React.FC<FindingsTableProps> = ({
  findings,
  onSelectFinding,
  onQuickStatusChange
}) => {
  const [search, setSearch] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredFindings = useMemo(() => {
    return findings.filter((f) => {
      const matchSearch =
        search === '' ||
        f.title.toLowerCase().includes(search.toLowerCase()) ||
        f.file_path.toLowerCase().includes(search.toLowerCase()) ||
        f.category.toLowerCase().includes(search.toLowerCase());

      const matchSev = selectedSeverity === 'all' || f.severity === selectedSeverity;
      const matchStatus = selectedStatus === 'all' || f.status === selectedStatus;

      return matchSearch && matchSev && matchStatus;
    });
  }, [findings, search, selectedSeverity, selectedStatus]);

  const severities: Severity[] = ['Critical', 'High', 'Medium', 'Low', 'Informational'];

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-2xl bg-black/40 border border-phantom-purple/20">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-phantom-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search anomalies by title, file, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-phantom-violet/40 border border-phantom-purple/30 text-white placeholder-phantom-muted text-xs font-mono focus:outline-none focus:border-phantom-cyan"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity selector */}
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-xl bg-phantom-violet/40 border border-phantom-purple/30 text-xs font-mono text-phantom-lavender focus:outline-none focus:border-phantom-cyan"
          >
            <option value="all">All Severities ({findings.length})</option>
            {severities.map((sev) => (
              <option key={sev} value={sev}>
                {sev} ({findings.filter((f) => f.severity === sev).length})
              </option>
            ))}
          </select>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl bg-phantom-violet/40 border border-phantom-purple/30 text-xs font-mono text-phantom-lavender focus:outline-none focus:border-phantom-cyan"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>
        </div>
      </div>

      {/* Findings Table */}
      {filteredFindings.length === 0 ? (
        <div className="text-center py-12 p-6 rounded-2xl glass-panel border border-dashed border-phantom-purple/30">
          <ShieldCheck className="w-10 h-10 text-phantom-green mx-auto mb-2 opacity-80" />
          <p className="font-semibold text-white text-sm">No matching anomalies found</p>
          <p className="text-xs font-mono text-phantom-muted mt-1">
            Try adjusting your search query or severity filters.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl glass-panel border border-phantom-purple/20">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead>
              <tr className="border-b border-phantom-purple/20 bg-phantom-violet/50 font-mono text-phantom-muted uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Anomaly Title</th>
                <th className="py-3.5 px-4">File Location</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-phantom-purple/10">
              {filteredFindings.map((finding) => (
                <tr
                  key={finding.id}
                  onClick={() => onSelectFinding(finding)}
                  className="hover:bg-phantom-purple/10 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <SeverityBadge severity={finding.severity} />
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-white group-hover:text-phantom-cyan transition-colors">
                    {finding.title}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-phantom-lavender/80 truncate max-w-xs">
                    {finding.file_path}
                    {finding.line_number && (
                      <span className="text-phantom-green ml-1 font-semibold">
                        :L{finding.line_number}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-phantom-muted">
                    {finding.category}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono capitalize border ${
                        finding.status === 'resolved'
                          ? 'bg-phantom-green/10 text-phantom-green border-phantom-green/30'
                          : finding.status === 'acknowledged'
                          ? 'bg-phantom-amber/10 text-phantom-amber border-phantom-amber/30'
                          : finding.status === 'false_positive'
                          ? 'bg-phantom-muted/20 text-phantom-muted border-phantom-muted/30'
                          : 'bg-phantom-purple/20 text-phantom-lavender border-phantom-purple/30'
                      }`}
                    >
                      {finding.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <NeonButton
                      variant="ghost"
                      size="sm"
                      icon={<Eye className="w-3.5 h-3.5" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectFinding(finding);
                      }}
                    >
                      Inspect
                    </NeonButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
