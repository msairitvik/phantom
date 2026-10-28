import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Cpu, Lock, Globe, Terminal, Layers, FileCode } from 'lucide-react';
import { NeonButton } from '../ui/NeonButton';
import { GhostLogo } from '../ui/GhostLogo';

interface WhyOpenAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhyOpenAIModal: React.FC<WhyOpenAIModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 15 }}
          className="relative w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border border-phantom-purple/40 bg-[#0C061C] shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-phantom-purple/20 mb-6">
            <div className="flex items-center gap-3">
              <GhostLogo size="md" />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold font-display text-white">
                  Why Open AI Matters 🌐
                </h3>
                <p className="text-xs font-mono text-phantom-green">
                  Ghost in the Machine • Local-First Architecture
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-phantom-muted hover:text-white hover:bg-phantom-purple/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 text-sm text-phantom-lavender/90 font-sans leading-relaxed">
            {/* Mission Statement */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-phantom-purple/15 to-phantom-cyan/10 border border-phantom-purple/30">
              <h4 className="font-bold text-white text-base mb-1">
                The Ghost in Your Machine, Not in the Cloud
              </h4>
              <p className="text-xs sm:text-sm text-phantom-lavender">
                In security analysis, your source code, configuration files, and environment structures contain your most confidential intellectual property. Sending this data across the internet to closed cloud APIs risks leakage, third-party model training, and privacy compliance violations.
              </p>
            </div>

            {/* Core Pillars Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-phantom-purple/20">
                <div className="flex items-center gap-2 text-phantom-cyan font-bold mb-2">
                  <Lock className="w-4 h-4" />
                  <span>Absolute Data Sovereignty</span>
                </div>
                <p className="text-xs text-phantom-muted">
                  PHANTOM runs inference completely on your local machine using Ollama. No source code, findings, or token data ever leave your localhost boundary.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-phantom-purple/20">
                <div className="flex items-center gap-2 text-phantom-green font-bold mb-2">
                  <Globe className="w-4 h-4" />
                  <span>Offline Independence</span>
                </div>
                <p className="text-xs text-phantom-muted">
                  Once your open-weight model (e.g. Qwen 3) is pulled, PHANTOM functions seamlessly on an airplane, in high-security airgapped enclaves, or during ISP outages without internet.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-phantom-purple/20">
                <div className="flex items-center gap-2 text-phantom-purple font-bold mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Model Freedom & Swappability</span>
                </div>
                <p className="text-xs text-phantom-muted">
                  You are not locked into any proprietary vendor. You can switch models from <code className="text-white">qwen3:4b</code> to <code className="text-white">gemma2:2b</code> or custom fine-tuned GGUF checkpoints with a single setting.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-phantom-purple/20">
                <div className="flex items-center gap-2 text-phantom-amber font-bold mb-2">
                  <Cpu className="w-4 h-4" />
                  <span>Transparent Economics</span>
                </div>
                <p className="text-xs text-phantom-muted">
                  No hidden credit card subscriptions or rate limits. Local inference trades local hardware compute and RAM rather than billing you per 1,000 input/output tokens.
                </p>
              </div>
            </div>

            {/* Open Source Software & Licenses Table */}
            <div className="p-4 rounded-2xl bg-black/50 border border-phantom-purple/20">
              <h4 className="text-xs font-mono uppercase tracking-wider text-phantom-cyan mb-3">
                Component Licenses & Open Technology Stack
              </h4>
              <div className="overflow-x-auto text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="border-b border-phantom-purple/20 text-phantom-muted">
                    <tr>
                      <th className="pb-2">Component</th>
                      <th className="pb-2">Role</th>
                      <th className="pb-2">License</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-phantom-purple/10 text-phantom-lavender">
                    <tr>
                      <td className="py-2 font-bold text-white">PHANTOM Core</td>
                      <td>Application Source</td>
                      <td className="text-phantom-green">MIT License</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">Ollama Engine</td>
                      <td>Local Model Server</td>
                      <td className="text-phantom-green">MIT License</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">Qwen 2.5 / 3</td>
                      <td>Open-weight LLM</td>
                      <td className="text-phantom-cyan">Apache 2.0 / Qwen Research</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">FastAPI & React</td>
                      <td>Backend & Frontend</td>
                      <td className="text-phantom-green">MIT / BSD</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-bold text-white">SQLite</td>
                      <td>Local Memory Storage</td>
                      <td className="text-phantom-green">Public Domain</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-phantom-purple/20 flex justify-end">
            <NeonButton variant="primary" size="sm" onClick={onClose}>
              Understood • Return to Terminal
            </NeonButton>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
