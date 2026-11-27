import React from 'react';
import {
  BarChart3,
  PieChart as PieIcon,
  Layers,
  FileSpreadsheet,
  ShieldCheck,
  CreditCard,
  Lock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useSanitizer } from '../context/SanitizerContext';
import { useTheme } from '../context/ThemeContext';
import { CATEGORY_COLORS } from '../utils/colors';
import { PIICategory } from '../types';

export const DetectionAnalyticsPage: React.FC = () => {
  const { document, detections, analytics, enabledCategories, redactionMode } = useSanitizer();
  const { isDark } = useTheme();

  const categories: PIICategory[] = ['email', 'phone', 'ip', 'pan', 'aadhaar', 'creditCard'];

  const categoryTableData = categories.map(cat => {
    const list = detections.filter(
      d =>
        d.category === cat &&
        (d.category !== 'creditCard' || d.validationStatus === 'luhn_valid') &&
        (d.category !== 'ip' || d.validationStatus === 'valid')
    );
    const isEnabled = enabledCategories[cat] !== false;
    return {
      cat,
      name: CATEGORY_COLORS[cat]?.name || cat,
      color: CATEGORY_COLORS[cat]?.hex || '#9333EA',
      count: list.length,
      redacted: isEnabled ? list.length : 0,
      skipped: isEnabled ? 0 : list.length,
      status: isEnabled ? 'Active' : 'Filtered Out',
    };
  });

  const chartData = categoryTableData.filter(d => d.count > 0);

  const cardValidationData = [
    { name: 'Luhn Valid', count: analytics.luhnValidCards, fill: '#10B981' },
    { name: 'Luhn Invalid', count: analytics.luhnInvalidCards, fill: '#F43F5E' },
  ];

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primaryPurple/10 border border-primaryPurple/20 flex items-center justify-center text-primaryPurple shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Detection Analytics
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Real-time PII detection and redaction intelligence computed locally in browser memory.
            </p>
          </div>
        </div>

        {document && (
          <div className="flex items-center gap-2 bg-cardElevated border border-borderTheme px-3 py-1.5 rounded-xl text-xs font-mono text-textPrimary shadow-subtle">
            <FileSpreadsheet className="w-3.5 h-3.5 text-accentCyan" />
            <span>Target: {document.metadata.filename}</span>
          </div>
        )}
      </div>

      {/* 4 Compact Top Metric Cards (Matches Overview Dashboard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-xs font-medium">Total PII Entities</span>
            <ShieldCheck className="w-4 h-4 text-primaryPurple" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-textPrimary my-1">
            {analytics.totalDetected}
          </div>
          <span className="text-[11px] text-textSecondary">Validated sensitive tokens</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-xs font-medium">Unique Sensitive Items</span>
            <Layers className="w-4 h-4 text-accentCyan" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-accentCyan my-1">
            {analytics.uniqueSensitiveCount}
          </div>
          <span className="text-[11px] text-textSecondary">Distinct pseudonym mappings</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-xs font-medium">Validated Cards</span>
            <CreditCard className="w-4 h-4 text-successGreen" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-successGreen my-1">
            {analytics.luhnValidCards}
          </div>
          <span className="text-[11px] text-dangerRed font-medium">
            {analytics.luhnInvalidCards} invalid candidate(s) excluded
          </span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between text-textSecondary mb-2">
            <span className="text-xs font-medium">Redaction Efficiency</span>
            <Lock className="w-4 h-4 text-primaryPurple" />
          </div>
          <div className="text-2xl lg:text-3xl font-bold font-mono tracking-tight text-primaryPurple my-1">
            {analytics.redactionEfficiency}%
          </div>
          <span className="text-[11px] text-textSecondary">
            {analytics.totalRedacted} of {analytics.totalDetected} items sanitized
          </span>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: PII Detection by Category */}
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-borderTheme">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-primaryPurple" />
              PII Detection by Category
            </h3>
            <span className="text-[10px] text-textSecondary font-mono">Count by entity type</span>
          </div>

          <div className="h-56 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#292929' : '#E5E1ED'} />
                  <XAxis dataKey="name" stroke={isDark ? '#71717A' : '#A1A1AA'} fontSize={10} tickLine={false} />
                  <YAxis stroke={isDark ? '#71717A' : '#A1A1AA'} fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#171717' : '#FFFFFF',
                      borderColor: isDark ? '#292929' : '#E5E1ED',
                      borderRadius: '12px',
                      fontSize: '11px',
                      color: isDark ? '#F5F5F5' : '#18181B',
                    }}
                  />
                  <Bar dataKey="count" fill="#9333EA" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-textSecondary">
                Mount a document to view detection telemetry
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Luhn Validation Distribution */}
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-borderTheme">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-accentCyan" />
              Payment Card Validation Breakdown
            </h3>
            <span className="text-[10px] text-textSecondary font-mono">Luhn Algorithm Audit</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {analytics.luhnValidCards > 0 || analytics.luhnInvalidCards > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cardValidationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {cardValidationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#171717' : '#FFFFFF',
                      borderColor: isDark ? '#292929' : '#E5E1ED',
                      borderRadius: '12px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-textSecondary text-center space-y-1">
                <CreditCard className="w-6 h-6 text-textSecondary mx-auto opacity-40" />
                <p>No credit card patterns detected in current buffer</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lower Section: Comprehensive Category Breakdown Table */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-borderTheme">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-textPrimary">
            Category Breakdown & Pipeline Disposition
          </h3>
          <span className="text-[10px] font-mono text-textSecondary">
            Active Mode: <strong className="text-primaryPurple uppercase">{redactionMode}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-borderTheme text-textSecondary font-semibold">
                <th className="py-2 px-3">PII Category</th>
                <th className="py-2 px-3">Detections</th>
                <th className="py-2 px-3">Redacted</th>
                <th className="py-2 px-3">Filter Status</th>
                <th className="py-2 px-3 text-right">Coverage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderTheme/50">
              {categoryTableData.map(row => {
                const pct = row.count > 0 ? Math.round((row.redacted / row.count) * 100) : 100;
                return (
                  <tr key={row.cat} className="hover:bg-cardElevated/50 transition-colors">
                    <td className="py-2 px-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="font-medium text-textPrimary">{row.name}</span>
                    </td>
                    <td className="py-2 px-3 font-mono text-textPrimary">{row.count}</td>
                    <td className="py-2 px-3 font-mono text-successGreen">{row.redacted}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-medium ${
                          row.status === 'Active'
                            ? 'bg-successGreen/10 text-successGreen border border-successGreen/25'
                            : 'bg-textSecondary/10 text-textSecondary border border-textSecondary/25'
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-textPrimary">
                      {row.count > 0 ? `${pct}%` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
