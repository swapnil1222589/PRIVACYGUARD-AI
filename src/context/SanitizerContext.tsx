import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import {
  DetectionResult,
  DocumentState,
  PIICategory,
  RedactionMode,
  AnalyticsSummary,
} from '../types';
import { detectPII, isConfirmedDetection } from '../engine/detectors';
import {
  createPseudonymContext,
  redactDocument,
  PseudonymContext,
} from '../engine/redactor';
import {
  calculateMetadata,
  downloadSanitizedFile,
  processCsvContent,
  sanitizeCsv,
} from '../engine/processor';
import { exportSanitizedPDF } from '../engine/pdfExport';
import { SAMPLE_CSV, SAMPLE_TEXT } from '../data/sampleData';

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
  categoryCount?: number;
}

interface SanitizerContextType {
  document: DocumentState | null;
  detections: DetectionResult[];
  sanitizedText: string;
  redactionMode: RedactionMode;
  enabledCategories: Record<PIICategory, boolean>;
  selectedEntityId: string | null;
  isProcessing: boolean;
  activityHistory: ActivityLog[];
  theme: 'dark' | 'light';
  analytics: AnalyticsSummary;
  
  // Actions
  loadRawText: (text: string, filename?: string) => void;
  loadCsv: (csvText: string, filename?: string) => void;
  loadSampleText: () => void;
  loadSampleCsv: () => void;
  setRedactionMode: (mode: RedactionMode) => void;
  toggleCategory: (category: PIICategory) => void;
  selectEntity: (id: string | null) => void;
  resetWorkspace: () => void;
  exportSanitized: () => { success: boolean; filename: string } | null;
  exportPdf: (summaryOnly?: boolean) => { filename: string; size: number } | null;
  toggleTheme: () => void;
}

const DEFAULT_CATEGORIES: Record<PIICategory, boolean> = {
  email: true,
  phone: true,
  ip: true,
  pan: true,
  aadhaar: true,
  creditCard: true,
};

const SanitizerContext = createContext<SanitizerContextType | undefined>(undefined);

export const SanitizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [document, setDocument] = useState<DocumentState | null>(null);
  const [detections, setDetections] = useState<DetectionResult[]>([]);
  const [sanitizedText, setSanitizedText] = useState<string>('');
  const [redactionMode, setRedactionModeState] = useState<RedactionMode>('full');
  const [enabledCategories, setEnabledCategories] = useState<Record<PIICategory, boolean>>(DEFAULT_CATEGORIES);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activityHistory, setActivityHistory] = useState<ActivityLog[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action: 'Session Initialized',
      detail: 'Client-side zero-telemetry sandbox armed. No external telemetry active.',
    },
  ]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Maintain separate in-memory pseudonym context (never stored in local/sessionStorage)
  const pseudonymContextRef = useRef<PseudonymContext>(createPseudonymContext());

  const addActivity = useCallback((action: string, detail: string, categoryCount?: number) => {
    // Zero-data logging: Never persist raw sensitive strings into log
    setActivityHistory(prev => [
      {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        action,
        detail,
        categoryCount,
      },
      ...prev.slice(0, 19), // keep last 20 entries
    ]);
  }, []);

  const runSanitization = useCallback((
    rawText: string,
    rawDetections: DetectionResult[],
    mode: RedactionMode,
    cats: Record<PIICategory, boolean>,
    isCsv: boolean
  ) => {
    const ctx = createPseudonymContext();
    pseudonymContextRef.current = ctx;

    if (isCsv) {
      const sanitized = sanitizeCsv(rawText, mode, cats, ctx);
      setSanitizedText(sanitized);
      
      const { updatedDetections } = redactDocument(rawText, rawDetections, mode, cats, ctx);
      setDetections(updatedDetections);
    } else {
      const { sanitizedText: cleanText, updatedDetections } = redactDocument(
        rawText,
        rawDetections,
        mode,
        cats,
        ctx
      );
      setSanitizedText(cleanText);
      setDetections(updatedDetections);
    }
  }, []);

  const loadRawText = useCallback((text: string, filename: string = 'document.txt') => {
    setIsProcessing(true);
    const meta = calculateMetadata(filename, text, false);
    const docState: DocumentState = {
      metadata: meta,
      rawText: text,
      isCsv: false,
    };
    setDocument(docState);

    const found = detectPII(text);
    runSanitization(text, found, redactionMode, enabledCategories, false);
    setIsProcessing(false);
    addActivity('Text Document Loaded', `Processed ${text.length} characters with ${found.length} sensitive entities detected.`, found.length);
  }, [redactionMode, enabledCategories, runSanitization, addActivity]);

  const loadCsv = useCallback((csvText: string, filename: string = 'data.csv') => {
    setIsProcessing(true);
    const { documentState, detections: csvDetections } = processCsvContent(csvText, filename);
    setDocument(documentState);

    runSanitization(csvText, csvDetections, redactionMode, enabledCategories, true);
    setIsProcessing(false);
    addActivity('CSV Document Parsed', `Parsed ${documentState.metadata.rowCount || 0} rows, ${documentState.metadata.colCount || 0} columns with ${csvDetections.length} entities.`, csvDetections.length);
  }, [redactionMode, enabledCategories, runSanitization, addActivity]);

  const loadSampleText = useCallback(() => {
    loadRawText(SAMPLE_TEXT, 'sample_security_report.txt');
  }, [loadRawText]);

  const loadSampleCsv = useCallback(() => {
    loadCsv(SAMPLE_CSV, 'sample_corporate_directory.csv');
  }, [loadCsv]);

  const setRedactionMode = useCallback((mode: RedactionMode) => {
    setRedactionModeState(mode);
    if (document) {
      runSanitization(document.rawText, detections, mode, enabledCategories, document.isCsv);
      addActivity('Redaction Strategy Switched', `Mode changed to "${mode.toUpperCase()}".`);
    }
  }, [document, detections, enabledCategories, runSanitization, addActivity]);

  const toggleCategory = useCallback((category: PIICategory) => {
    const nextCats = {
      ...enabledCategories,
      [category]: !enabledCategories[category],
    };
    setEnabledCategories(nextCats);
    if (document) {
      runSanitization(document.rawText, detections, redactionMode, nextCats, document.isCsv);
      addActivity('Category Filter Toggled', `Toggled ${category.toUpperCase()} detection: ${nextCats[category] ? 'Enabled' : 'Disabled'}.`);
    }
  }, [document, detections, redactionMode, enabledCategories, runSanitization, addActivity]);

  const selectEntity = useCallback((id: string | null) => {
    setSelectedEntityId(id);
  }, []);

  const resetWorkspace = useCallback(() => {
    setDocument(null);
    setDetections([]);
    setSanitizedText('');
    setSelectedEntityId(null);
    pseudonymContextRef.current = createPseudonymContext();
    setEnabledCategories(DEFAULT_CATEGORIES);
    addActivity('Workspace Cleared', 'All memory buffers, raw documents, and pseudonym mappings purged securely.');
  }, [addActivity]);

  // Live real-time calculated analytics (distinguishing confirmed PII from rejected candidates)
  const analytics = useMemo<AnalyticsSummary>(() => {
    const confirmedDetections = detections.filter(isConfirmedDetection);
    const rejectedCandidates = detections.filter(d => !isConfirmedDetection(d));
    const activeDetections = confirmedDetections.filter(d => enabledCategories[d.category] !== false);
    const totalRedacted = activeDetections.length;
    const totalDetected = confirmedDetections.length;

    const categoryBreakdown: Record<PIICategory, number> = {
      email: 0,
      phone: 0,
      ip: 0,
      pan: 0,
      aadhaar: 0,
      creditCard: 0,
    };

    const uniqueSet = new Set<string>();
    let luhnValidCards = 0;
    let luhnInvalidCards = 0;
    let malformedIp = 0;

    for (const d of confirmedDetections) {
      if (categoryBreakdown[d.category] !== undefined) {
        categoryBreakdown[d.category]++;
      }
      uniqueSet.add(`${d.category}:${d.originalValue.toLowerCase()}`);
      if (d.category === 'creditCard' && d.validationStatus === 'luhn_valid') {
        luhnValidCards++;
      }
    }

    for (const d of rejectedCandidates) {
      if (d.category === 'creditCard' && d.validationStatus === 'luhn_invalid') {
        luhnInvalidCards++;
      }
      if (d.category === 'ip' && d.validationStatus === 'invalid') {
        malformedIp++;
      }
    }

    const efficiency = totalDetected > 0 ? Math.round((totalRedacted / totalDetected) * 100) : 100;

    return {
      totalDetected,
      totalRedacted,
      totalRejected: rejectedCandidates.length,
      categoryBreakdown,
      rejectedBreakdown: {
        luhnInvalid: luhnInvalidCards,
        malformedIp,
      },
      uniqueSensitiveCount: uniqueSet.size,
      luhnValidCards,
      luhnInvalidCards,
      redactionEfficiency: efficiency,
    };
  }, [detections, enabledCategories]);

  const exportSanitized = useCallback(() => {
    if (!document || !sanitizedText) return null;
    const result = downloadSanitizedFile(
      sanitizedText,
      document.metadata.filename,
      document.metadata.fileType
    );
    addActivity('Sanitized File Exported', `Generated local Blob and downloaded ${result.filename} with zero server roundtrips.`);
    return result;
  }, [document, sanitizedText, addActivity]);

  const exportPdf = useCallback((summaryOnly = false) => {
    if (!document || !sanitizedText) return null;
    const result = exportSanitizedPDF({
      filename: document.metadata.filename,
      sanitizedText,
      redactionMode,
      analytics,
      detections,
      isSummaryOnly: summaryOnly,
    });
    addActivity('Sanitized PDF Exported', `Generated client-side PDF (${result.filename}) with zero telemetry.`);
    return result;
  }, [document, sanitizedText, redactionMode, analytics, detections, addActivity]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (next === 'dark') {
        window.document.documentElement.classList.add('dark');
      } else {
        window.document.documentElement.classList.remove('dark');
      }
      return next;
    });
  }, []);

  return (
    <SanitizerContext.Provider
      value={{
        document,
        detections,
        sanitizedText,
        redactionMode,
        enabledCategories,
        selectedEntityId,
        isProcessing,
        activityHistory,
        theme,
        analytics,
        loadRawText,
        loadCsv,
        loadSampleText,
        loadSampleCsv,
        setRedactionMode,
        toggleCategory,
        selectEntity,
        resetWorkspace,
        exportSanitized,
        exportPdf,
        toggleTheme,
      }}
    >
      {children}
    </SanitizerContext.Provider>
  );
};

export function useSanitizer(): SanitizerContextType {
  const context = useContext(SanitizerContext);
  if (!context) {
    throw new Error('useSanitizer must be used within a SanitizerProvider');
  }
  return context;
}
