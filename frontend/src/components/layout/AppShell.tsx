import React, { useState } from 'react';
import { Sidebar, NavTab } from './Sidebar';
import { Topbar } from './Topbar';
import { AnimatedBackground } from '../ui/AnimatedBackground';
import { SystemStatus } from '../../types';

interface AppShellProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  systemStatus: SystemStatus | null;
  currentWorkspace: string;
  onQuickScan: () => void;
  onRefreshStatus: () => void;
  isScanning?: boolean;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  currentWorkspace,
  onQuickScan,
  onRefreshStatus,
  isScanning = false,
  children
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScanlines, setShowScanlines] = useState(true);

  const pageTitles: Record<NavTab, string> = {
    overview: 'Mission Overview',
    scan: 'New Investigation',
    explorer: 'Project Explorer',
    findings: 'Discovered Findings',
    history: 'Investigation History',
    terminal: 'Haunted AI Console',
    'open-ai': 'Why Open AI?',
    settings: 'System Settings'
  };

  return (
    <div className="min-h-screen bg-[#070511] text-[#E9E3FF] flex flex-col font-display selection:bg-phantom-purple selection:text-white">
      {/* Visual background atmospheric layers */}
      <AnimatedBackground showScanlines={showScanlines} />

      {/* Sidebar navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={onSelectTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isMobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main layout container adjusted for sidebar width */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Topbar
          pageTitle={pageTitles[currentTab]}
          systemStatus={systemStatus}
          currentWorkspace={currentWorkspace}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onQuickScan={onQuickScan}
          showScanlines={showScanlines}
          onToggleScanlines={() => setShowScanlines(!showScanlines)}
          onRefreshStatus={onRefreshStatus}
          isScanning={isScanning}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
};
