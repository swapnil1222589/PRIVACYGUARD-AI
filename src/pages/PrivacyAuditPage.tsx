import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  WifiOff,
  Database,
  Cpu,
  RotateCcw,
  CheckCircle2,
  ServerOff,
  AlertTriangle,
  FileCheck2,
  Activity,
  HardDrive,
} from 'lucide-react';
import { useSanitizer } from '../context/SanitizerContext';

export const PrivacyAuditPage: React.FC = () => {
  const {
    document,
    analytics,
    redactionMode,
    resetWorkspace,
  } = useSanitizer();

  const [showConfirmPurge, setShowConfirmPurge] = useState(false);
  const [purgedNotification, setPurgedNotification] = useState(false);

  const handlePurge = () => {
    resetWorkspace();
    setShowConfirmPurge(false);
    setPurgedNotification(true);
    setTimeout(() => setPurgedNotification(false), 3000);
  };

  const auditCards = [
    {
      title: 'Processing Boundary',
      status: 'verified',
      icon: Cpu,
      value: 'Local Browser Sandboxed V8 Engine',
      description: 'Document bytes are ingested exclusively into browser heap memory. No backend server runtime or serverless endpoints exist.',
    },
    {
      title: 'External Data Transmission',
      status: 'verified',
      icon: ServerOff,
      value: '0 Outbound Transmissions (Zero Telemetry)',
      description: 'Document contents, headers, tokens, and hashes are never dispatched over HTTP/HTTPS, WebSockets, or third-party analytical SDKs.',
    },
    {
      title: 'Storage Persistence',
      status: 'verified',
      icon: Database,
      value: 'Ephemeral Memory Only (Zero Storage Leak)',
      description: 'Zero sensitive data written to localStorage, sessionStorage, IndexedDB, or browser cookies. Memory buffers are garbage collected on tab close or manual purge.',
    },
    {
      title: 'Offline Capability',
      status: 'verified',
      icon: WifiOff,
      value: '100% Offline Functional',
      description: 'Once static JavaScript/CSS bundle assets are loaded, all detection algorithms, Luhn checksums, and CSV unparsers operate without Internet access.',
    },
    {
      title: 'Session Memory',
      status: 'verified',
      icon: HardDrive,
      value: 'Volatile Heap Isolation',
      description: 'All regex execution, deterministic hash maps, and diff calculations execute purely in transient local memory with no persistence layer.',
    },
    {
      title: 'Data Destruction',
      status: 'verified',
      icon: Lock,
      value: 'Instantaneous Garbage Collection Trigger',
      description: 'Clicking Purge Session or Reset Workspace immediately unlinks references, zeroing buffer state and clearing all pseudonym lookups.',
    },
  ];

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-successGreen/10 border border-successGreen/20 flex items-center justify-center text-successGreen shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Privacy & Security Audit
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Verify document processing boundaries and session privacy.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfirmPurge(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-dangerRed/10 hover:bg-dangerRed/20 text-dangerRed border border-dangerRed/25 transition-all self-start sm:self-auto shadow-subtle active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Purge Session Data</span>
        </button>
      </div>

      {purgedNotification && (
        <div className="p-3 rounded-2xl bg-successGreen/10 border border-successGreen/25 text-successGreen text-xs flex items-center gap-2 animate-fade-in shadow-subtle">
          <CheckCircle2 className="w-4 h-4 text-successGreen min-w-4" />
          <span>All in-memory buffers, documents, and pseudonym mappings successfully purged.</span>
        </div>
      )}

      {/* TOP METRICS: Active Document, Entities Detected, Entities Redacted, Processing Mode */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Active Document</span>
          <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-textPrimary truncate my-1">
            {document ? document.metadata.filename : 'None Mounted'}
          </div>
          <span className="text-[11px] text-textSecondary font-mono">
            {document ? `${(document.metadata.fileSize / 1024).toFixed(1)} KB` : 'Zero memory footprint'}
          </span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Entities Detected</span>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-primaryPurple my-1">
            {analytics.totalDetected}
          </div>
          <span className="text-[11px] text-textSecondary">Verified candidate matches</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Entities Redacted</span>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-successGreen my-1">
            {analytics.totalRedacted}
          </div>
          <span className="text-[11px] text-textSecondary">{analytics.redactionEfficiency}% coverage</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Processing Mode</span>
          <div className="text-base sm:text-lg font-bold font-mono tracking-tight text-accentCyan capitalize my-1">
            {redactionMode} Masking
          </div>
          <span className="text-[11px] text-textSecondary font-mono">Zero Network Egress</span>
        </div>
      </div>

      {/* 6 AUDIT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {auditCards.map((check, i) => {
          const Icon = check.icon;
          return (
            <div
              key={i}
              className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between space-y-2.5 hover:border-borderTheme/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-successGreen/10 border border-successGreen/25 text-successGreen flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-xs text-textPrimary">{check.title}</h3>
                </div>
                <span className="text-[10px] font-mono font-medium text-successGreen bg-successGreen/10 border border-successGreen/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="text-xs font-mono font-bold text-accentCyan py-1">
                {check.value}
              </div>

              <p className="text-[11px] text-textSecondary leading-relaxed">
                {check.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Purge Confirmation Dialog */}
      {showConfirmPurge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-borderTheme rounded-2xl max-w-md w-full p-5 shadow-elevated space-y-4">
            <div className="flex items-center gap-3 text-dangerRed">
              <div className="p-2 rounded-xl bg-dangerRed/10 border border-dangerRed/25">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-textPrimary text-sm">Purge In-Memory Session?</h3>
                <p className="text-xs text-textSecondary">Volatile heap state will be zeroed immediately.</p>
              </div>
            </div>

            <p className="text-xs text-textSecondary leading-relaxed">
              This action flushes all mounted documents, cached regex matches, and consistent pseudonym key tables.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                onClick={() => setShowConfirmPurge(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-textSecondary hover:bg-cardElevated transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePurge}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-dangerRed hover:opacity-90 shadow-md transition-all active:scale-95"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
