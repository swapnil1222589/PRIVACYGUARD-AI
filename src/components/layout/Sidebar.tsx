import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  FileLock2,
  BarChart3,
  ShieldAlert,
  Terminal,
  Settings,
  Info,
  ChevronLeft,
  ChevronRight,
  Lock,
  X,
  Layers,
  Bell,
} from 'lucide-react';
import { useSanitizer } from '../../context/SanitizerContext';
import { useTheme } from '../../context/ThemeContext';

export type NavigationPage =
  | 'dashboard'
  | 'sanitizer'
  | 'findings'
  | 'alerts'
  | 'analytics'
  | 'audit'
  | 'prompts'
  | 'settings'
  | 'about';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { document, analytics } = useSanitizer();
  const { isDark } = useTheme();

  const navItems = [
    { id: 'dashboard' as NavigationPage, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'sanitizer' as NavigationPage,
      label: 'Data Sanitizer',
      icon: FileLock2,
      badge: document ? `${analytics.totalDetected}` : undefined,
    },
    { id: 'findings' as NavigationPage, label: 'Findings', icon: Layers },
    { id: 'alerts' as NavigationPage, label: 'Alerts', icon: Bell },
    { id: 'analytics' as NavigationPage, label: 'Analytics', icon: BarChart3 },
    { id: 'audit' as NavigationPage, label: 'Privacy Audit', icon: ShieldAlert },
    { id: 'prompts' as NavigationPage, label: 'Prompt Log', icon: Terminal },
    { id: 'settings' as NavigationPage, label: 'Settings', icon: Settings },
    { id: 'about' as NavigationPage, label: 'About', icon: Info },
  ];

  const handleNavClick = (id: NavigationPage, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Identical width (w-16 rail or mobile drawer) across BOTH themes */}
      <aside
        className={`fixed top-0 left-0 h-screen z-50 flex flex-col transition-all duration-150 select-none ${
          mobileOpen ? 'translate-x-0 w-60 shadow-elevated' : '-translate-x-full lg:translate-x-0 lg:w-16'
        } ${
          isDark
            ? 'bg-[#151515] border-r border-[#2A2A2A] text-[#A1A1AA]'
            : 'bg-[#342171] border-r border-[#2B1B5F] text-[#D1CBE8]'
        }`}
      >
        {/* Brand Header */}
        <div
          className={`h-14 flex items-center justify-between px-3 border-b ${
            isDark ? 'border-[#2A2A2A]' : 'border-white/10'
          }`}
        >
          <div
            onClick={(e) => handleNavClick('dashboard', e)}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden mx-auto lg:mx-0"
            title="Overview Dashboard"
          >
            <div className="h-8 w-8 min-w-8 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#111111]' : 'bg-[#251752]'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
              </div>
            </div>
            {mobileOpen && (
              <div className="flex flex-col">
                <span className="font-bold text-xs tracking-wider text-white flex items-center gap-1">
                  PRIVACYGUARD
                  <span className="text-[9px] bg-white/20 text-white px-1 py-0.2 rounded font-semibold">
                    AI
                  </span>
                </span>
                <span className="text-[10px] text-purple-200/80 font-mono tracking-tight">
                  Security Ops
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 rounded-md text-textSecondary hover:text-textPrimary transition-colors"
            aria-label="Close mobile menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Rail / List */}
        <div className="flex-1 py-3 px-2 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                type="button"
                key={item.id}
                onClick={(e) => handleNavClick(item.id, e)}
                title={item.label}
                className={`w-full flex items-center ${
                  !mobileOpen ? 'justify-center p-2.5 rounded-xl' : 'gap-2.5 px-3 py-2 rounded-xl'
                } text-xs font-medium transition-all group relative ${
                  isActive
                    ? isDark
                      ? 'bg-[#9333EA] text-white shadow-lg glow-purple font-semibold'
                      : 'bg-[#7040C9] text-white shadow-md font-semibold'
                    : isDark
                    ? 'text-[#A1A1AA] hover:text-white hover:bg-[#202020]'
                    : 'text-[#D1CBE8] hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon
                  className={`w-4 h-4 min-w-4 transition-colors ${
                    isActive ? 'text-white' : ''
                  }`}
                />
                {mobileOpen && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {mobileOpen && item.badge && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-white/25 text-white">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with Live Privacy Status */}
        <div
          className={`p-2.5 border-t ${
            isDark ? 'border-[#2A2A2A] bg-[#151515]' : 'border-white/10 bg-[#2B1B5F]'
          }`}
        >
          {mobileOpen ? (
            <div className="rounded-xl p-2 bg-black/20 border border-white/10 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  100% Local Engine
                </span>
                <Lock className="w-3 h-3 text-purple-200/70" />
              </div>
              <p className="text-[9px] text-purple-200/60 leading-tight">
                Zero network egress. Isolated heap.
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-1" title="100% Local Engine Active">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
