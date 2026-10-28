import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Send, Trash2, Sparkles, HelpCircle, CornerDownLeft } from 'lucide-react';
import { Investigation, ChatMessage } from '../../types';
import { api } from '../../services/api';
import { GhostLogo } from '../ui/GhostLogo';

interface TerminalConsoleProps {
  currentInvestigation?: Investigation | null;
  onRunScan?: () => void;
  onOpenWhyOpenAI?: () => void;
  initialQuery?: string | null;
}

interface LogEntry {
  id: string;
  type: 'user' | 'phantom' | 'system' | 'command';
  text: string;
  timestamp: string;
}

export const TerminalConsole: React.FC<TerminalConsoleProps> = ({
  currentInvestigation,
  onRunScan,
  onOpenWhyOpenAI,
  initialQuery
}) => {
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      type: 'system',
      text: '👻 PHANTOM TERMINAL SUBSYSTEM INITIALIZED [VERSION 1.0.0]\nConnected to local memory matrix. Type "help" for arcane commands.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Handle external query triggers (e.g. from "Ask PHANTOM" in finding detail)
  useEffect(() => {
    if (initialQuery) {
      handleExecuteCommand(initialQuery);
    }
  }, [initialQuery]);

  const addLog = (type: LogEntry['type'], text: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        type,
        text,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  };

  const handleExecuteCommand = async (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    // Add to command history
    setCommandHistory((prev) => [trimmed, ...prev.filter((c) => c !== trimmed)]);
    setHistoryIndex(-1);
    setInput('');

    // User log entry
    addLog('user', trimmed);

    const lower = trimmed.toLowerCase();

    // 1. Built-in Commands
    if (lower === 'clear') {
      setLogs([]);
      return;
    }

    if (lower === 'help') {
      addLog(
        'system',
        `📜 ARCANE PHANTOM COMMANDS:
  help           - Display this supernatural grimoire
  status         - Probe Ollama reachability & system vital signs
  scan           - Trigger a deep recursive investigation
  findings       - Reveal all anomalies detected in current scan
  history        - Query persistent archive of previous investigations
  model          - Inspect active local LLM & Ollama catalog
  why-open-ai    - Learn why local open-weight AI protects your code
  clear          - Cleanse terminal scrollback

💬 Or ask any natural language question:
  "What is the most serious finding?"
  "Explain this issue like I am a beginner."
  "How can I safely contain the AWS credential hazard?"`
      );
      return;
    }

    if (lower === 'status') {
      setLoading(true);
      try {
        const sys = await api.getSystemStatus();
        addLog(
          'system',
          `🖥️ SYSTEM VITAL SIGNS:
  Engine Status:  ${sys.backend_status.toUpperCase()}
  Local Ollama:   ${sys.ollama_reachable ? 'ONLINE (127.0.0.1:11434)' : 'OFFLINE'}
  Active Model:   ${sys.active_model} (${sys.model_installed ? 'Installed' : 'Needs Pull'})
  Investigations: ${sys.total_investigations} recorded
  Anomalies Flag: ${sys.total_findings} total findings in archive
  Database:       ${sys.database_path}`
        );
      } catch (e: any) {
        addLog('system', `❌ Error reading vital signs: ${e.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (lower === 'scan') {
      if (onRunScan) {
        addLog('system', '👻 Awaking spectral sensors... Initiating workspace scan.');
        onRunScan();
      } else {
        addLog('system', '⚠️ Scan capability not bound to current terminal view.');
      }
      return;
    }

    if (lower === 'why-open-ai') {
      if (onOpenWhyOpenAI) {
        onOpenWhyOpenAI();
      }
      addLog(
        'phantom',
        `👻 "Why Open AI? Because your proprietary source code belongs on YOUR disk, not in a cloud corporation's training hopper.
Local models like Qwen 2.5/3 run completely offline without per-token charges or external surveillance."`
      );
      return;
    }

    if (lower === 'findings') {
      if (!currentInvestigation || !currentInvestigation.findings || currentInvestigation.findings.length === 0) {
        addLog('system', '🔍 No current investigation or no anomalies found. Run "scan" first.');
        return;
      }
      const list = currentInvestigation.findings
        .map(
          (f, idx) =>
            `#${idx + 1} [${f.severity}] ${f.title} (${f.file_path}${f.line_number ? `:${f.line_number}` : ''})`
        )
        .join('\n');
      addLog('system', `🚨 CURRENT DETECTED ANOMALIES (${currentInvestigation.findings.length}):\n${list}`);
      return;
    }

    if (lower === 'model') {
      setLoading(true);
      try {
        const m = await api.getAIModels();
        addLog(
          'system',
          `🧠 LOCAL MODEL MATRIX:
  Active:    ${m.active_model}
  Installed: ${m.installed ? 'YES' : 'NO'}
  Available: ${m.models.join(', ') || 'No local models returned'}`
        );
      } catch (e: any) {
        addLog('system', `❌ Error fetching models: ${e.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (lower === 'history') {
      setLoading(true);
      try {
        const invs = await api.getInvestigations(5);
        if (invs.length === 0) {
          addLog('system', '📜 Archives are empty.');
        } else {
          const summary = invs
            .map(
              (i) =>
                `• [${i.id}] ${i.project_name} (${i.total_files} files, ${i.critical_count} critical) - ${new Date(i.created_at).toLocaleDateString()}`
            )
            .join('\n');
          addLog('system', `📜 RECENT ARCHIVED INVESTIGATIONS:\n${summary}`);
        }
      } catch (e: any) {
        addLog('system', `❌ Error querying history: ${e.message}`);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Natural Language Query to PHANTOM (Ollama)
    setLoading(true);
    try {
      const response = await api.chatWithPhantom(
        trimmed,
        currentInvestigation?.id,
        logs.filter((l) => l.type === 'user' || l.type === 'phantom').map((l) => ({
          role: l.type === 'user' ? 'user' : 'assistant',
          content: l.text
        }))
      );
      addLog('phantom', response.reply);
    } catch (e: any) {
      addLog('system', `👻 *Spectral interference:* ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleExecuteCommand(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
        const nextIdx = historyIndex + 1;
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInput(commandHistory[nextIdx]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="glass-panel rounded-3xl border border-phantom-purple/30 bg-[#070414]/95 shadow-2xl flex flex-col h-[750px] overflow-hidden">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-black/60 border-b border-phantom-purple/20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-phantom-crimson/80 border border-phantom-crimson" />
          <span className="w-3 h-3 rounded-full bg-phantom-amber/80 border border-phantom-amber" />
          <span className="w-3 h-3 rounded-full bg-phantom-green/80 border border-phantom-green" />
          <span className="ml-3 font-mono text-xs font-semibold text-phantom-lavender/90 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-phantom-green" />
            <span>phantom@haunted-terminal:~</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExecuteCommand('help')}
            className="flex items-center gap-1 text-[11px] font-mono text-phantom-muted hover:text-phantom-cyan transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Help</span>
          </button>
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 text-[11px] font-mono text-phantom-muted hover:text-phantom-crimson transition-colors"
            title="Clear scrollback"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-mono text-xs md:text-sm selection:bg-phantom-purple selection:text-white">
        {logs.map((log) => {
          if (log.type === 'user') {
            return (
              <div key={log.id} className="flex items-start gap-2 text-phantom-cyan">
                <span className="text-phantom-green select-none">phantom@terminal:~$</span>
                <span className="font-semibold">{log.text}</span>
              </div>
            );
          }

          if (log.type === 'phantom') {
            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-gradient-to-r from-phantom-violet/50 to-[#12072B]/60 border border-phantom-purple/30 text-phantom-lavender space-y-1"
              >
                <div className="flex items-center gap-2 text-phantom-green text-xs font-bold mb-1">
                  <GhostLogo size="sm" animated={false} />
                  <span>PHANTOM</span>
                  <span className="text-[10px] text-phantom-muted font-normal ml-auto">
                    {log.timestamp}
                  </span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-xs sm:text-sm font-sans">
                  {log.text}
                </div>
              </div>
            );
          }

          // System output
          return (
            <div key={log.id} className="text-phantom-muted whitespace-pre-wrap leading-relaxed">
              {log.text}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-phantom-green animate-pulse">
            <GhostLogo size="sm" animated />
            <span>PHANTOM is communing with the machine...</span>
          </div>
        )}

        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Input Bar */}
      <div className="p-3 bg-black/70 border-t border-phantom-purple/20 flex items-center gap-2">
        <span className="text-phantom-green font-mono text-sm pl-2 select-none">❯</span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          placeholder="Ask PHANTOM or enter command (help, status, scan, findings)..."
          className="flex-1 bg-transparent border-none text-white font-mono text-xs sm:text-sm focus:outline-none placeholder-phantom-muted"
        />
        <button
          onClick={() => handleExecuteCommand(input)}
          disabled={loading || !input.trim()}
          className="p-2 rounded-xl bg-phantom-purple/20 hover:bg-phantom-purple/40 text-phantom-green disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <CornerDownLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
