import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Shield,
  Sliders,
  Keyboard,
  CheckCircle2,
  HardDrive,
  Bell,
  Eye,
  RotateCcw,
} from 'lucide-react';
import { useSanitizer } from '../context/SanitizerContext';
import { useTheme } from '../context/ThemeContext';
import { RedactionMode } from '../types';

interface SettingsPageProps {
  onNavigateToSanitizer: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onNavigateToSanitizer: _onNavigateToSanitizer }) => {
  const { setTheme, isDark } = useTheme();
  const { redactionMode, setRedactionMode, resetWorkspace } = useSanitizer();

  const [notificationState, setNotificationState] = useState(true);
  const [autoScrollState, setAutoScrollState] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleReset = () => {
    resetWorkspace();
    setToastMessage('Workspace and pseudonym buffers purged.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const shortcuts = [
    { key: 'Ctrl + V / Cmd + V', action: 'Paste raw text stream into active workspace' },
    { key: 'Ctrl + E / Cmd + E', action: 'Trigger immediate local sanitized file export' },
    { key: 'Esc', action: 'Close modal dialog or mobile drawer' },
    { key: 'Tab / Shift + Tab', action: 'Cycle focus across interactive controls' },
  ];

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primaryPurple/10 border border-primaryPurple/20 flex items-center justify-center text-primaryPurple shrink-0">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Settings & Workspace Preferences
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Tailor browser execution limits, theme aesthetics, and default sanitization behavior.
            </p>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-3 rounded-2xl bg-successGreen/10 border border-successGreen/25 text-successGreen text-xs flex items-center gap-2 animate-fade-in shadow-subtle">
          <CheckCircle2 className="w-4 h-4 text-successGreen min-w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SECTION 1: Appearance */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accentCyan" />
          Appearance & Themes
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              isDark
                ? 'bg-primaryPurple/10 border-primaryPurple shadow-card ring-1 ring-primaryPurple/30'
                : 'bg-cardElevated border-borderTheme hover:border-primaryPurple/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-card border border-borderTheme text-primaryPurple shadow-subtle">
                <Sun className="w-4 h-4 text-warningOrange" />
              </div>
              <div>
                <span className="text-xs font-semibold text-textPrimary block">Dark Theme</span>
                <span className="text-[10px] text-textSecondary">Deep cybersecurity analytics (#101010)</span>
              </div>
            </div>
            {isDark && <span className="w-2.5 h-2.5 rounded-full bg-accentCyan animate-pulse" />}
          </button>

          <button
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
              !isDark
                ? 'bg-primaryPurple/10 border-primaryPurple shadow-card ring-1 ring-primaryPurple/30'
                : 'bg-cardElevated border-borderTheme hover:border-primaryPurple/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-card border border-borderTheme text-primaryPurple shadow-subtle">
                <Moon className="w-4 h-4 text-primaryPurple" />
              </div>
              <div>
                <span className="text-xs font-semibold text-textPrimary block">Light Theme</span>
                <span className="text-[10px] text-textSecondary">Clean enterprise security surface (#F5F5F9)</span>
              </div>
            </div>
            {!isDark && <span className="w-2.5 h-2.5 rounded-full bg-primaryPurple animate-pulse" />}
          </button>
        </div>
      </div>

      {/* SECTION 2: Default Redaction Strategy */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <Shield className="w-4 h-4 text-primaryPurple" />
          Default Redaction Strategy
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'full' as RedactionMode, title: 'Full Masking', desc: 'Replaces sensitive tokens with [REDACTED]' },
            { id: 'partial' as RedactionMode, title: 'Partial Masking', desc: 'Preserves leading/trailing non-identifying characters' },
            { id: 'pseudonym' as RedactionMode, title: 'Consistent Pseudonymization', desc: 'Deterministic in-memory entity substitution' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setRedactionMode(opt.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                redactionMode === opt.id
                  ? 'bg-primaryPurple/10 border-primaryPurple shadow-card ring-1 ring-primaryPurple/30'
                  : 'bg-cardElevated border-borderTheme hover:border-primaryPurple/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-textPrimary">{opt.title}</span>
                {redactionMode === opt.id && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-primaryPurple" />
                )}
              </div>
              <p className="text-[10px] text-textSecondary leading-relaxed">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* SECTION 3: Workspace Preferences */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <Sliders className="w-4 h-4 text-accentCyan" />
          Workspace & Editor Preferences
        </h2>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between p-3 rounded-xl bg-cardElevated border border-borderTheme">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-textSecondary" />
              <div>
                <span className="text-xs font-medium text-textPrimary block">Session Action Notifications</span>
                <span className="text-[10px] text-textSecondary">Display confirmation toast upon downloads or purges</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notificationState}
              aria-label="Toggle session action notifications"
              onClick={() => setNotificationState(!notificationState)}
              className={`w-10 h-5 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primaryPurple ${
                notificationState ? 'bg-primaryPurple' : 'bg-borderTheme'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                  notificationState ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-cardElevated border border-borderTheme">
            <div className="flex items-center gap-2.5">
              <Eye className="w-4 h-4 text-textSecondary" />
              <div>
                <span className="text-xs font-medium text-textPrimary block">Synchronized Diff Scroll</span>
                <span className="text-[10px] text-textSecondary">Keep original stream and sanitized output panes in view sync</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={autoScrollState}
              aria-label="Toggle synchronized diff scrolling"
              onClick={() => setAutoScrollState(!autoScrollState)}
              className={`w-10 h-5 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-primaryPurple ${
                autoScrollState ? 'bg-primaryPurple' : 'bg-borderTheme'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-0.75 ${
                  autoScrollState ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 4: Privacy and Memory */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-dangerRed" />
          Privacy, Storage & Volatile Memory
        </h2>

        <p className="text-xs text-textSecondary leading-relaxed">
          PrivacyGuard AI maintains zero persistence for document contents. All regular expression tokens and pseudonym maps reside strictly within volatile V8 memory.
        </p>

        <div className="flex items-center justify-between pt-2 border-t border-borderTheme">
          <div>
            <span className="text-xs font-medium text-textPrimary block">Immediate State Purge</span>
            <span className="text-[10px] text-textSecondary">Zero out cached document state and mapping tables</span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed border border-dangerRed/25 transition-all shadow-subtle active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Purge Workspace</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <Keyboard className="w-4 h-4 text-primaryPurple" />
          Keyboard Shortcuts
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2.5 rounded-xl bg-cardElevated border border-borderTheme"
            >
              <span className="text-textSecondary">{sc.action}</span>
              <kbd className="px-2 py-0.5 rounded-md bg-card border border-borderTheme font-mono text-[10px] font-semibold text-textPrimary shadow-subtle">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
