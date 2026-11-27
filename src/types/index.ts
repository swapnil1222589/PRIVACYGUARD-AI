export type PIICategory = 'email' | 'phone' | 'ip' | 'pan' | 'aadhaar' | 'creditCard';

export type ValidationStatus = 'luhn_valid' | 'luhn_invalid' | 'valid' | 'invalid' | 'format_only' | 'not_applicable';

export interface DetectionResult {
  id: string;
  category: PIICategory;
  originalValue: string;
  startIndex: number;
  endIndex: number;
  validationStatus: ValidationStatus;
  explanation: string;
  redactedValue?: string;
  row?: number;
  col?: number;
  header?: string;
}

export type RedactionMode = 'full' | 'partial' | 'pseudonym';

export interface DocumentMetadata {
  filename: string;
  fileType: 'text' | 'txt' | 'csv';
  fileSize: number;
  charCount: number;
  wordCount: number;
  lineCount: number;
  rowCount?: number;
  colCount?: number;
}

export interface DocumentState {
  metadata: DocumentMetadata;
  rawText: string;
  isCsv: boolean;
  csvHeaders?: string[];
  csvRows?: string[][];
}

export interface AnalyticsSummary {
  totalDetected: number;
  totalRedacted: number;
  totalRejected: number;
  categoryBreakdown: Record<PIICategory, number>;
  rejectedBreakdown: {
    luhnInvalid: number;
    malformedIp: number;
  };
  uniqueSensitiveCount: number;
  luhnValidCards: number;
  luhnInvalidCards: number;
  redactionEfficiency: number;
}

export interface PromptLogEntry {
  id: string;
  title: string;
  objective: string;
  module: string;
  stage: 'Foundation' | 'Detection Engine' | 'Redaction & Masking' | 'UI & Visual Diff' | 'Testing & Auditing';
  implementationSummary: string;
  date: string;
}

export interface PrivacyAuditMetric {
  title: string;
  status: 'compliant' | 'warning' | 'info';
  value: string;
  detail: string;
  guarantee: string;
}
