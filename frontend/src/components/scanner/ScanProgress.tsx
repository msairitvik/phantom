import React from 'react';
import { motion } from 'framer-motion';
import { GhostLogo } from '../ui/GhostLogo';

interface ScanProgressProps {
  stage: string;
  progressPercent?: number;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({
  stage,
  progressPercent = 65
}) => {
  return (
    <div className="glass-panel p-8 rounded-3xl border border-phantom-purple/40 text-center max-w-lg mx-auto bg-[#0E0620]/95 shadow-glow-purple">
      <div className="flex justify-center mb-6">
        <GhostLogo size="xl" animated />
      </div>

      <h3 className="text-xl font-bold font-display text-white mb-2 tracking-wide">
        PHANTOM SURVEILLANCE IN PROGRESS
      </h3>

      <p className="text-sm font-mono text-phantom-green mb-6 animate-pulse">
        {stage || 'Awakening spectral sensors...'}
      </p>

      {/* Animated glowing progress bar */}
      <div className="w-full bg-black/60 rounded-full h-3 overflow-hidden p-[2px] border border-phantom-purple/30 mb-4">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-phantom-purple via-phantom-green to-phantom-cyan"
          initial={{ width: '15%' }}
          animate={{
            width: ['20%', '85%', '95%'],
            transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }
          }}
        />
      </div>

      <p className="text-xs font-mono text-phantom-muted">
        Inspecting local workspace without cloud transmission • Safe & Read-Only
      </p>
    </div>
  );
};
