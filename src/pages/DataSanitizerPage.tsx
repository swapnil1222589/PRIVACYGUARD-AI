import React from 'react';
import { useSanitizer } from '../context/SanitizerContext';
import { InputWorkspace } from '../components/sanitizer/InputWorkspace';
import { RedactionModeSelector } from '../components/sanitizer/RedactionModeSelector';
import { DiffViewer } from '../components/sanitizer/DiffViewer';
import { EntityInspector } from '../components/sanitizer/EntityInspector';
import { ShieldCheck, FileSpreadsheet, Sparkles, Upload } from 'lucide-react';

export const DataSanitizerPage: React.FC = () => {
  const {
    document,
    detections,
    sanitizedText,
    redactionMode,
    setRedactionMode,
    enabledCategories,
    toggleCategory,
    selectedEntityId,
    selectEntity,
    loadSampleText,
    loadSampleCsv,
  } = useSanitizer();

  return (
    <div className="space-y-4 pb-10 animate-fade-in font-sans">
      {/* Top Banner Matching Overview Console Style */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-borderTheme shadow-card">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primaryPurple/10 border border-primaryPurple/20 flex items-center justify-center text-primaryPurple shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-textPrimary leading-tight">
              Data Sanitizer
            </h1>
            <p className="text-[11px] text-textSecondary leading-normal">
              Inspect, classify and sanitize sensitive information locally in browser memory.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            onClick={loadSampleText}
            aria-label="Load Synthetic Sample"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cardElevated hover:bg-borderTheme/50 text-textPrimary border border-borderTheme transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-accentCyan" />
            <span>Load Sample</span>
          </button>
          <button
            onClick={loadSampleCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-cardElevated hover:bg-borderTheme/50 text-textPrimary border border-borderTheme transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-primaryPurple" />
            <span>Sample CSV</span>
          </button>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-successGreen/10 border border-successGreen/20 text-successGreen text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-successGreen animate-pulse" />
            <span>Zero Egress</span>
          </div>
        </div>
      </div>

      {/* Top Section: Ingestion Workspace */}
      <InputWorkspace />

      {/* Redaction Strategy Selector */}
      <RedactionModeSelector
        currentMode={redactionMode}
        onChangeMode={setRedactionMode}
      />

      {/* Main Diff & Inspector Split View */}
      {document ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <DiffViewer
              originalText={document.rawText}
              sanitizedText={sanitizedText}
              detections={detections}
              selectedEntityId={selectedEntityId}
              onSelectEntity={selectEntity}
              redactionMode={redactionMode}
            />
          </div>

          <div className="lg:col-span-1">
            <EntityInspector
              detections={detections}
              selectedEntityId={selectedEntityId}
              onSelectEntity={selectEntity}
              enabledCategories={enabledCategories}
              onToggleCategory={toggleCategory}
              redactionMode={redactionMode}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-borderTheme bg-card/60 p-8 text-center space-y-3 shadow-card">
          <div className="w-12 h-12 rounded-2xl bg-primaryPurple/10 border border-primaryPurple/20 text-primaryPurple mx-auto flex items-center justify-center font-bold text-sm shadow-subtle">
            <Upload className="w-5 h-5 text-primaryPurple" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-textPrimary">No Document Mounted in Active Buffer</h3>
            <p className="text-xs text-textSecondary max-w-md mx-auto mt-1 leading-relaxed">
              Paste raw text into the input workspace or click &quot;Load Sample&quot; to inspect side-by-side sanitization with real-time entity tracking.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
