import React, { useState } from 'react';
import { Terminal, Sparkles, Filter, CheckCircle2, Search, Code, Cpu } from 'lucide-react';
import { PROMPT_LOG_ENTRIES } from '../data/promptLog';
import { useSanitizer } from '../context/SanitizerContext';

export const PromptLogPage: React.FC = () => {
  const { activityHistory } = useSanitizer();
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stages = ['all', 'Foundation', 'Detection Engine', 'Redaction & Masking', 'UI & Visual Diff', 'Testing & Auditing'];

  const filteredPrompts = PROMPT_LOG_ENTRIES.filter(p => {
    const matchesStage = selectedStage === 'all' || p.stage === selectedStage;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.module.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primaryPurple/10 border border-primaryPurple/20 flex items-center justify-center text-primaryPurple shrink-0">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Prompt & Activity Log
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Review development prompts and application activity.
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-textSecondary absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="pl-8 pr-3 py-1.5 rounded-xl bg-cardElevated border border-borderTheme text-xs text-textPrimary placeholder-textSecondary focus:outline-none focus:border-primaryPurple transition-colors w-48 sm:w-60"
          />
        </div>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Logged Prompts</span>
          <div className="text-2xl font-bold font-mono tracking-tight text-textPrimary my-1">
            {PROMPT_LOG_ENTRIES.length}
          </div>
          <span className="text-[11px] text-textSecondary">Architectural milestones</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Application Events</span>
          <div className="text-2xl font-bold font-mono tracking-tight text-accentCyan my-1">
            {activityHistory.length}
          </div>
          <span className="text-[11px] text-textSecondary">Recorded in-memory session operations</span>
        </div>

        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card flex flex-col justify-between">
          <span className="text-xs font-medium text-textSecondary mb-2">Deterministic Engine</span>
          <div className="text-2xl font-bold font-mono tracking-tight text-successGreen my-1">
            100%
          </div>
          <span className="text-[11px] text-textSecondary">Zero external model inferences</span>
        </div>
      </div>

      {/* Stage Category Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-textSecondary shrink-0 mr-1" />
        {stages.map(stage => (
          <button
            key={stage}
            onClick={() => setSelectedStage(stage)}
            className={`px-3 py-1 rounded-xl capitalize transition-all text-xs font-medium shrink-0 ${
              selectedStage === stage
                ? 'bg-primaryPurple text-white shadow-sm'
                : 'bg-card border border-borderTheme text-textSecondary hover:text-textPrimary hover:bg-cardElevated'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Prompts Timeline List */}
      <div className="space-y-3">
        {filteredPrompts.map(entry => (
          <div
            key={entry.id}
            className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3 hover:border-primaryPurple/40 transition-colors"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borderTheme pb-2.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono bg-primaryPurple/10 border border-primaryPurple/20 text-primaryPurple font-semibold">
                  {entry.id.toUpperCase()}
                </span>
                <h3 className="text-xs font-bold text-textPrimary">
                  {entry.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-accentCyan/10 text-accentCyan border border-accentCyan/20">
                  {entry.module}
                </span>
                <span className="text-[10px] text-textSecondary font-mono">
                  {entry.date}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-textSecondary block mb-1">
                  Prompt Objective:
                </span>
                <p className="text-textPrimary leading-relaxed bg-cardElevated p-3 rounded-xl border border-borderTheme text-[11px]">
                  {entry.objective}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-textSecondary block mb-1">
                  Engineered Solution & Code Impact:
                </span>
                <p className="text-successGreen leading-relaxed bg-cardElevated p-3 rounded-xl border border-borderTheme flex items-start gap-2 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-successGreen shrink-0 mt-0.5" />
                  <span>{entry.implementationSummary}</span>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
