import React from 'react';

export const LoadingSkeleton: React.FC<{ rows?: number; height?: string }> = ({
  rows = 3,
  height = 'h-12'
}) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className={`${height} w-full rounded-xl bg-gradient-to-r from-phantom-purple/10 via-phantom-purple/20 to-phantom-purple/10 animate-pulse border border-phantom-purple/10`}
        />
      ))}
    </div>
  );
};
