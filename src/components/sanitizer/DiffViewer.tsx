import React, { useRef, useState } from 'react';
import {
  Copy,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Shield,
  FileText,
} from 'lucide-react';
import { DetectionResult, RedactionMode } from '../../types';
import { CATEGORY_COLORS } from '../../utils/colors';
import { useSanitizer } from '../../context/SanitizerContext';
import { isConfirmedDetection } from '../../engine/detectors';

interface DiffViewerProps {
  originalText: string;
  sanitizedText: string;
  detections: DetectionResult[];
  selectedEntityId: string | null;
  onSelectEntity: (id: string | null) => void;
  redactionMode: RedactionMode;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  originalText,
  sanitizedText,
  detections,
  selectedEntityId,
  onSelectEntity,
  redactionMode,
}) => {
  const { exportSanitized, exportPdf, document } = useSanitizer();
  const [copied, setCopied] = useState(false);
  const [activeEntityIndex, setActiveEntityIndex] = useState<number>(0);
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isSyncingScroll = useRef(false);

  // Synchronized scrolling between left and right panes
  const handleScroll = (source: 'left' | 'right') => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;

    const sourceEl = source === 'left' ? leftPaneRef.current : rightPaneRef.current;
    const targetEl = source === 'left' ? rightPaneRef.current : leftPaneRef.current;

    if (sourceEl && targetEl) {
      const scrollRatio = sourceEl.scrollTop / (sourceEl.scrollHeight - sourceEl.clientHeight || 1);
      targetEl.scrollTop = scrollRatio * (targetEl.scrollHeight - targetEl.clientHeight);
    }

    setTimeout(() => {
      isSyncingScroll.current = false;
    }, 25);
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(sanitizedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleNextEntity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (detections.length === 0) return;
    const nextIdx = (activeEntityIndex + 1) % detections.length;
    setActiveEntityIndex(nextIdx);
    onSelectEntity(detections[nextIdx].id);
  };

  const handlePrevEntity = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (detections.length === 0) return;
    const prevIdx = (activeEntityIndex - 1 + detections.length) % detections.length;
    setActiveEntityIndex(prevIdx);
    onSelectEntity(detections[prevIdx].id);
  };

  const handleExportRaw = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportSanitized();
  };

  const handleExportPdf = (e: React.MouseEvent) => {
    e.stopPropagation();
    exportPdf(false);
  };

  // Safe entity highlighting in original text
  const renderOriginalHighlighted = () => {
    if (!originalText) {
      return <span className="text-textSecondary italic">No original document loaded.</span>;
    }
    if (detections.length === 0) {
      return <span>{originalText}</span>;
    }

    const sorted = [...detections].sort((a, b) => a.startIndex - b.startIndex);
    const elements: React.ReactNode[] = [];
    let cursor = 0;

    sorted.forEach((det, idx) => {
      if (det.startIndex > cursor) {
        elements.push(
          <span key={`plain-${cursor}`}>
            {originalText.substring(cursor, det.startIndex)}
          </span>
        );
      }

      const colorMeta = CATEGORY_COLORS[det.category] || CATEGORY_COLORS.email;
      const isSelected = selectedEntityId === det.id;
      const confirmed = isConfirmedDetection(det);

      elements.push(
        <mark
          key={det.id || `det-${idx}`}
          onClick={() => {
            onSelectEntity(det.id);
            setActiveEntityIndex(idx);
          }}
          className={`cursor-pointer px-1 py-0.5 rounded font-mono text-xs transition-all border ${
            confirmed
              ? `${colorMeta.highlightBg} ${colorMeta.highlightText} ${colorMeta.highlightBorder}`
              : 'bg-dangerRed/15 text-dangerRed line-through border-dangerRed/40'
          } ${
            isSelected
              ? 'ring-2 ring-primaryPurple border-primaryPurple shadow-md font-bold'
              : ''
          }`}
          title={`${colorMeta.name}: ${det.explanation}`}
        >
          {originalText.substring(det.startIndex, det.endIndex)}
        </mark>
      );

      cursor = det.endIndex;
    });

    if (cursor < originalText.length) {
      elements.push(
        <span key={`plain-${cursor}`}>
          {originalText.substring(cursor)}
        </span>
      );
    }

    return elements;
  };

  const originalLines = originalText ? originalText.split(/\r?\n/) : [];
  const sanitizedLines = sanitizedText ? sanitizedText.split(/\r?\n/) : [];

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-borderTheme overflow-hidden shadow-card transition-colors">
      {/* Diff Toolbar */}
      <div className="h-11 px-3 sm:px-4 bg-cardElevated border-b border-borderTheme flex items-center justify-between gap-3">
        {/* Navigation & Controls */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-textPrimary flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-primaryPurple" />
            Comparison Inspector
          </span>

          {detections.length > 0 && (
            <div className="flex items-center gap-1 bg-card border border-borderTheme px-2 py-0.5 rounded-md text-xs shadow-subtle">
              <span className="text-textSecondary font-mono text-[11px]">
                {activeEntityIndex + 1} of {detections.length}
              </span>
              <button
                onClick={handlePrevEntity}
                className="p-0.5 hover:text-textPrimary text-textSecondary transition-colors"
                title="Previous sensitive entity"
                aria-label="Previous sensitive entity"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextEntity}
                className="p-0.5 hover:text-textPrimary text-textSecondary transition-colors"
                title="Next sensitive entity"
                aria-label="Next sensitive entity"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Selected Mode & Action Buttons */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 text-[11px] bg-primaryPurple/10 border border-primaryPurple/25 text-primaryPurple px-2 py-0.5 rounded-md font-medium">
            <Sparkles className="w-3 h-3 text-accentCyan" />
            <span>Active Mode: <strong className="capitalize">{redactionMode} Masking</strong></span>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy sanitized document to clipboard"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-cardElevated hover:bg-borderTheme/50 text-textPrimary border border-borderTheme rounded-md transition-all shadow-subtle"
            title="Copy sanitized document to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-successGreen" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportRaw}
            aria-label={`Download sanitized ${document?.metadata.fileType.toUpperCase() || 'document'}`}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-cardElevated hover:bg-borderTheme/50 text-textPrimary border border-borderTheme rounded-md transition-all shadow-subtle"
            title={`Download sanitized ${document?.metadata.fileType.toUpperCase() || 'document'}`}
          >
            <Download className="w-3.5 h-3.5 text-accentCyan" />
            <span>{document?.isCsv ? 'Export CSV' : 'Export TXT'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            aria-label="Generate and download certified sanitized PDF report"
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-primaryPurple hover:opacity-90 text-white rounded-md shadow-sm transition-all"
            title="Generate and download certified sanitized PDF report"
          >
            <FileText className="w-3.5 h-3.5 text-white" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Dual Pane Comparison Area with Line Numbers */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-borderTheme overflow-hidden min-h-[460px]">
        {/* Left Pane: Original */}
        <div className="flex flex-col h-full bg-inputBg/30">
          <div className="px-3 py-1.5 border-b border-borderTheme bg-cardElevated/80 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-dangerRed">
              <span className="w-1.5 h-1.5 rounded-full bg-dangerRed" />
              <span className="text-[11px] tracking-wider uppercase">ORIGINAL RAW STREAM</span>
            </div>
            <span className="text-[10px] font-mono text-textSecondary">
              {originalText.length} chars • {originalLines.length} lines
            </span>
          </div>

          <div
            ref={leftPaneRef}
            onScroll={() => handleScroll('left')}
            className="flex-1 overflow-auto flex text-xs font-mono select-text"
          >
            {/* Line Number Gutter */}
            {originalLines.length > 0 && (
              <div className="select-none py-3 px-2 text-right text-textSecondary/40 border-r border-borderTheme/40 bg-cardElevated/40 font-mono text-[11px] leading-relaxed shrink-0">
                {originalLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            {/* Text Stream */}
            <div className="flex-1 p-3 leading-relaxed text-textPrimary whitespace-pre-wrap selection:bg-primaryPurple/25">
              {renderOriginalHighlighted()}
            </div>
          </div>
        </div>

        {/* Right Pane: Sanitized */}
        <div className="flex flex-col h-full bg-inputBg/30">
          <div className="px-3 py-1.5 border-b border-borderTheme bg-cardElevated/80 flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-successGreen">
              <span className="w-1.5 h-1.5 rounded-full bg-successGreen" />
              <span className="text-[11px] tracking-wider uppercase">SANITIZED OUTPUT ({redactionMode.toUpperCase()})</span>
            </div>
            <span className="text-[10px] font-mono text-textSecondary">
              {sanitizedText.length} chars • {sanitizedLines.length} lines
            </span>
          </div>

          <div
            ref={rightPaneRef}
            onScroll={() => handleScroll('right')}
            className="flex-1 overflow-auto flex text-xs font-mono select-text"
          >
            {/* Line Number Gutter */}
            {sanitizedLines.length > 0 && (
              <div className="select-none py-3 px-2 text-right text-textSecondary/40 border-r border-borderTheme/40 bg-cardElevated/40 font-mono text-[11px] leading-relaxed shrink-0">
                {sanitizedLines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            {/* Text Stream */}
            <div className="flex-1 p-3 leading-relaxed text-textPrimary whitespace-pre-wrap selection:bg-successGreen/25">
              {sanitizedText ? (
                sanitizedText
              ) : (
                <span className="text-textSecondary italic">No sanitized output ready.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="px-3 py-2 bg-cardElevated border-t border-borderTheme flex flex-wrap items-center justify-between gap-2.5 text-xs text-textSecondary">
        <div className="flex items-center gap-3.5 flex-wrap text-[11px]">
          <span>
            Entities Detected: <strong className="text-textPrimary">{detections.length}</strong>
          </span>
          <span>
            Strategy: <strong className="text-primaryPurple capitalize">{redactionMode}</strong>
          </span>
          <span>
            Original: <strong className="text-textPrimary">{originalText.length} B</strong>
          </span>
          <span>
            Sanitized: <strong className="text-textPrimary">{sanitizedText.length} B</strong>
          </span>
        </div>
        <div className="text-[10px] text-textSecondary flex items-center gap-1">
          <Shield className="w-3 h-3 text-successGreen" />
          <span>Computed 100% in local browser heap memory.</span>
        </div>
      </div>
    </div>
  );
};
