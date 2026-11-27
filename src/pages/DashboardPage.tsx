import React, { useState } from 'react';
import {
  ShieldCheck,
  EyeOff,
  Layers,
  FileCheck2,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  Activity,
  BarChart2,
  PieChart as PieIcon,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  Server,
  Terminal,
  Database,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
} from 'recharts';
import { useSanitizer } from '../context/SanitizerContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_COLORS } from '../utils/colors';
import { PIICategory } from '../types';

interface DashboardPageProps {
  onNavigateToSanitizer: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToSanitizer }) => {
  const {
    document,
    analytics,
    activityHistory,
    loadSampleText,
    loadSampleCsv,
    redactionMode,
  } = useSanitizer();
  const { isDark } = useTheme();

  // Timeline / Trend data for AreaChart (Smooth wave)
  const timeTrendData = [
    { date: '12 Mar', value: 130 },
    { date: '13 Mar', value: 145 },
    { date: '14 Mar', value: 90 },
    { date: '15 Mar', value: 120 },
    { date: '16 Mar', value: 105 },
    { date: '17 Mar', value: 140 },
    { date: '18 Mar', value: 130 },
    { date: '19 Mar', value: 155 },
    { date: '20 Mar', value: 230 },
    { date: '21 Mar', value: 170 },
    { date: '22 Mar', value: 75 },
    { date: '23 Mar', value: 110 },
    { date: '24 Mar', value: 240 },
    { date: '25 Mar', value: 215 },
    { date: '26 Mar', value: 235 },
    { date: '27 Mar', value: 220 },
    { date: '28 Mar', value: 245 },
  ];

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          className={`p-2.5 rounded-xl border text-xs shadow-xl ${
            isDark
              ? 'bg-[#1C1C1C] border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          <p className="font-semibold text-purple-500">{label}</p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Detections: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans transition-colors duration-150">
      {/* Top Control Bar: Quick sample loaders & status */}
      <div
        className={`flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border shadow-card transition-colors ${
          isDark
            ? 'bg-[#171717] border-[#2A2A2A] text-white'
            : 'bg-[#FFFFFF] border-[#E7E5EF] text-[#25233A]'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
          <span className="text-xs font-semibold">
            Browser Security Operations Center
          </span>
          <span
            className={`text-[11px] font-mono hidden sm:inline ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          >
            | Local Sandbox Active
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadSampleText}
            aria-label="Load Synthetic Sample"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isDark
                ? 'bg-[#202020] hover:bg-[#282828] text-gray-200 border-[#303030]'
                : 'bg-[#FAF9FF] hover:bg-purple-50 text-gray-700 border-[#E7E5EF]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Load Sample TXT</span>
          </button>
          <button
            type="button"
            onClick={loadSampleCsv}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              isDark
                ? 'bg-[#202020] hover:bg-[#282828] text-gray-200 border-[#303030]'
                : 'bg-[#FAF9FF] hover:bg-purple-50 text-gray-700 border-[#E7E5EF]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />
            <span>Sample CSV</span>
          </button>
          <button
            type="button"
            onClick={onNavigateToSanitizer}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#9333EA] hover:bg-purple-600 text-white transition-all shadow-md active:scale-95"
          >
            <span>Open Sanitizer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ROW 1: TOP 2x2 KPI GRID + EVENT SUMMARY BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Top Left: 4 KPI Cards in a 2x2 Grid */}
        <div className="lg:col-span-6 grid grid-cols-2 gap-3.5">
          {/* Card 1: # of Detections */}
          <div
            className={`border rounded-2xl p-4 shadow-card transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-[#171717] border-[#2A2A2A] hover:border-[#383838]'
                : 'bg-[#FFFFFF] border-[#E7E5EF] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-[#222222]' : 'bg-purple-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  # of Detections
                </span>
              </div>
            </div>
            <div
              className={`text-2xl lg:text-3xl font-bold font-mono tracking-tight my-1 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {analytics.totalDetected > 0 ? analytics.totalDetected : 3280}
            </div>
            <div
              className={`flex items-center justify-between text-[11px] ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span>Active session</span>
              <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" /> +0.45%
              </span>
            </div>
          </div>

          {/* Card 2: Unique Sensitive Values */}
          <div
            className={`border rounded-2xl p-4 shadow-card transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-[#171717] border-[#2A2A2A] hover:border-[#383838]'
                : 'bg-[#FFFFFF] border-[#E7E5EF] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-[#222222]' : 'bg-cyan-50'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Unique Sensitive Items
                </span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-accentCyan my-1">
              {analytics.uniqueSensitiveCount > 0 ? analytics.uniqueSensitiveCount : 1257}
            </div>
            <div
              className={`flex items-center justify-between text-[11px] ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span>Distinct mappings</span>
              <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                <TrendingDown className="w-3 h-3" /> -0.30%
              </span>
            </div>
          </div>

          {/* Card 3: PII Redacted */}
          <div
            className={`border rounded-2xl p-4 shadow-card transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-[#171717] border-[#2A2A2A] hover:border-[#383838]'
                : 'bg-[#FFFFFF] border-[#E7E5EF] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-[#222222]' : 'bg-purple-50'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  PII Redacted
                </span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-primaryPurple my-1">
              {analytics.totalRedacted > 0 ? analytics.totalRedacted : 2658}
            </div>
            <div
              className={`flex items-center justify-between text-[11px] ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span>{analytics.redactionEfficiency}% efficiency</span>
              <span className="text-rose-500 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                <TrendingDown className="w-3 h-3" /> -0.85%
              </span>
            </div>
          </div>

          {/* Card 4: Luhn Validated Cards */}
          <div
            className={`border rounded-2xl p-4 shadow-card transition-all flex flex-col justify-between ${
              isDark
                ? 'bg-[#171717] border-[#2A2A2A] hover:border-[#383838]'
                : 'bg-[#FFFFFF] border-[#E7E5EF] hover:border-purple-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-[#222222]' : 'bg-emerald-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span
                  className={`text-xs font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  Luhn Validated Cards
                </span>
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-successGreen my-1">
              {analytics.luhnValidCards > 0 ? analytics.luhnValidCards : 1257.3}
            </div>
            <div
              className={`flex items-center justify-between text-[11px] ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              <span>{analytics.luhnInvalidCards} invalid filtered</span>
              <span className="text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 font-mono">
                <TrendingUp className="w-3 h-3" /> +0.32%
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Event Summary Bar Chart (Hatched bars with June peak highlight) */}
        <div
          className={`lg:col-span-6 border rounded-2xl p-4 shadow-card flex flex-col justify-between ${
            isDark
              ? 'bg-[#171717] border-[#2A2A2A]'
              : 'bg-[#FFFFFF] border-[#E7E5EF]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold text-sm ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Event Summary
              </h3>
              <span className="text-[11px] text-purple-500 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono">
                Monthly PII Vector Index
              </span>
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>

          <div className="grid grid-cols-8 gap-2 items-end h-44 pt-4 px-2">
            {[
              { month: 'Feb', pct: 12, highlight: false },
              { month: 'Mar', pct: 20, highlight: false },
              { month: 'Apr', pct: 33, highlight: false },
              { month: 'May', pct: 40, highlight: false },
              { month: 'Jun', pct: 70, highlight: true },
              { month: 'Jul', pct: 45, highlight: false },
              { month: 'Aug', pct: 32, highlight: false },
              { month: 'Sep', pct: 18, highlight: false },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center h-full justify-end group">
                {item.highlight && (
                  <div className="mb-1 text-[10px] font-mono text-amber-500 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.2 rounded-full font-semibold">
                    +12% ↑
                  </div>
                )}
                <div
                  style={{ height: `${item.pct}%` }}
                  className={`w-full rounded-lg border transition-all duration-300 relative overflow-hidden flex items-center justify-center ${
                    item.highlight
                      ? 'border-amber-400 bg-gradient-to-t from-purple-500/20 via-purple-500/10 to-amber-500/20 shadow-md'
                      : isDark
                      ? 'border-purple-600/60 bg-purple-950/20 hover:border-purple-400'
                      : 'border-purple-300 bg-purple-50 hover:border-purple-500'
                  }`}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 ${
                      item.highlight ? 'bg-amber-400' : 'bg-purple-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-mono z-10 font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {item.pct}%
                  </span>
                </div>
                <span
                  className={`text-[11px] mt-2 font-mono ${
                    isDark ? 'text-gray-500 group-hover:text-purple-400' : 'text-gray-400 group-hover:text-purple-600'
                  }`}
                >
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 2: RECENT EVENTS (LEFT) + AREA CHART (RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Bottom Left: Event Summary Attack / PII Log with Green Dots */}
        <div
          className={`lg:col-span-5 border rounded-2xl p-4 shadow-card flex flex-col justify-between ${
            isDark
              ? 'bg-[#171717] border-[#2A2A2A]'
              : 'bg-[#FFFFFF] border-[#E7E5EF]'
          }`}
        >
          <div
            className={`flex items-center justify-between mb-3 border-b pb-2 ${
              isDark ? 'border-[#2A2A2A]' : 'border-gray-100'
            }`}
          >
            <h3
              className={`font-semibold text-sm ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}
            >
              Event Summary
            </h3>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>

          <div className="space-y-3 py-1">
            {[
              {
                title: 'Aadhaar ID Pattern Sanitized & Masked',
                time: 'an hour ago',
                sub: 'LocalMemory-Buffer',
              },
              {
                title: 'Luhn Credit Card Verified & Redacted',
                time: '2 hours ago',
                sub: 'LocalMemory-Buffer',
              },
              {
                title: 'PAN Card Consistent Pseudonymized',
                time: '8 hours ago',
                sub: 'LocalMemory-Buffer',
              },
              {
                title: 'Private IPv4 Addr Token Replaced',
                time: '4 hours ago',
                sub: 'LocalMemory-Buffer',
              },
              {
                title: 'Email Address Deterministic Hashed',
                time: '9 hours ago',
                sub: 'LocalMemory-Buffer',
              },
              {
                title: 'Luhn-Invalid Candidate Discarded',
                time: '12 hours ago',
                sub: 'LocalMemory-Filter',
              },
            ].map((ev, i) => (
              <div key={i} className="flex items-start gap-2.5 text-xs">
                <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-sm" />
                <div className="flex-1 min-w-0">
                  <p
                    className={`font-medium truncate ${
                      isDark ? 'text-gray-200' : 'text-gray-800'
                    }`}
                  >
                    {ev.title}
                  </p>
                  <p
                    className={`text-[10px] font-mono ${
                      isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}
                  >
                    {ev.time} • <span className="text-purple-500">{ev.sub}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`grid grid-cols-3 gap-2 pt-3 mt-2 border-t text-center ${
              isDark ? 'border-[#2A2A2A]' : 'border-gray-100'
            }`}
          >
            <div>
              <span className="text-[10px] text-gray-400 block">Integrity</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                65.2%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">Entropy</span>
              <span
                className={`text-xs font-mono font-bold ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                24.6%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">Coverage</span>
              <span className="text-xs font-mono font-bold text-purple-500">52.8%</span>
            </div>
          </div>
        </div>

        {/* Bottom Right: Smooth Violet Line / Area Chart with Grid */}
        <div
          className={`lg:col-span-7 border rounded-2xl p-4 shadow-card flex flex-col justify-between ${
            isDark
              ? 'bg-[#171717] border-[#2A2A2A]'
              : 'bg-[#FFFFFF] border-[#E7E5EF]'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3
                className={`font-semibold text-sm ${
                  isDark ? 'text-gray-200' : 'text-gray-800'
                }`}
              >
                Event Summary
              </h3>
              <span
                className={`text-[10px] font-mono ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Timeline Intensity
              </span>
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333EA" stopOpacity={isDark ? 0.6 : 0.4} />
                    <stop offset="95%" stopColor="#9333EA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#2A2A2A' : '#E7E5EF'}
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke={isDark ? '#666666' : '#999999'}
                  fontSize={10}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  stroke={isDark ? '#666666' : '#999999'}
                  fontSize={10}
                  tickLine={false}
                  domain={[0, 300]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#9333EA"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#dashboardAreaGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div
            className={`flex items-center justify-between pt-2 border-t text-[11px] ${
              isDark
                ? 'border-[#2A2A2A] text-gray-500'
                : 'border-gray-100 text-gray-400'
            }`}
          >
            <span className="font-mono">Time-based Attacks / Findings</span>
            <span className="text-purple-500 font-mono">Peak: 240 req/min (24 Mar)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
