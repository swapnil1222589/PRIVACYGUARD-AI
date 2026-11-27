import React from 'react';
import {
  ShieldCheck,
  Award,
  Cpu,
  Layers,
  Lock,
  ServerOff,
  Database,
  ArrowRight,
  Code2,
  FileSpreadsheet,
} from 'lucide-react';

interface AboutPageProps {
  onNavigateToSanitizer: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateToSanitizer }) => {
  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans max-w-5xl">
      {/* Brand Header */}
      <div className="bg-card border border-borderTheme rounded-2xl p-5 shadow-card space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primaryPurple via-purple-600 to-accentCyan p-0.5 shadow-sm">
            <div className="w-full h-full bg-[#111111] rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primaryPurple" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-textPrimary tracking-wide">
              PRIVACYGUARD AI
            </h1>
            <p className="text-xs text-primaryPurple font-mono tracking-tight font-semibold">
              Your Data. Your Browser. Your Privacy.
            </p>
          </div>
        </div>

        <p className="text-xs text-textSecondary leading-relaxed max-w-3xl">
          PrivacyGuard AI is a privacy-first, browser-based data sanitization platform designed to detect, classify, highlight, and redact Personally Identifiable Information (PII) from raw text, TXT files, and CSV datasets without ever transmitting document contents to external servers.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primaryPurple/10 text-primaryPurple border border-primaryPurple/25">
            PromptWars × NIAT Pune
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-accentCyan/10 text-accentCyan border border-accentCyan/25">
            Cybersecurity & Privacy Track
          </span>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-successGreen/10 text-successGreen border border-successGreen/25">
            100% Client-Side Engine
          </span>
        </div>
      </div>

      {/* 3 Core Architectural Pillars (Compact cards matching Overview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-2">
          <div className="p-2 rounded-xl bg-primaryPurple/10 border border-primaryPurple/25 text-primaryPurple w-fit">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-textPrimary">Browser-Native V8 Engine</h3>
          <p className="text-[11px] text-textSecondary leading-relaxed">
            All token matching, regex executions, and Luhn checksum calculations execute strictly within your local browser JavaScript thread.
          </p>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-2">
          <div className="p-2 rounded-xl bg-accentCyan/10 border border-accentCyan/25 text-accentCyan w-fit">
            <ServerOff className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-textPrimary">Zero Telemetry Protocol</h3>
          <p className="text-[11px] text-textSecondary leading-relaxed">
            No server backend, no third-party analytic trackers, and zero localStorage persistence of sensitive document streams.
          </p>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-2">
          <div className="p-2 rounded-xl bg-successGreen/10 border border-successGreen/25 text-successGreen w-fit">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-textPrimary">Tri-Mode Redaction</h3>
          <p className="text-[11px] text-textSecondary leading-relaxed">
            Full Masking, Partial Masking, and Consistent Pseudonymization supporting reproducible data science pipelines.
          </p>
        </div>
      </div>

      {/* Supported Classification Standards */}
      <div className="bg-card border border-borderTheme rounded-2xl p-5 shadow-card space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-2">
          <Award className="w-4 h-4 text-primaryPurple" />
          Supported PII Detection Categories & Standards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-primaryPurple block text-[11px]">Electronic Mail (Email)</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">Strict RFC 5322 compliance pattern rejects malformed email strings.</p>
          </div>

          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-accentCyan block text-[11px]">Indian Mobile Telephony</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">Matches +91, 91, and 0 prefixed 10-digit mobile series starting with 6-9.</p>
          </div>

          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-blue-400 block text-[11px]">Internet Protocol v4</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">Dotted quad regex with octet validation [0-255]. Filters out invalid 999.x.x.x.</p>
          </div>

          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-warningOrange block text-[11px]">Income Tax PAN</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">Indian Govt 10-character alphanumeric structure [A-Z]{5}[0-9]{4}[A-Z].</p>
          </div>

          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-pink-400 block text-[11px]">Aadhaar-Shaped ID</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">12-digit grouped format with non-repetitive sequence verification.</p>
          </div>

          <div className="p-3 bg-cardElevated rounded-xl border border-borderTheme shadow-subtle space-y-1">
            <strong className="text-dangerRed block text-[11px]">Payment Cards (Luhn Checksum)</strong>
            <p className="text-textSecondary text-[10px] leading-relaxed">Visa, Mastercard, Amex, RuPay. Excludes Luhn-invalid card numbers.</p>
          </div>
        </div>
      </div>

      {/* Technology Stack Details */}
      <div className="bg-card border border-borderTheme rounded-2xl p-5 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-textPrimary flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-accentCyan" />
            Core Technology Stack
          </h4>
          <p className="text-[11px] text-textSecondary">
            React 18 • TypeScript • Vite • Tailwind CSS • Recharts • Lucide React • Papa Parse
          </p>
        </div>

        <button
          onClick={onNavigateToSanitizer}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-primaryPurple hover:opacity-90 text-white shadow-md transition-all active:scale-95 shrink-0"
        >
          <span>Open Data Sanitizer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
