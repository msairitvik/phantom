import React from 'react';
import { motion } from 'framer-motion';

interface GhostLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
}

export const GhostLogo: React.FC<GhostLogoProps> = ({ size = 'md', animated = true }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  return (
    <motion.div
      className={`relative ${sizeMap[size]} flex items-center justify-center`}
      animate={
        animated
          ? {
              y: [-2, 4, -2],
              rotate: [-1, 1, -1]
            }
          : undefined
      }
      transition={{
        duration: 3.5,
        repeat: Infinity,
        ease: 'easeInOut' as const
      }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-phantom-purple via-phantom-green to-phantom-cyan opacity-40 blur-lg rounded-full" />
      
      {/* Ghost SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 drop-shadow-[0_0_12px_rgba(57,255,136,0.6)]"
      >
        <defs>
          <linearGradient id="ghostGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#39FF88" />
            <stop offset="45%" stopColor="#A855F7" />
            <stop offset="100%" stopColor="#00E5FF" />
          </linearGradient>
        </defs>
        
        {/* Spectral body */}
        <path
          d="M 50 15 C 30 15 22 28 22 52 C 22 75 25 82 30 78 C 36 74 40 82 46 78 C 52 74 56 82 62 78 C 68 74 72 82 78 78 C 82 74 78 75 78 52 C 78 28 70 15 50 15 Z"
          fill="url(#ghostGradient)"
        />

        {/* Outer eye sockets */}
        <ellipse cx="38" cy="42" rx="5" ry="7" fill="#070511" />
        <ellipse cx="62" cy="42" rx="5" ry="7" fill="#070511" />

        {/* Glowing pupils with spooky gaze */}
        <circle cx="40" cy="41" r="2.5" fill="#39FF88">
          {animated && (
            <animate
              attributeName="r"
              values="2.5; 3.2; 2.5"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>
        <circle cx="64" cy="41" r="2.5" fill="#39FF88">
          {animated && (
            <animate
              attributeName="r"
              values="2.5; 3.2; 2.5"
              dur="2s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Witty / eerie mouth */}
        <ellipse cx="50" cy="57" rx="5" ry="6.5" fill="#070511" />
      </svg>
    </motion.div>
  );
};
