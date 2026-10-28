import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  gradientBorder?: boolean;
  hoverEffect?: boolean;
  glowColor?: 'purple' | 'green' | 'cyan' | 'crimson' | 'amber';
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  gradientBorder = false,
  hoverEffect = false,
  glowColor,
  onClick
}) => {
  const glowMap = {
    purple: 'hover:shadow-glow-purple hover:border-phantom-purple/50',
    green: 'hover:shadow-glow-green hover:border-phantom-green/50',
    cyan: 'hover:shadow-glow-cyan hover:border-phantom-cyan/50',
    crimson: 'hover:shadow-glow-crimson hover:border-phantom-crimson/50',
    amber: 'hover:border-phantom-amber/50'
  };

  const selectedGlow = glowColor ? glowMap[glowColor] : 'hover:border-phantom-purple/40';

  if (gradientBorder) {
    return (
      <div
        onClick={onClick}
        className={`gradient-border p-[1px] relative rounded-2xl group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      >
        <div className={`glass-panel rounded-2xl p-6 h-full transition-all duration-300 ${hoverEffect ? 'group-hover:bg-[#1A0E36]/80' : ''}`}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`glass-panel rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? `glass-panel-hover ${selectedGlow}` : ''
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
