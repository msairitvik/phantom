import React from 'react';
import { Clock, ShieldAlert, CheckCircle, Radar } from 'lucide-react';
import { Investigation } from '../../types';

interface ActivityTimelineProps {
  investigations: Investigation[];
  onSelectInvestigation: (inv: Investigation) => void;
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  investigations,
  onSelectInvestigation
}) => {
  if (investigations.length === 0) {
    return (
      <div className="p-6 text-center text-xs font-mono text-phantom-muted">
        No spectral activity detected. Run your first investigation to populate the timeline.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-phantom-purple before:via-phantom-green before:to-phantom-cyan">
      {investigations.slice(0, 5).map((inv) => {
        const hasCritical = inv.critical_count > 0;
        const hasHigh = inv.high_count > 0;
        
        return (
          <div
            key={inv.id}
            onClick={() => onSelectInvestigation(inv)}
            className="group relative cursor-pointer"
          >
            {/* Timeline node */}
            <div
              className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-[#070511] transition-transform group-hover:scale-125 ${
                hasCritical
                  ? 'bg-phantom-crimson shadow-[0_0_8px_#FF365E]'
                  : hasHigh
                  ? 'bg-phantom-pink shadow-[0_0_8px_#FF3CAC]'
                  : 'bg-phantom-green shadow-[0_0_8px_#39FF88]'
              }`}
            />

            <div className="p-3.5 rounded-xl bg-black/30 border border-phantom-purple/20 group-hover:border-phantom-purple/50 group-hover:bg-phantom-violet/30 transition-all">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-white group-hover:text-phantom-cyan transition-colors">
                  {inv.project_name}
                </span>
                <span className="text-[11px] font-mono text-phantom-muted">
                  {new Date(inv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-phantom-muted">
                <span>{inv.total_files} files scanned</span>
                <span>•</span>
                {inv.critical_count + inv.high_count > 0 ? (
                  <span className="text-phantom-crimson font-semibold">
                    {inv.critical_count + inv.high_count} critical/high hazards
                  </span>
                ) : (
                  <span className="text-phantom-green">Clean scan</span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
