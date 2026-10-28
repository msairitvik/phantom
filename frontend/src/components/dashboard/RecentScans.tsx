import React from 'react';
import { ShieldAlert, ExternalLink, Trash2, GitBranch, FileText } from 'lucide-react';
import { Investigation } from '../../types';
import { SeverityBadge } from '../ui/SeverityBadge';

interface RecentScansProps {
  investigations: Investigation[];
  onSelect: (inv: Investigation) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const RecentScans: React.FC<RecentScansProps> = ({
  investigations,
  onSelect,
  onDelete
}) => {
  if (investigations.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-phantom-muted font-mono">
        No recorded investigations yet. Begin by scanning a project directory.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {investigations.slice(0, 6).map((inv) => (
        <div
          key={inv.id}
          onClick={() => onSelect(inv)}
          className="glass-panel rounded-2xl p-5 border border-phantom-purple/20 hover:border-phantom-purple/50 hover:bg-[#150B2D] cursor-pointer transition-all duration-200 group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-bold text-white text-base group-hover:text-phantom-cyan transition-colors truncate">
                {inv.project_name}
              </h4>
              <button
                onClick={(e) => onDelete(inv.id, e)}
                className="opacity-0 group-hover:opacity-100 p-1 text-phantom-muted hover:text-phantom-crimson transition-all"
                title="Purge investigation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-phantom-muted truncate mb-4">
              {inv.workspace_path}
            </p>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-black/40 border border-phantom-purple/15 text-xs font-mono mb-4 text-center">
              <div>
                <span className="text-phantom-muted block text-[10px]">FILES</span>
                <span className="font-bold text-white">{inv.total_files}</span>
              </div>
              <div>
                <span className="text-phantom-muted block text-[10px]">CRITICAL</span>
                <span className={`font-bold ${inv.critical_count > 0 ? 'text-phantom-crimson' : 'text-phantom-green'}`}>
                  {inv.critical_count}
                </span>
              </div>
              <div>
                <span className="text-phantom-muted block text-[10px]">HIGH</span>
                <span className={`font-bold ${inv.high_count > 0 ? 'text-phantom-pink' : 'text-phantom-green'}`}>
                  {inv.high_count}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-phantom-purple/15 text-xs font-mono text-phantom-muted">
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-phantom-purple" />
              <span>{new Date(inv.created_at).toLocaleDateString()}</span>
            </span>

            {inv.git_branch && (
              <span className="flex items-center gap-1 text-phantom-cyan">
                <GitBranch className="w-3.5 h-3.5" />
                <span>{inv.git_branch}</span>
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
