import React from 'react';
import { Menu, Play, RefreshCw, Monitor, Sparkles, Folder } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { NeonButton } from '../ui/NeonButton';
import { SystemStatus } from '../../types';

interface TopbarProps {
  pageTitle: string;
  systemStatus: SystemStatus | null;
  currentWorkspace: string;
  onOpenMobileMenu: () => void;
  onQuickScan: () => void;
  showScanlines: boolean;
  onToggleScanlines: () => void;
  onRefreshStatus: () => void;
  isScanning?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  pageTitle,
  systemStatus,
  currentWorkspace,
  onOpenMobileMenu,
  onQuickScan,
  showScanlines,
  onToggleScanlines,
  onRefreshStatus,
  isScanning = false
}) => {
  const isOnline = systemStatus?.ollama_reachable ?? false;
  const activeModel = systemStatus?.active_model || 'qwen3:4b';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-phantom-purple/20 bg-[#070511]/85 backdrop-blur-md">
      {/* Left: Mobile trigger & Page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-phantom-muted hover:text-white hover:bg-phantom-purple/20 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base md:text-lg font-bold font-display tracking-wide text-white flex items-center gap-2">
            <span>{pageTitle}</span>
          </h1>
        </div>
      </div>

      {/* Right: Status badges & Quick actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Workspace directory chip */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-lg bg-phantom-violet/50 border border-phantom-purple/20 text-xs font-mono text-phantom-muted max-w-xs truncate">
          <Folder className="w-3.5 h-3.5 text-phantom-cyan shrink-0" />
          <span className="truncate">{currentWorkspace}</span>
        </div>

        {/* AI Status Badge */}
        <div className="flex items-center gap-2">
          <StatusBadge
            status={isOnline ? 'online' : 'offline'}
            label={isOnline ? `${activeModel}` : 'AI OFFLINE'}
          />
          <button
            onClick={onRefreshStatus}
            className="p-1.5 rounded-lg text-phantom-muted hover:text-phantom-green hover:bg-phantom-purple/20 transition-all"
            title="Refresh System Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scanlines visual toggle */}
        <button
          onClick={onToggleScanlines}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border transition-all ${
            showScanlines
              ? 'bg-phantom-green/10 border-phantom-green/40 text-phantom-green'
              : 'bg-phantom-violet/30 border-phantom-purple/20 text-phantom-muted hover:text-white'
          }`}
          title="Toggle CRT Scanline Effect"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>CRT</span>
        </button>

        {/* Quick Scan Action */}
        <NeonButton
          variant="primary"
          size="sm"
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
          onClick={onQuickScan}
          loading={isScanning}
        >
          <span className="hidden sm:inline">Investigate</span>
        </NeonButton>
      </div>
    </header>
  );
};
