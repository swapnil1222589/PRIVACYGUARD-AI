import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Layers,
} from 'lucide-react';
import { useSanitizer } from '../context/SanitizerContext';
import { CATEGORY_COLORS } from '../utils/colors';

interface FindingsPageProps {
  onNavigateToSanitizer?: () => void;
}

export const FindingsPage: React.FC<FindingsPageProps> = ({ onNavigateToSanitizer: _onNavigateToSanitizer }) => {
  const { document, detections, redactionMode } = useSanitizer();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = detections.filter(d => {
    const matchesCat = selectedCategory === 'all' || d.category === selectedCategory;
    const matchesQuery =
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primaryPurple/10 border border-primaryPurple/20 flex items-center justify-center text-primaryPurple shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Security Findings & PII Inventory
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Display detected sensitive entities in a compact enterprise inventory.
            </p>
          </div>
        </div>

        {document && (
          <div className="flex items-center gap-2 bg-cardElevated border border-borderTheme px-3 py-1.5 rounded-xl text-xs font-mono text-textPrimary shadow-subtle">
            <FileText className="w-3.5 h-3.5 text-accentCyan" />
            <span>Target: {document.metadata.filename}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
          <input
            type="text"
            value={searchQuery}
            aria-label="Search security findings"
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search entity ID, category or explanation..."
            className="w-full bg-inputBg border border-borderTheme rounded-xl pl-8 pr-3 py-1.5 text-xs text-textPrimary placeholder:text-textSecondary/60 focus:outline-none focus:border-primaryPurple transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <Filter className="w-3.5 h-3.5 text-textSecondary shrink-0 mr-1" />
          {(['all', 'email', 'phone', 'ip', 'pan', 'aadhaar', 'creditCard'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-medium capitalize shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-primaryPurple text-white shadow-sm'
                  : 'bg-cardElevated border border-borderTheme text-textSecondary hover:text-textPrimary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-card border border-borderTheme rounded-2xl overflow-hidden shadow-card">
        <div className="p-3.5 border-b border-borderTheme bg-cardElevated flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-textPrimary">
            Detected Entities ({filtered.length} of {detections.length})
          </span>
          <span className="text-[11px] font-mono text-primaryPurple font-medium">
            Active Strategy: {redactionMode.toUpperCase()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-borderTheme text-textSecondary bg-card/60">
                <th className="py-2.5 px-3.5 font-medium">Entity ID</th>
                <th className="py-2.5 px-3.5 font-medium">Category</th>
                <th className="py-2.5 px-3.5 font-medium">Validation Status</th>
                <th className="py-2.5 px-3.5 font-medium">Stream Position</th>
                <th className="py-2.5 px-3.5 font-medium">Sanitized Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderTheme/60">
              {filtered.length > 0 ? (
                filtered.map(entity => {
                  const catColor = CATEGORY_COLORS[entity.category]?.hex || '#9333EA';

                  return (
                    <tr
                      key={entity.id}
                      className="hover:bg-cardElevated/50 transition-colors font-mono"
                    >
                      <td className="py-2.5 px-3.5 text-textPrimary font-semibold text-[11px]">
                        {entity.id}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase text-white shadow-subtle"
                          style={{ backgroundColor: catColor }}
                        >
                          {entity.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5">
                        {entity.validationStatus === 'luhn_valid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-successGreen bg-successGreen/10 border border-successGreen/25 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            Luhn Valid
                          </span>
                        )}
                        {entity.validationStatus === 'luhn_invalid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-dangerRed bg-dangerRed/10 border border-dangerRed/25 px-2 py-0.5 rounded-lg font-semibold">
                            <XCircle className="w-3 h-3" />
                            Candidate Rejected
                          </span>
                        )}
                        {entity.validationStatus === 'valid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-successGreen bg-successGreen/10 border border-successGreen/25 px-2 py-0.5 rounded-lg">
                            <CheckCircle2 className="w-3 h-3" />
                            Format Confirmed
                          </span>
                        )}
                        {entity.validationStatus === 'format_only' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-warningOrange bg-warningOrange/10 border border-warningOrange/25 px-2 py-0.5 rounded-lg">
                            <HelpCircle className="w-3 h-3" />
                            Structural Match
                          </span>
                        )}
                        {entity.validationStatus === 'invalid' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-dangerRed bg-dangerRed/10 border border-dangerRed/25 px-2 py-0.5 rounded-lg">
                            <XCircle className="w-3 h-3" />
                            Malformed
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 text-textSecondary text-[11px]">
                        {entity.row !== undefined ? (
                          <span>
                            R{entity.row} : C{entity.col} ({entity.header})
                          </span>
                        ) : (
                          <span>
                            [{entity.startIndex} - {entity.endIndex}]
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-accentCyan text-[11px]">
                        {entity.redactedValue || '[UNMASKED]'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-textSecondary">
                    <p className="text-xs">No matching findings found in current buffer.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
