import React from 'react';
import {
  LayoutDashboard,
  Radar,
  FolderTree,
  ShieldAlert,
  History,
  Terminal,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flame
} from 'lucide-react';
import { GhostLogo } from '../ui/GhostLogo';

export type NavTab =
  | 'overview'
  | 'scan'
  | 'explorer'
  | 'findings'
  | 'history'
  | 'terminal'
  | 'open-ai'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) => {
  const navItems = [
    { id: 'overview' as NavTab, label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'scan' as NavTab, label: 'New Investigation', icon: <Radar className="w-5 h-5" />, badge: 'Live' },
    { id: 'explorer' as NavTab, label: 'Project Explorer', icon: <FolderTree className="w-5 h-5" /> },
    { id: 'findings' as NavTab, label: 'Findings', icon: <ShieldAlert className="w-5 h-5" /> },
    { id: 'history' as NavTab, label: 'Investigation History', icon: <History className="w-5 h-5" /> },
    { id: 'terminal' as NavTab, label: 'AI Console', icon: <Terminal className="w-5 h-5" /> },
    { id: 'open-ai' as NavTab, label: 'Why Open AI?', icon: <Cpu className="w-5 h-5" />, highlight: true },
    { id: 'settings' as NavTab, label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col glass-panel border-r border-phantom-purple/20 bg-[#0C071E]/95 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-phantom-purple/20">
          <div
            onClick={() => handleNavClick('overview')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <GhostLogo size="md" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-display font-extrabold text-lg tracking-wider bg-gradient-to-r from-phantom-green via-phantom-cyan to-phantom-purple bg-clip-text text-transparent group-hover:brightness-125 transition-all">
                  PHANTOM
                </span>
                <span className="text-[10px] font-mono tracking-widest text-phantom-muted uppercase">
                  Haunted Terminal
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-phantom-muted hover:text-white hover:bg-phantom-purple/20 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-phantom-purple/25 to-phantom-violet text-white border border-phantom-purple/50 shadow-glow-purple'
                    : 'text-phantom-lavender/70 hover:text-white hover:bg-phantom-purple/10 border border-transparent'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-gradient-to-b from-phantom-green via-phantom-cyan to-phantom-purple" />
                )}

                <span
                  className={`transition-colors shrink-0 ${
                    isActive
                      ? 'text-phantom-green'
                      : item.highlight
                      ? 'text-phantom-cyan group-hover:text-phantom-green'
                      : 'text-phantom-purple group-hover:text-phantom-lavender'
                  }`}
                >
                  {item.icon}
                </span>

                {!collapsed && (
                  <span className="truncate flex-1 text-left tracking-wide">
                    {item.label}
                  </span>
                )}

                {!collapsed && item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-phantom-green/20 text-phantom-green border border-phantom-green/30 rounded-md">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Challenge Footer */}
        {!collapsed ? (
          <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-phantom-violet/80 to-[#12072B] border border-phantom-purple/30">
            <div className="flex items-center gap-2 mb-1.5 text-phantom-amber text-xs font-mono font-bold">
              <Flame className="w-3.5 h-3.5 text-phantom-amber animate-pulse" />
              <span>GHOST IN THE MACHINE</span>
            </div>
            <p className="text-[11px] text-phantom-muted leading-relaxed">
              Open-weight AI coding sentinel built with Ollama & Qwen.
            </p>
          </div>
        ) : (
          <div className="p-3 flex justify-center">
            <span title="Ghost in the Machine Challenge">
              <Flame className="w-5 h-5 text-phantom-amber" />
            </span>
          </div>
        )}
      </aside>
    </>
  );
};
