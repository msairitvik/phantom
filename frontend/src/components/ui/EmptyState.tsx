import React from 'react';
import { GhostLogo } from './GhostLogo';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  action,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center glass-panel rounded-2xl border-dashed border-phantom-purple/30">
      <div className="mb-4">
        {icon ? icon : <GhostLogo size="lg" animated />}
      </div>
      <h3 className="text-xl font-bold text-phantom-lavender mb-2">{title}</h3>
      <p className="text-sm text-phantom-muted max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
