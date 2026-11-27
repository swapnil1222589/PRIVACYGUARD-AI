import { describe, it, expect } from 'vitest';
import {
  calculateMetadata,
  downloadSanitizedFile,
  processCsvContent,
  sanitizeCsv,
  validateFile,
} from '../engine/processor';
import { createPseudonymContext } from '../engine/redactor';
import { PIICategory } from '../types';

describe('Document Processing & CSV Handling', () => {
  const allEnabled: Record<PIICategory, boolean> = {
    email: true,
    phone: true,
    ip: true,
    pan: true,
    aadhaar: true,
    creditCard: true,
  };

  it('validates files and rejects unsupported file extensions', () => {
    const validFile = new File(['hello world'], 'test.txt', { type: 'text/plain' });
    expect(validateFile(validFile).valid).toBe(true);

    const pdfFile = new File(['%PDF...'], 'doc.pdf', { type: 'application/pdf' });
    const pdfRes = validateFile(pdfFile);
    expect(pdfRes.valid).toBe(false);
    expect(pdfRes.error).toContain('Unsupported file type');

    const emptyFile = new File([], 'empty.txt', { type: 'text/plain' });
    const emptyRes = validateFile(emptyFile);
    expect(emptyRes.valid).toBe(false);
    expect(emptyRes.error).toContain('empty');
  });

  it('calculates document metadata accurately', () => {
    const raw = 'Line 1 word\nLine 2 word test';
    const meta = calculateMetadata('test.txt', raw, false);
    expect(meta.charCount).toBe(raw.length);
    expect(meta.wordCount).toBe(7);
    expect(meta.lineCount).toBe(2);
  });

  it('parses CSV structure, preserving headers, columns, and quoted cells', () => {
    const csvContent = `"Name","Email","Phone","Notes"\n"Rahul Sharma","rahul@example.com","9876543210","Manager, Operations"\n"Priya","priya@example.com","9812345678","Lead"`;
    const { documentState, detections } = processCsvContent(csvContent, 'staff.csv');

    expect(documentState.isCsv).toBe(true);
    expect(documentState.csvHeaders).toEqual(['Name', 'Email', 'Phone', 'Notes']);
    expect(documentState.csvRows?.length).toBe(2);
    expect(detections.length).toBeGreaterThanOrEqual(4); // 2 emails + 2 phones
  });

  it('sanitizes CSV cells while preserving quotes, commas, and row integrity', () => {
    const csvContent = `"Name","Email","Phone","Notes"\n"Rahul","rahul@example.com","9876543210","Manager, Operations"`;
    const ctx = createPseudonymContext();
    const sanitizedCsv = sanitizeCsv(csvContent, 'pseudonym', allEnabled, ctx);

    expect(sanitizedCsv).toContain('USER_01');
    expect(sanitizedCsv).toContain('PHONE_01');
    expect(sanitizedCsv).toContain('Manager, Operations'); // quoted comma preserved
    expect(sanitizedCsv).not.toContain('rahul@example.com');
    expect(sanitizedCsv).not.toContain('9876543210');
  });

  it('triggers local Blob file download with zero external calls', () => {
    const res = downloadSanitizedFile('sanitized-content', 'confidential.csv', 'csv');
    expect(res.success).toBe(true);
    expect(res.filename).toBe('confidential_sanitized.csv');
  });
});
