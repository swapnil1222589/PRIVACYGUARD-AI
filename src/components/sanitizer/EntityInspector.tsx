import React from 'react';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Filter,
  Key,
  ShieldAlert,
} from 'lucide-react';
import { DetectionResult, PIICategory, RedactionMode } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';
import { isConfirmedDetection } from '../../engine/detectors';

interface EntityInspectorProps {
  detections: DetectionResult[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  enabledCategories: Record<PIICategory, boolean>;
  onToggleCategory: (cat: PIICategory) => void;
  redactionMode: RedactionMode;
}

export const EntityInspector: React.FC<EntityInspectorProps> = ({
  detections,
  selectedEntityId,
  enabledCategories,
  onToggleCategory,
}) => {
  const selectedEntity = detections.find(d => d.id === selectedEntityId) || detections[0];

  const categories: PIICategory[] = ['email', 'phone', 'ip', 'pan', 'aadhaar', 'creditCard'];

  const categoryCounts = categories.reduce((acc, cat) => {
    acc[cat] = detections.filter(d => d.category === cat).length;
    return acc;
  }, {} as Record<PIICategory, number>);

  const renderValidationStatus = (status: DetectionResult['validationStatus'], category: PIICategory) => {
    switch (status) {
      case 'luhn_valid':
        return (
          <span className="flex items-center gap-1 text-successGreen font-mono text-xs bg-successGreen/10 border border-successGreen/25 px-2 py-0.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Luhn Checksum Passed
          </span>
        );
      case 'luhn_invalid':
        return (
          <span className="flex items-center gap-1 text-dangerRed font-mono text-xs bg-dangerRed/10 border border-dangerRed/25 px-2 py-0.5 rounded-lg">
            <XCircle className="w-3.5 h-3.5" />
            Luhn Checksum Failed (Candidate Rejected)
          </span>
        );
      case 'valid':
        return (
          <span className="flex items-center gap-1 text-successGreen font-mono text-xs bg-successGreen/10 border border-successGreen/25 px-2 py-0.5 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Syntax & Range Valid
          </span>
        );
      case 'invalid':
        return (
          <span className="flex items-center gap-1 text-dangerRed font-mono text-xs bg-dangerRed/10 border border-dangerRed/25 px-2 py-0.5 rounded-lg">
            <XCircle className="w-3.5 h-3.5" />
            Invalid Range / Malformed
          </span>
        );
      case 'format_only':
        return (
          <span className="flex items-center gap-1 text-warningOrange font-mono text-xs bg-warningOrange/10 border border-warningOrange/25 px-2 py-0.5 rounded-lg">
            <HelpCircle className="w-3.5 h-3.5" />
            Format Only ({category === 'pan' ? 'Gov PAN Syntax' : 'UIDAI Shape'})
          </span>
        );
      default:
        return (
          <span className="text-textSecondary text-xs">
            Not Applicable
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Category Toggles Panel */}
      <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card">
        <div className="flex items-center justify-between pb-3 border-b border-borderTheme mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-textPrimary">
            <Filter className="w-3.5 h-3.5 text-accentCyan" />
            <span>Category Filters</span>
          </div>
          <span className="text-[11px] text-textSecondary font-mono">
            {Object.values(enabledCategories).filter(Boolean).length} / {categories.length} Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map(cat => {
            const isEnabled = enabledCategories[cat] !== false;
            const count = categoryCounts[cat] || 0;
            const meta = CATEGORY_COLORS[cat];

            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all ${
                  isEnabled
                    ? `${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} shadow-subtle font-medium`
                    : 'bg-cardElevated/50 border-borderTheme text-textSecondary opacity-50'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isEnabled ? meta.hex : '#94A3B8' }}
                  />
                  <span className="truncate">{meta.name}</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.2 bg-black/10 dark:bg-black/30 rounded">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Entity Details Card */}
      {selectedEntity ? (
        <div className="bg-card border border-borderTheme rounded-2xl p-4 shadow-card space-y-3">
          <div className="flex items-center justify-between border-b border-borderTheme pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primaryViolet" />
              <span className="text-xs font-semibold uppercase tracking-wider text-textPrimary">
                Entity Inspector
              </span>
            </div>
            {renderValidationStatus(selectedEntity.validationStatus, selectedEntity.category)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-cardElevated border border-borderTheme">
              <span className="text-[10px] uppercase font-semibold text-textSecondary block mb-1">
                Category
              </span>
              <span className="font-semibold text-primaryViolet">
                {CATEGORY_COLORS[selectedEntity.category]?.name || selectedEntity.category}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-cardElevated border border-borderTheme">
              <span className="text-[10px] uppercase font-semibold text-textSecondary block mb-1">
                Stream Coordinates
              </span>
              <span className="font-mono text-accentCyan">
                [{selectedEntity.startIndex} : {selectedEntity.endIndex}] ({selectedEntity.endIndex - selectedEntity.startIndex} chars)
              </span>
            </div>
          </div>

          {/* Transformation preview */}
          <div className="p-3 rounded-xl bg-cardElevated border border-borderTheme space-y-1">
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">
              Redaction Strategy Transformation
            </span>
            <div className="flex items-center justify-between gap-2 font-mono text-xs pt-1">
              <span className="text-dangerRed truncate max-w-[45%]">
                {selectedEntity.originalValue}
              </span>
              <span className="text-textSecondary font-bold">→</span>
              <span
                className={`font-semibold truncate max-w-[45%] ${
                  isConfirmedDetection(selectedEntity) ? 'text-successGreen' : 'text-textSecondary italic'
                }`}
              >
                {selectedEntity.redactedValue || '[REDACTED]'}
              </span>
            </div>
          </div>

          {/* Diagnostic status banner for rejected candidates */}
          {!isConfirmedDetection(selectedEntity) && (
            <div className="p-2.5 rounded-xl bg-dangerRed/10 border border-dangerRed/30 text-dangerRed text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 min-w-4 mt-0.5" />
              <span className="text-[11px] leading-tight">
                <strong>Candidate Rejected:</strong> Fails mathematical checksum. Excluded from confirmed credit card redaction to prevent data corruption.
              </span>
            </div>
          )}

          {/* Validation Engine Rationale */}
          <div className="p-2.5 rounded-xl bg-inputBg border border-borderTheme text-xs text-textSecondary space-y-1">
            <span className="text-[10px] uppercase font-semibold text-textSecondary block">
              Validation Engine Rationale
            </span>
            <p className="text-[11px] leading-relaxed text-textPrimary">
              {selectedEntity.explanation}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-borderTheme rounded-2xl p-6 text-center text-xs text-textSecondary shadow-card">
          No sensitive entity selected or detected in current document.
        </div>
      )}
    </div>
  );
};
