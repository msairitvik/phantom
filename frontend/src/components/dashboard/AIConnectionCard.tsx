import React, { useState } from 'react';
import { Cpu, CheckCircle2, XCircle, ArrowUpRight, Zap, RefreshCw, Terminal } from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { SystemStatus } from '../../types';
import { api } from '../../services/api';

interface AIConnectionCardProps {
  systemStatus: SystemStatus | null;
  onRefresh: () => void;
}

export const AIConnectionCard: React.FC<AIConnectionCardProps> = ({
  systemStatus,
  onRefresh
}) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const isReachable = systemStatus?.ollama_reachable ?? false;
  const isInstalled = systemStatus?.model_installed ?? false;
  const activeModel = systemStatus?.active_model || 'qwen3:4b';
  const models = systemStatus?.available_models || [];

  const handleTestLink = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await api.testAIConnection();
      if (res.success) {
        setTestResult(`Operational • Active Model: ${res.active_model}`);
      } else {
        setTestResult(`Failed: ${res.message}`);
      }
    } catch (e: any) {
      setTestResult(`Connection Error: ${e.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <GlassCard glowColor={isReachable ? 'green' : 'crimson'} className="h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${isReachable ? 'bg-phantom-green/15 text-phantom-green border-phantom-green/30' : 'bg-phantom-crimson/15 text-phantom-crimson border-phantom-crimson/30'}`}>
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Local AI Engine</h3>
              <p className="text-xs font-mono text-phantom-muted">Ollama Local Inference</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isReachable ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-phantom-green/10 text-phantom-green border border-phantom-green/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ONLINE</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-phantom-crimson/10 text-phantom-crimson border border-phantom-crimson/30">
                <XCircle className="w-3.5 h-3.5" />
                <span>OFFLINE</span>
              </span>
            )}
          </div>
        </div>

        {/* Model info details */}
        <div className="space-y-3 mb-4 text-xs font-mono">
          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-black/40 border border-phantom-purple/15">
            <span className="text-phantom-muted">Configured Model</span>
            <span className="font-semibold text-phantom-cyan">{activeModel}</span>
          </div>

          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-black/40 border border-phantom-purple/15">
            <span className="text-phantom-muted">Model Installed</span>
            <span className={isInstalled ? 'text-phantom-green font-semibold' : 'text-phantom-amber font-semibold'}>
              {isInstalled ? 'Installed Locally' : 'Not Pulled'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-black/40 border border-phantom-purple/15">
            <span className="text-phantom-muted">Available Models</span>
            <span className="text-phantom-lavender truncate max-w-[160px]">
              {models.length > 0 ? models.join(', ') : 'None detected'}
            </span>
          </div>
        </div>

        {/* Test Result feedback */}
        {testResult && (
          <div className="mb-4 p-2.5 rounded-lg bg-phantom-violet/60 border border-phantom-purple/30 text-xs font-mono text-phantom-lavender">
            {testResult}
          </div>
        )}

        {/* Offline Guidance */}
        {!isReachable && (
          <div className="p-3 rounded-xl bg-phantom-crimson/10 border border-phantom-crimson/30 text-xs text-phantom-lavender mb-4 space-y-1">
            <p className="font-semibold text-phantom-crimson flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5" />
              <span>Ollama is not running</span>
            </p>
            <p className="text-[11px] text-phantom-muted">
              Start Ollama in your terminal: <code className="bg-black/60 px-1 py-0.5 rounded text-phantom-green">ollama serve</code>
            </p>
            <p className="text-[11px] text-phantom-muted">
              Download model: <code className="bg-black/60 px-1 py-0.5 rounded text-phantom-cyan">ollama pull {activeModel}</code>
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-phantom-purple/10">
        <NeonButton
          variant="secondary"
          size="sm"
          className="flex-1"
          icon={<Zap className="w-3.5 h-3.5" />}
          onClick={handleTestLink}
          loading={testing}
        >
          Test Intelligence Link
        </NeonButton>
        <button
          onClick={onRefresh}
          className="p-2 rounded-xl bg-phantom-violet/40 hover:bg-phantom-violet border border-phantom-purple/30 text-phantom-muted hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
    </GlassCard>
  );
};
