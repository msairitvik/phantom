import React, { useState, useEffect } from 'react';
import {
  Folder,
  ShieldAlert,
  Flame,
  Clock,
  Radar,
  Terminal as TerminalIcon,
  Cpu,
  History,
  FileText
} from 'lucide-react';
import { AppShell } from './components/layout/AppShell';
import { NavTab } from './components/layout/Sidebar';
import { HeroSection } from './components/dashboard/HeroSection';
import { AIConnectionCard } from './components/dashboard/AIConnectionCard';
import { ActivityTimeline } from './components/dashboard/ActivityTimeline';
import { RecentScans } from './components/dashboard/RecentScans';
import { StatCard } from './components/ui/StatCard';
import { GlassCard } from './components/ui/GlassCard';
import { InvestigationView } from './components/scanner/InvestigationView';
import { ExplorerView } from './components/explorer/ExplorerView';
import { GlobalFindingsView } from './components/findings/GlobalFindingsView';
import { HistoryView } from './components/history/HistoryView';
import { TerminalConsole } from './components/terminal/TerminalConsole';
import { SettingsView } from './components/settings/SettingsView';
import { WhyOpenAIModal } from './components/open_ai/WhyOpenAIModal';
import { ReportModal } from './components/reports/ReportModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { SystemStatus, Investigation } from './types';
import { api } from './services/api';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [currentInvestigation, setCurrentInvestigation] = useState<Investigation | null>(null);
  const [currentWorkspace, setCurrentWorkspace] = useState<string>('./sample_project');
  const [isScanning, setIsScanning] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const [whyOpenAIOpen, setWhyOpenAIOpen] = useState(false);
  const [terminalInitialQuery, setTerminalInitialQuery] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
      if (status.workspace_root) {
        // Default target to sample_project for immediate safe testing
        setCurrentWorkspace('./sample_project');
      }

      const invs = await api.getInvestigations();
      setInvestigations(invs);
      if (invs.length > 0) {
        // Load details for latest investigation
        const latest = await api.getInvestigation(invs[0].id);
        setCurrentInvestigation(latest);
      }
    } catch (e: any) {
      console.warn('Backend connection initializing...', e);
    }
  };

  const handleRefreshStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
      const invs = await api.getInvestigations();
      setInvestigations(invs);
      showToast('info', 'System status refreshed');
    } catch (e: any) {
      showToast('error', 'Status refresh error', e.message);
    }
  };

  const handleSelectInvestigation = async (inv: Investigation) => {
    try {
      const full = await api.getInvestigation(inv.id);
      setCurrentInvestigation(full);
      setCurrentTab('scan');
    } catch (e: any) {
      showToast('error', 'Could not open investigation', e.message);
    }
  };

  const handleOpenTerminalWithQuery = (query: string) => {
    setTerminalInitialQuery(query);
    setCurrentTab('terminal');
  };

  // Calculate statistics from actual application data
  const totalScans = systemStatus?.total_investigations ?? investigations.length;
  const totalFindings = systemStatus?.total_findings ?? 0;
  const criticalFindings = investigations.reduce((acc, i) => acc + (i.critical_count || 0), 0);
  const lastScanDate =
    investigations.length > 0
      ? new Date(investigations[0].created_at).toLocaleDateString()
      : 'None';

  return (
    <AppShell
      currentTab={currentTab}
      onSelectTab={(tab) => {
        if (tab === 'open-ai') {
          setWhyOpenAIOpen(true);
        } else {
          setCurrentTab(tab);
        }
      }}
      systemStatus={systemStatus}
      currentWorkspace={currentWorkspace}
      onQuickScan={() => setCurrentTab('scan')}
      onRefreshStatus={handleRefreshStatus}
      isScanning={isScanning}
    >
      {/* Tab: Mission Overview */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          <HeroSection
            currentWorkspace={currentWorkspace}
            onBeginScan={() => setCurrentTab('scan')}
            onOpenTerminal={() => setCurrentTab('terminal')}
            onUseSampleProject={() => {
              setCurrentWorkspace('./sample_project');
              setCurrentTab('scan');
              showToast('info', 'Loaded ./sample_project', 'Ready to scan synthetic test vulnerabilities.');
            }}
          />

          {/* Metric Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Investigations"
              value={totalScans}
              subtitle="Recorded in local SQLite memory"
              icon={<Radar className="w-5 h-5 text-phantom-cyan" />}
              color="cyan"
            />
            <StatCard
              title="Anomalies Discovered"
              value={totalFindings}
              subtitle="Deterministic code & secret checks"
              icon={<ShieldAlert className="w-5 h-5 text-phantom-purple" />}
              color="purple"
            />
            <StatCard
              title="Critical Hazards"
              value={criticalFindings}
              subtitle="Potential leaked API keys"
              icon={<Flame className="w-5 h-5 text-phantom-crimson" />}
              color="crimson"
            />
            <StatCard
              title="Last Surveillance"
              value={lastScanDate}
              subtitle="Most recent codebase inspection"
              icon={<Clock className="w-5 h-5 text-phantom-green" />}
              color="green"
            />
          </div>

          {/* Main Overview Grid: Left Column 8 / Right Column 4 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 cols: Recent investigations & Activity timeline */}
            <div className="lg:col-span-8 space-y-6">
              <GlassCard>
                <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
                  <h3 className="font-bold text-white text-base">Recent Investigations</h3>
                  <button
                    onClick={() => setCurrentTab('history')}
                    className="text-xs font-mono text-phantom-cyan hover:text-white transition-colors"
                  >
                    View All Archives →
                  </button>
                </div>
                <RecentScans
                  investigations={investigations}
                  onSelect={handleSelectInvestigation}
                  onDelete={async (id, e) => {
                    e.stopPropagation();
                    await api.deleteInvestigation(id);
                    handleRefreshStatus();
                  }}
                />
              </GlassCard>

              <GlassCard>
                <div className="flex items-center justify-between pb-3 border-b border-phantom-purple/20 mb-4">
                  <h3 className="font-bold text-white text-base">Activity Timeline</h3>
                  <span className="text-xs font-mono text-phantom-muted">Real-time History</span>
                </div>
                <ActivityTimeline
                  investigations={investigations}
                  onSelectInvestigation={handleSelectInvestigation}
                />
              </GlassCard>
            </div>

            {/* Right 4 cols: Local AI Connection card & Quick actions */}
            <div className="lg:col-span-4 space-y-6">
              <AIConnectionCard
                systemStatus={systemStatus}
                onRefresh={handleRefreshStatus}
              />

              <GlassCard>
                <h4 className="font-bold text-white text-sm pb-3 border-b border-phantom-purple/20 mb-3">
                  Quick Actions
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setCurrentTab('scan')}
                    className="w-full text-left p-3 rounded-xl bg-black/40 hover:bg-phantom-purple/20 border border-phantom-purple/20 text-xs font-mono text-phantom-lavender flex items-center justify-between transition-colors group"
                  >
                    <span className="group-hover:text-phantom-green transition-colors">
                      ▶ Investigate sample_project
                    </span>
                    <span className="text-phantom-muted text-[10px]">Fast</span>
                  </button>

                  <button
                    onClick={() => handleOpenTerminalWithQuery('Explain the security checks performed by PHANTOM.')}
                    className="w-full text-left p-3 rounded-xl bg-black/40 hover:bg-phantom-purple/20 border border-phantom-purple/20 text-xs font-mono text-phantom-lavender flex items-center justify-between transition-colors group"
                  >
                    <span className="group-hover:text-phantom-cyan transition-colors">
                      💬 Interrogate Entity in Terminal
                    </span>
                    <span className="text-phantom-muted text-[10px]">AI</span>
                  </button>

                  <button
                    onClick={() => setWhyOpenAIOpen(true)}
                    className="w-full text-left p-3 rounded-xl bg-black/40 hover:bg-phantom-purple/20 border border-phantom-purple/20 text-xs font-mono text-phantom-lavender flex items-center justify-between transition-colors group"
                  >
                    <span className="group-hover:text-phantom-purple transition-colors">
                      🌐 Learn Why Open AI Matters
                    </span>
                    <span className="text-phantom-muted text-[10px]">Challenge</span>
                  </button>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      )}

      {/* Tab: New Investigation / Scan */}
      {currentTab === 'scan' && (
        <InvestigationView
          currentWorkspace={currentWorkspace}
          onChangeWorkspace={setCurrentWorkspace}
          investigation={currentInvestigation}
          onScanComplete={(inv) => {
            setCurrentInvestigation(inv);
            handleRefreshStatus();
          }}
          onOpenTerminalWithQuery={handleOpenTerminalWithQuery}
          onExportReport={(id) => setActiveReportId(id)}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
        />
      )}

      {/* Tab: Project Explorer */}
      {currentTab === 'explorer' && (
        <ExplorerView
          currentInvestigation={currentInvestigation}
          onNavigateToScan={() => setCurrentTab('scan')}
          onSelectFinding={() => setCurrentTab('scan')}
        />
      )}

      {/* Tab: Findings */}
      {currentTab === 'findings' && (
        <GlobalFindingsView
          currentInvestigation={currentInvestigation}
          onNavigateToScan={() => setCurrentTab('scan')}
          onAskPhantom={(f) =>
            handleOpenTerminalWithQuery(
              `Explain how to remediate "${f.title}" in file "${f.file_path}".`
            )
          }
        />
      )}

      {/* Tab: Investigation History */}
      {currentTab === 'history' && (
        <HistoryView
          investigations={investigations}
          onSelectInvestigation={handleSelectInvestigation}
          onRefresh={handleRefreshStatus}
          onExportReport={(id) => setActiveReportId(id)}
        />
      )}

      {/* Tab: AI Console / Terminal */}
      {currentTab === 'terminal' && (
        <TerminalConsole
          currentInvestigation={currentInvestigation}
          onRunScan={() => {
            setCurrentTab('scan');
          }}
          onOpenWhyOpenAI={() => setWhyOpenAIOpen(true)}
          initialQuery={terminalInitialQuery}
        />
      )}

      {/* Tab: Settings */}
      {currentTab === 'settings' && (
        <SettingsView
          systemStatus={systemStatus}
          onRefreshStatus={handleRefreshStatus}
        />
      )}

      {/* Modals */}
      <ReportModal
        investigationId={activeReportId}
        onClose={() => setActiveReportId(null)}
      />

      <WhyOpenAIModal
        isOpen={whyOpenAIOpen}
        onClose={() => setWhyOpenAIOpen(false)}
      />
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
