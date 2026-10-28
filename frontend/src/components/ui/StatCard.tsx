import React from 'react';
import { GlassCard } from './GlassCard';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'purple' | 'green' | 'cyan' | 'crimson' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'purple'
}) => {
  const colorMap = {
    purple: {
      border: 'hover:border-phantom-purple/50',
      iconBg: 'bg-phantom-purple/15 text-phantom-purple border-phantom-purple/30',
      textGrad: 'from-phantom-lavender to-phantom-purple'
    },
    green: {
      border: 'hover:border-phantom-green/50',
      iconBg: 'bg-phantom-green/15 text-phantom-green border-phantom-green/30',
      textGrad: 'from-white to-phantom-green'
    },
    cyan: {
      border: 'hover:border-phantom-cyan/50',
      iconBg: 'bg-phantom-cyan/15 text-phantom-cyan border-phantom-cyan/30',
      textGrad: 'from-white to-phantom-cyan'
    },
    crimson: {
      border: 'hover:border-phantom-crimson/50',
      iconBg: 'bg-phantom-crimson/15 text-phantom-crimson border-phantom-crimson/30',
      textGrad: 'from-white to-phantom-crimson'
    },
    amber: {
      border: 'hover:border-phantom-amber/50',
      iconBg: 'bg-phantom-amber/15 text-phantom-amber border-phantom-amber/30',
      textGrad: 'from-white to-phantom-amber'
    }
  };

  const current = colorMap[color];

  return (
    <GlassCard hoverEffect glowColor={color} className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase font-mono tracking-wider text-phantom-muted mb-1">
            {title}
          </p>
          <h3 className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r ${current.textGrad} bg-clip-text text-transparent`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-phantom-muted/80 mt-1.5 font-sans">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${current.iconBg} shadow-sm shrink-0`}>
          {icon}
        </div>
      </div>
    </GlassCard>
  );
};
