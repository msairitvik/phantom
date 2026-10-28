import React from 'react';

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'scanning' | 'ready';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const configs = {
    online: {
      dot: 'bg-phantom-green shadow-[0_0_8px_#39FF88]',
      badge: 'bg-phantom-green/10 text-phantom-green border-phantom-green/30',
      defaultLabel: 'AI ONLINE'
    },
    offline: {
      dot: 'bg-phantom-crimson shadow-[0_0_8px_#FF365E]',
      badge: 'bg-phantom-crimson/10 text-phantom-crimson border-phantom-crimson/30',
      defaultLabel: 'AI OFFLINE'
    },
    scanning: {
      dot: 'bg-phantom-cyan animate-ping shadow-[0_0_8px_#00E5FF]',
      badge: 'bg-phantom-cyan/10 text-phantom-cyan border-phantom-cyan/30',
      defaultLabel: 'SCANNING'
    },
    ready: {
      dot: 'bg-phantom-purple shadow-[0_0_8px_#A855F7]',
      badge: 'bg-phantom-purple/10 text-phantom-purple border-phantom-purple/30',
      defaultLabel: 'READY'
    }
  };

  const current = configs[status];
  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-medium rounded-full border backdrop-blur-md ${sizeClass} ${current.badge}`}
    >
      <span className={`w-2 h-2 rounded-full ${current.dot}`} />
      <span>{label || current.defaultLabel}</span>
    </span>
  );
};
