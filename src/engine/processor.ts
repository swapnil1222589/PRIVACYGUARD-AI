import Papa from 'papaparse';
import { DetectionResult, DocumentMetadata, DocumentState, PIICategory, RedactionMode } from '../types';
import { detectPII, isConfirmedDetection } from './detectors';
import { createPseudonymContext, getPseudonym, maskPartially, PseudonymContext } from './redactor';

export interface ProcessedDocument {
  state: DocumentState;
  detections: DetectionResult[];
  sanitizedText: string;
}

/**
 * Validates uploaded file size and type.
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit for responsive browser processing
  const fileName = file.name.toLowerCase();
  const isTxt = fileName.endsWith('.txt');
  const isCsv = fileName.endsWith('.csv');

  if (!isTxt && !isCsv) {
    return {
      valid: false,
      error: `Unsupported file type "${file.name}". Please upload a standard .txt or .csv document.`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'The uploaded file is empty (0 bytes). Please provide a file with content.',
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File exceeds maximum size of 10MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please upload a smaller file.`,
    };
  }

  return { valid: true };
}

/**
 * Calculates metadata statistics for raw text.
 */
export function calculateMetadata(
  filename: string,
  rawText: string,
  isCsv: boolean,
  rowCount?: number,
  colCount?: number
): DocumentMetadata {
  const charCount = rawText.length;
  const wordCount = rawText.trim() === '' ? 0 : rawText.trim().split(/\s+/).length;
  const lineCount = rawText.length === 0 ? 0 : rawText.split(/\r?\n/).length;

  return {
    filename,
    fileType: isCsv ? 'csv' : 'txt',
    fileSize: new Blob([rawText]).size,
    charCount,
    wordCount,
    lineCount,
    rowCount,
    colCount,
  };
}

/**
 * Processes CSV content cell by cell to detect PII with exact cell row/column coordinates,
 * while preserving CSV delimiters, quotes, headers, and structure intact.
 */
export function processCsvContent(
  csvText: string,
  filename: string
): {
  documentState: DocumentState;
  detections: DetectionResult[];
} {
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: false, // preserve exact row indices
  });

  const rawRows = parsed.data;
  if (!rawRows || rawRows.length === 0) {
    const meta = calculateMetadata(filename, csvText, true, 0, 0);
    return {
      documentState: {
        metadata: meta,
        rawText: csvText,
        isCsv: true,
        csvHeaders: [],
        csvRows: [],
      },
      detections: [],
    };
  }

  const headers = rawRows[0] || [];
  const rows = rawRows.slice(1);
  const detections: DetectionResult[] = [];

  // Detect within rawText for overall stream viewing, but annotate with row/col
  const generalDetections = detectPII(csvText);

  // Cross-reference cell by cell
  let cellEntityIndex = 1;
  for (let r = 0; r < rawRows.length; r++) {
    const row = rawRows[r];
    for (let c = 0; c < row.length; c++) {
      const cellValue = row[c];
      if (cellValue && typeof cellValue === 'string') {
        const cellDetections = detectPII(cellValue);
        for (const cd of cellDetections) {
          detections.push({
            ...cd,
            id: `csv_cell_${r}_${c}_${cellEntityIndex++}`,
            row: r,
            col: c,
            header: headers[c] || `Column ${c + 1}`,
          });
        }
      }
    }
  }

  // Use generalDetections if row-by-row didn't produce cleaner indexes for text diffing
  const finalDetections = generalDetections.map((d) => {
    // Try to find matching cell detection
    const match = detections.find(cd => cd.originalValue === d.originalValue);
    if (match) {
      return {
        ...d,
        row: match.row,
        col: match.col,
        header: match.header,
      };
    }
    return d;
  });

  const meta = calculateMetadata(filename, csvText, true, rawRows.length, headers.length);

  return {
    documentState: {
      metadata: meta,
      rawText: csvText,
      isCsv: true,
      csvHeaders: headers,
      csvRows: rows,
    },
    detections: finalDetections,
  };
}

/**
 * Sanitizes CSV data while retaining exact CSV formatting, quotes, and structural integrity.
 */
export function sanitizeCsv(
  csvText: string,
  mode: RedactionMode,
  enabledCategories: Record<PIICategory, boolean>,
  context: PseudonymContext = createPseudonymContext()
): string {
  const parsed = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: false,
  });

  if (!parsed.data || parsed.data.length === 0) {
    return csvText;
  }

  const sanitizedRows = parsed.data.map(row => {
    return row.map(cell => {
      if (!cell || typeof cell !== 'string') return cell;
      const cellDetections = detectPII(cell).filter(
        d => enabledCategories[d.category] !== false && isConfirmedDetection(d)
      );
      if (cellDetections.length === 0) return cell;

      // Redact within cell
      let result = '';
      let cursor = 0;
      for (const det of cellDetections) {
        result += cell.substring(cursor, det.startIndex);
        let redacted = '[REDACTED]';
        if (mode === 'full') {
          redacted = '[REDACTED]';
        } else if (mode === 'partial') {
          redacted = maskPartially(det.originalValue, det.category);
        } else if (mode === 'pseudonym') {
          redacted = getPseudonym(det.originalValue, det.category, context);
        }
        result += redacted;
        cursor = det.endIndex;
      }
      result += cell.substring(cursor);
      return result;
    });
  });

  return Papa.unparse(sanitizedRows, {
    quotes: true,
    newline: '\r\n',
  });
}

/**
 * Generates and triggers download of sanitized file in browser via Blob API.
 */
export function downloadSanitizedFile(
  content: string,
  originalFilename: string,
  fileType: 'text' | 'txt' | 'csv'
): { success: boolean; filename: string } {
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  const extension = fileType === 'csv' ? '.csv' : '.txt';
  const downloadName = `${baseName}_sanitized${extension}`;

  const mimeType = fileType === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', downloadName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up object URL
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { success: true, filename: downloadName };
}
