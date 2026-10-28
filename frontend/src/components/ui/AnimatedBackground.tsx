import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  showScanlines?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ showScanlines = true }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#070511]">
      {/* Deep atmospheric radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.18),rgba(7,5,17,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_80%_80%,rgba(0,229,255,0.08),rgba(7,5,17,0))]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_90%,rgba(57,255,136,0.08),rgba(7,5,17,0))]" />

      {/* Floating Spectral Nebula Orb 1 */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-phantom-purple/15 to-transparent blur-3xl"
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.15, 0.9, 1]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Floating Spectral Nebula Orb 2 */}
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] rounded-full bg-gradient-to-br from-phantom-cyan/10 to-phantom-green/10 blur-3xl"
        animate={{
          x: [0, -60, 40, 0],
          y: [0, 40, -50, 0],
          scale: [1, 0.9, 1.2, 1]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Subtle Terminal Scanlines Overlay */}
      {showScanlines && <div className="absolute inset-0 scanlines opacity-35" />}
    </div>
  );
};
