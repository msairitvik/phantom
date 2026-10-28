import React from 'react';
import { motion } from 'framer-motion';
import { Radar, Terminal, FolderCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { GhostLogo } from '../ui/GhostLogo';
import { NeonButton } from '../ui/NeonButton';

interface HeroSectionProps {
  currentWorkspace: string;
  onBeginScan: () => void;
  onOpenTerminal: () => void;
  onUseSampleProject: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  currentWorkspace,
  onBeginScan,
  onOpenTerminal,
  onUseSampleProject
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl glass-panel border border-phantom-purple/30 p-8 md:p-12 mb-8 bg-gradient-to-br from-[#120826]/90 via-[#0A0518]/90 to-[#170B2B]/90 shadow-2xl">
      {/* Background ambient glow circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-phantom-purple/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-phantom-green/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left Column: Text & Call to Action */}
        <div className="max-w-2xl text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-phantom-purple/20 border border-phantom-purple/40 text-xs font-mono text-phantom-cyan mb-4">
            <Sparkles className="w-3.5 h-3.5 text-phantom-green animate-spin" />
            <span>GHOST IN THE MACHINE • LOCAL AI SENTINEL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-tight mb-4 text-white">
            THE MACHINE HAS{' '}
            <span className="bg-gradient-to-r from-phantom-green via-phantom-cyan to-phantom-purple bg-clip-text text-transparent">
              AWAKENED.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-phantom-lavender/80 mb-6 leading-relaxed font-sans font-light">
            PHANTOM is a local-first AI coding investigator that inhabits your computer.
            It hunts for exposed secrets, security hazards, and code anomalies, explaining every finding with sharp supernatural wit.
          </p>

          {/* Current Workspace selector & Sample Project chip */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-8 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-phantom-lavender">
              <FolderCheck className="w-4 h-4 text-phantom-green" />
              <span className="text-phantom-muted">Target:</span>
              <span className="font-semibold text-white truncate max-w-xs">{currentWorkspace}</span>
            </div>

            <button
              onClick={onUseSampleProject}
              className="px-3 py-1.5 rounded-xl bg-phantom-purple/20 hover:bg-phantom-purple/30 text-phantom-cyan border border-phantom-purple/40 transition-all cursor-pointer flex items-center gap-1.5 hover:shadow-glow-cyan"
            >
              <span>Load Safe Sample Project</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
            <NeonButton
              variant="primary"
              size="lg"
              icon={<Radar className="w-5 h-5" />}
              onClick={onBeginScan}
            >
              Begin Investigation
            </NeonButton>

            <NeonButton
              variant="terminal"
              size="lg"
              icon={<Terminal className="w-5 h-5" />}
              onClick={onOpenTerminal}
            >
              Open Terminal
            </NeonButton>
          </div>
        </div>

        {/* Right Column: Ghost Mascot Animation */}
        <div className="shrink-0 relative flex flex-col items-center">
          <motion.div
            animate={{
              y: [-8, 8, -8],
              rotate: [-2, 2, -2]
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <GhostLogo size="xl" />
          </motion.div>

          <div className="mt-4 px-3 py-1 rounded-full bg-black/60 border border-phantom-green/30 text-[11px] font-mono text-phantom-green flex items-center gap-1.5 shadow-glow-green">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% LOCAL • ZERO CLOUD TELEMETRY</span>
          </div>
        </div>
      </div>
    </div>
  );
};
