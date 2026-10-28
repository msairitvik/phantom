import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Zap, Database, Shield, Sliders } from 'lucide-react';
import { AppSettings, SystemStatus } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { NeonButton } from '../ui/NeonButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface SettingsViewProps {
  systemStatus: SystemStatus | null;
  onRefreshStatus: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  systemStatus,
  onRefreshStatus
}) => {
  const [settingsData, setSettingsData] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettingsData(data);
    } catch (e: any) {
      showToast('error', 'Failed to load settings', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsData) return;
    setSaving(true);
    try {
      const updated = await api.updateSettings(settingsData);
      setSettingsData(updated);
      showToast('success', 'Spectral settings preserved');
      onRefreshStatus();
    } catch (e: any) {
      showToast('error', 'Error updating settings', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTestLink = async () => {
    setTesting(true);
    try {
      const res = await api.testAIConnection();
      if (res.success) {
        showToast('success', 'Intelligence link operational', `Active model: ${res.active_model}`);
      } else {
        showToast('warning', 'Ollama unreachable', res.message);
      }
    } catch (e: any) {
      showToast('error', 'Connection test failed', e.message);
    } finally {
      setTesting(false);
    }
  };

  if (loading || !settingsData) {
    return (
      <div className="text-center py-24 text-phantom-muted font-mono animate-pulse">
        Retrieving arcane configuration parameters...
      </div>
    );
  }

  const detectedModels = systemStatus?.available_models || [];

  return (
    <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-6">
      {/* AI Inference Settings */}
      <GlassCard>
        <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-6">
          <div className="flex items-center gap-2.5 text-phantom-cyan">
            <Zap className="w-5 h-5" />
            <h3 className="font-bold text-white text-base">Ollama AI Connection</h3>
          </div>
          <NeonButton
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleTestLink}
            loading={testing}
          >
            Test Link
          </NeonButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Ollama Base URL
            </label>
            <input
              type="text"
              value={settingsData.ollama_base_url}
              onChange={(e) =>
                setSettingsData({ ...settingsData, ollama_base_url: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-white focus:outline-none focus:border-phantom-cyan"
            />
            <p className="text-[11px] text-phantom-muted mt-1 font-sans">
              Default local daemon endpoint (typically http://127.0.0.1:11434).
            </p>
          </div>

          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Active Investigation Model
            </label>
            <input
              type="text"
              value={settingsData.ollama_model}
              onChange={(e) =>
                setSettingsData({ ...settingsData, ollama_model: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-white focus:outline-none focus:border-phantom-cyan"
            />
            {detectedModels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-[10px] text-phantom-muted">Installed:</span>
                {detectedModels.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSettingsData({ ...settingsData, ollama_model: m })}
                    className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                      settingsData.ollama_model === m
                        ? 'bg-phantom-green/20 text-phantom-green border-phantom-green/40'
                        : 'bg-phantom-violet/40 text-phantom-muted hover:text-white border-phantom-purple/20'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Safety & Scan Boundaries */}
      <GlassCard>
        <div className="flex items-center gap-2.5 pb-3 border-b border-phantom-purple/20 mb-6 text-phantom-green">
          <Shield className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Scanner Safeguards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Max Files Per Scan
            </label>
            <input
              type="number"
              value={settingsData.max_scan_files}
              onChange={(e) =>
                setSettingsData({ ...settingsData, max_scan_files: parseInt(e.target.value) || 1000 })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-white focus:outline-none focus:border-phantom-cyan"
            />
            <p className="text-[11px] text-phantom-muted mt-1 font-sans">
              Prevents memory spikes on vast monorepos. Default: 2,000 files.
            </p>
          </div>

          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Max File Size (Bytes)
            </label>
            <input
              type="number"
              value={settingsData.max_file_size_bytes}
              onChange={(e) =>
                setSettingsData({
                  ...settingsData,
                  max_file_size_bytes: parseInt(e.target.value) || 1048576
                })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-white focus:outline-none focus:border-phantom-cyan"
            />
            <p className="text-[11px] text-phantom-muted mt-1 font-sans">
              Oversized files are skipped for safety. 1MB = 1,048,576 bytes.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Interface & Visual Experience */}
      <GlassCard>
        <div className="flex items-center gap-2.5 pb-3 border-b border-phantom-purple/20 mb-6 text-phantom-purple">
          <Sliders className="w-5 h-5" />
          <h3 className="font-bold text-white text-base">Interface Atmosphere</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Animation Level
            </label>
            <select
              value={settingsData.animation_level}
              onChange={(e) =>
                setSettingsData({ ...settingsData, animation_level: e.target.value })
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-phantom-purple/30 text-white focus:outline-none focus:border-phantom-cyan"
            >
              <option value="high">High (Full Spectral Particles & Floats)</option>
              <option value="low">Low (Restrained Glows)</option>
              <option value="off">Off (Minimal Motion)</option>
            </select>
          </div>

          <div>
            <label className="block text-phantom-muted mb-2 uppercase tracking-wider">
              Database Path
            </label>
            <div className="p-2.5 rounded-xl bg-black/40 border border-phantom-purple/20 text-phantom-muted truncate">
              {settingsData.database_path}
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex justify-end gap-3 pt-4">
        <NeonButton
          type="submit"
          variant="primary"
          size="md"
          icon={<Save className="w-4 h-4" />}
          loading={saving}
        >
          Save Configuration
        </NeonButton>
      </div>
    </form>
  );
};
