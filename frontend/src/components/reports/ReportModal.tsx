import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Copy, Check, FileText, Code2, AlertCircle } from 'lucide-react';
import { NeonButton } from '../ui/NeonButton';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';

interface ReportModalProps {
  investigationId: string | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  investigationId,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!investigationId) return;
    loadReport();
  }, [investigationId, activeTab]);

  const loadReport = async () => {
    if (!investigationId) return;
    setLoading(true);
    try {
      if (activeTab === 'markdown') {
        const url = api.getMarkdownReportUrl(investigationId);
        const res = await fetch(url);
        const text = await res.text();
        setContent(text);
      } else {
        const json = await api.getJSONReport(investigationId);
        setContent(JSON.stringify(json, null, 2));
      }
    } catch (e: any) {
      showToast('error', 'Failed to load report', e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!investigationId) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast('success', 'Report copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = activeTab === 'markdown' ? 'md' : 'json';
    const mime = activeTab === 'markdown' ? 'text/markdown' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `phantom-investigation-${investigationId}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', `Exported phantom-investigation-${investigationId}.${ext}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-3xl border border-phantom-purple/40 bg-[#0C061C] shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-phantom-purple/20 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-phantom-green" />
              <h3 className="text-xl font-bold font-display text-white">
                Export Investigation Report
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-phantom-muted hover:text-white hover:bg-phantom-purple/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-phantom-purple/20">
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'markdown'
                    ? 'bg-phantom-purple/30 text-white border border-phantom-purple/40'
                    : 'text-phantom-muted hover:text-white'
                }`}
              >
                Markdown (.md)
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  activeTab === 'json'
                    ? 'bg-phantom-purple/30 text-white border border-phantom-purple/40'
                    : 'text-phantom-muted hover:text-white'
                }`}
              >
                JSON (.json)
              </button>
            </div>

            <div className="flex items-center gap-2">
              <NeonButton
                variant="ghost"
                size="sm"
                icon={copied ? <Check className="w-4 h-4 text-phantom-green" /> : <Copy className="w-4 h-4" />}
                onClick={handleCopy}
              >
                {copied ? 'Copied' : 'Copy'}
              </NeonButton>
              <NeonButton
                variant="primary"
                size="sm"
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
              >
                Download Report
              </NeonButton>
            </div>
          </div>

          {/* Preview Viewport */}
          <div className="flex-1 overflow-y-auto p-4 rounded-2xl bg-black/70 border border-phantom-purple/20 font-mono text-xs text-phantom-lavender whitespace-pre-wrap leading-relaxed select-text">
            {loading ? (
              <div className="text-center py-12 text-phantom-muted animate-pulse">
                Generating spectral dossier...
              </div>
            ) : (
              content
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
