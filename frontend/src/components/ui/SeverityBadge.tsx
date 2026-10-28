import React from 'react';
import { Severity } from '../../types';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: Severity;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showIcon = true,
  size = 'sm'
}) => {
  const configs: Record<Severity, { bg: string; text: string; border: string; glow: string; icon: React.ReactNode }> = {
    Critical: {
      bg: 'bg-phantom-crimson/15',
      text: 'text-phantom-crimson font-bold',
      border: 'border-phantom-crimson/50',
      glow: 'shadow-[0_0_10px_rgba(255,54,94,0.3)]',
      icon: <ShieldAlert className="w-3.5 h-3.5" />
    },
    High: {
      bg: 'bg-phantom-pink/15',
      text: 'text-phantom-pink font-semibold',
      border: 'border-phantom-pink/50',
      glow: 'shadow-[0_0_8px_rgba(255,60,172,0.25)]',
      icon: <AlertOctagon className="w-3.5 h-3.5" />
    },
    Medium: {
      bg: 'bg-phantom-amber/15',
      text: 'text-phantom-amber font-medium',
      border: 'border-phantom-amber/50',
      glow: '',
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    Low: {
      bg: 'bg-phantom-purple/15',
      text: 'text-phantom-purple font-medium',
      border: 'border-phantom-purple/50',
      glow: '',
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
    Informational: {
      bg: 'bg-phantom-cyan/15',
      text: 'text-phantom-cyan font-medium',
      border: 'border-phantom-cyan/50',
      glow: '',
      icon: <Info className="w-3.5 h-3.5" />
    }
  };

  const current = configs[severity] || configs.Informational;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border uppercase tracking-wider ${sizeClasses} ${current.bg} ${current.text} ${current.border} ${current.glow}`}
    >
      {showIcon && current.icon}
      <span>{severity}</span>
    </span>
  );
};
