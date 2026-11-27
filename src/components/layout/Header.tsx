import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCcw,
  Sun,
  Moon,
  FileText,
  AlertTriangle,
  HardDriveDownload,
  Shield,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  FileCode,
  FileSpreadsheet,
  Menu,
} from 'lucide-react';
import { useSanitizer } from '../../context/SanitizerContext';
import { useTheme } from '../../context/ThemeContext';
import { NavigationPage } from './Sidebar';

interface HeaderProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onOpenMobile }) => {
  const { document, resetWorkspace, exportSanitized, exportPdf, analytics } = useSanitizer();
  const { toggleTheme, isDark } = useTheme();

  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setShowExportMenu(false);
      }
    };
    window.document.addEventListener('mousedown', handleClickOutside);
    return () => window.document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportRaw = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = exportSanitized();
    if (res) {
      setToastMessage(`Downloaded sanitized file: ${res.filename}`);
      setShowExportMenu(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExportPdfFull = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = exportPdf(false);
    if (res) {
      setToastMessage(`Downloaded PDF report: ${res.filename}`);
      setShowExportMenu(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleExportPdfSummary = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const res = exportPdf(true);
    if (res) {
      setToastMessage(`Downloaded Audit Summary PDF: ${res.filename}`);
      setShowExportMenu(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleConfirmReset = () => {
    resetWorkspace();
    setShowConfirmReset(false);
    setToastMessage('Workspace data, cache, and pseudonym mappings wiped.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleThemeToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTheme();
  };

  return (
    <>
      <header
        className={`h-14 px-4 sm:px-6 sticky top-0 z-30 flex items-center justify-between select-none transition-colors duration-150 border-b ${
          isDark
            ? 'bg-[#111111] border-[#2A2A2A] text-[#F5F5F5]'
            : 'bg-[#FFFFFF] border-[#E7E5EF] text-[#25233A] shadow-sm'
        }`}
      >
        {/* Left: Breadcrumb / Workspace Identification */}
        <div className="flex items-center gap-2 sm:gap-2.5 text-xs">
          {/* Mobile Drawer Trigger Button */}
          <button
            type="button"
            onClick={onOpenMobile}
            aria-label="Open navigation menu"
            className={`lg:hidden p-1.5 rounded-xl border transition-colors ${
              isDark
                ? 'border-[#2A2A2A] text-gray-400 hover:text-white hover:bg-[#1A1A1A]'
                : 'border-[#E7E5EF] text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-1.5 focus:outline-none group text-left"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-md">
              <div
                className={`w-full h-full rounded-full flex items-center justify-center ${
                  isDark ? 'bg-[#111111]' : 'bg-[#FFFFFF]'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-purple-500" />
              </div>
            </div>
            <span
              className={`font-bold tracking-wider hidden sm:inline ${
                isDark ? 'text-white' : 'text-[#25233A]'
              }`}
            >
              PRIVACYGUARD
            </span>
          </button>

          <ChevronRight
            className={`w-3.5 h-3.5 ${isDark ? 'text-gray-600' : 'text-gray-300'}`}
          />

          <span
            className={`font-semibold capitalize truncate max-w-[140px] sm:max-w-none ${
              isDark ? 'text-purple-400' : 'text-[#7040C9]'
            }`}
          >
            {currentPage === 'sanitizer'
              ? 'Data Sanitizer'
              : currentPage === 'dashboard'
              ? 'Overview Dashboard'
              : currentPage}
          </span>

          {document && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${
                isDark
                  ? 'bg-[#191919] border-[#2A2A2A] text-gray-300'
                  : 'bg-[#FAF9FF] border-[#E7E5EF] text-gray-600'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="truncate max-w-[120px]">{document.metadata.filename}</span>
            </div>
          )}
        </div>

        {/* Center: Top Pill Navigation (Dashboard, Sanitizer, Findings, Alerts) */}
        <div
          className={`hidden md:flex items-center rounded-full p-1 border shadow-inner ${
            isDark ? 'bg-[#181818] border-[#2A2A2A]' : 'bg-[#FAF9FF] border-[#E7E5EF]'
          }`}
        >
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              currentPage === 'dashboard'
                ? isDark
                  ? 'bg-[#9333EA] text-white shadow-md shadow-purple-900/50'
                  : 'bg-[#7040C9] text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => onNavigate('sanitizer')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
              currentPage === 'sanitizer'
                ? isDark
                  ? 'bg-[#9333EA] text-white shadow-md shadow-purple-900/50'
                  : 'bg-[#7040C9] text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Sanitizer</span>
            {analytics.totalDetected > 0 && (
              <span className="text-[10px] bg-white/20 text-white rounded-full px-1.5 py-0.2">
                {analytics.totalDetected}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => onNavigate('findings')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              currentPage === 'findings'
                ? isDark
                  ? 'bg-[#9333EA] text-white shadow-md shadow-purple-900/50'
                  : 'bg-[#7040C9] text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Findings
          </button>
          <button
            type="button"
            onClick={() => onNavigate('alerts')}
            className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all ${
              currentPage === 'alerts'
                ? isDark
                  ? 'bg-[#9333EA] text-white shadow-md shadow-purple-900/50'
                  : 'bg-[#7040C9] text-white shadow-md'
                : isDark
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Alerts
          </button>
        </div>

        {/* Right: Actions, Local badge, Export dropdown, Theme toggle, Reset, User */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* 100% Local badge */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium font-mono ${
              isDark
                ? 'bg-[#181818] border-emerald-900/40 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>100% Local Engine</span>
          </div>

          {/* Quick Platform / Sanitizer Shortcut */}
          <button
            type="button"
            onClick={() => onNavigate('sanitizer')}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              isDark
                ? 'bg-[#9333EA] hover:bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-[#7040C9] hover:bg-[#5E34AB] text-white shadow-sm'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Platform View</span>
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={exportMenuRef}>
            {document ? (
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-[#191919] hover:bg-[#252525] border-[#2A2A2A] text-white'
                    : 'bg-[#FAF9FF] hover:bg-purple-50 border-[#E7E5EF] text-[#7040C9]'
                }`}
                title="Export Sanitized Documents"
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onNavigate('sanitizer')}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                  isDark
                    ? 'border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                    : 'border-[#E7E5EF] text-gray-400 hover:text-gray-700'
                }`}
              >
                <HardDriveDownload className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            )}

            {showExportMenu && document && (
              <div
                className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl p-1.5 z-50 text-xs animate-slide-up space-y-1 border ${
                  isDark
                    ? 'bg-[#191919] border-[#2A2A2A] text-gray-200'
                    : 'bg-[#FFFFFF] border-[#E7E5EF] text-gray-800'
                }`}
              >
                <button
                  type="button"
                  onClick={handleExportPdfFull}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-colors ${
                    isDark
                      ? 'hover:bg-[#252525] text-gray-200 hover:text-white'
                      : 'hover:bg-purple-50 text-gray-800'
                  }`}
                >
                  <FileText className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <span className="font-semibold block text-[11px]">
                      Export Sanitized PDF
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Full report + sanitized stream
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportPdfSummary}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-colors ${
                    isDark
                      ? 'hover:bg-[#252525] text-gray-200 hover:text-white'
                      : 'hover:bg-purple-50 text-gray-800'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-semibold block text-[11px]">
                      Audit Summary PDF
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Executive metrics certificate
                    </span>
                  </div>
                </button>

                <div
                  className={`h-px my-1 ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-100'}`}
                />

                <button
                  type="button"
                  onClick={handleExportRaw}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-left rounded-xl transition-colors ${
                    isDark
                      ? 'hover:bg-[#252525] text-gray-200 hover:text-white'
                      : 'hover:bg-purple-50 text-gray-800'
                  }`}
                >
                  {document.isCsv ? (
                    <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : (
                    <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold block text-[11px]">
                      Export Sanitized {document.metadata.fileType.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Preserved original structure
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Reset workspace memory */}
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            aria-label="Reset Workspace"
            className={`p-2 rounded-xl transition-colors border ${
              isDark
                ? 'border-[#2A2A2A] text-gray-400 hover:text-rose-400 hover:bg-[#1A1A1A]'
                : 'border-[#E7E5EF] text-gray-500 hover:text-rose-600 hover:bg-gray-50'
            }`}
            title="Purge Workspace Memory"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* THEME TOGGLE (Completely Isolated Click Handler, Never Navigates) */}
          <button
            type="button"
            onClick={handleThemeToggleClick}
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-2 rounded-xl transition-all border ${
              isDark
                ? 'border-[#2A2A2A] text-amber-400 hover:bg-[#1A1A1A]'
                : 'border-[#E7E5EF] text-purple-600 hover:bg-purple-50'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </header>

      {/* Confirmation Modal */}
      {showConfirmReset &&
        renderResetModal(handleConfirmReset, () => setShowConfirmReset(false), isDark)}
      {toastMessage && renderToast(toastMessage)}
    </>
  );
};

function renderResetModal(onConfirm: () => void, onCancel: () => void, isDark: boolean) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="purge-modal-title"
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
    >
      <div
        className={`border rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 ${
          isDark
            ? 'bg-[#181818] border-gray-800 text-white'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        <div className="flex items-center gap-3 text-rose-500">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 id="purge-modal-title" className="font-semibold text-sm">Purge Workspace Memory?</h3>
            <p className="text-xs text-gray-400">Zero data is retained on servers or storage.</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          This immediately clears loaded documents, detected entities, in-memory pseudonym mappings, and diff buffers.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              isDark
                ? 'text-gray-300 hover:bg-gray-800'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-all active:scale-95"
          >
            Flush Workspace
          </button>
        </div>
      </div>
    </div>
  );
}

function renderToast(message: string) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 text-white shadow-xl text-xs font-medium animate-slide-up"
    >
      <CheckCircle2 className="w-4 h-4 text-white" />
      <span>{message}</span>
    </div>
  );
}
