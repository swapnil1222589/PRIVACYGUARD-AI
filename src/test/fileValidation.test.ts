import { describe, it, expect } from 'vitest';
import { validateFile, processCsvContent, sanitizeCsv } from '../engine/processor';
import { PIICategory } from '../types';

describe('File Validation & CSV Error Handling', () => {
  const allEnabled: Record<PIICategory, boolean> = {
    email: true,
    phone: true,
    ip: true,
    pan: true,
    aadhaar: true,
    creditCard: true,
  };

  it('rejects files exceeding the 10MB client processing limit', () => {
    // 11MB file
    const largeSize = 11 * 1024 * 1024;
    const oversizedFile = new File(['x'.repeat(100)], 'huge.txt', { type: 'text/plain' });
    Object.defineProperty(oversizedFile, 'size', { value: largeSize });

    const result = validateFile(oversizedFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File exceeds maximum size of 10MB');
  });

  it('accepts files within 10MB limit', () => {
    const normalFile = new File(['normal content'], 'sample.txt', { type: 'text/plain' });
    const result = validateFile(normalFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects unsupported file extensions (.exe, .png, .zip, .docx)', () => {
    const extensions = ['payload.exe', 'image.png', 'archive.zip', 'document.docx', 'script.sh'];
    for (const name of extensions) {
      const file = new File(['data'], name);
      const res = validateFile(file);
      expect(res.valid).toBe(false);
      expect(res.error).toContain('Unsupported file type');
    }
  });

  it('rejects 0-byte empty files', () => {
    const empty = new File([], 'empty.csv', { type: 'text/csv' });
    const res = validateFile(empty);
    expect(res.valid).toBe(false);
    expect(res.error).toContain('empty (0 bytes)');
  });

  it('handles completely empty CSV string gracefully', () => {
    const { documentState, detections } = processCsvContent('', 'empty.csv');
    expect(documentState.isCsv).toBe(true);
    expect(documentState.csvHeaders).toEqual([]);
    expect(documentState.csvRows).toEqual([]);
    expect(detections).toEqual([]);
  });

  it('handles malformed CSV rows with uneven columns without crashing', () => {
    const malformedCsv = `Header1,Header2,Header3\n"val1","val2"\n"val1","val2","val3","val4 extra"`;
    const { documentState, detections } = processCsvContent(malformedCsv, 'jagged.csv');
    
    expect(documentState.isCsv).toBe(true);
    expect(documentState.metadata.rowCount).toBe(3); // 1 header + 2 rows
    expect(detections).toEqual([]);
  });

  it('safely sanitizes CSV containing embedded quotes, commas, and line breaks in cells', () => {
    const complexCsv = `"Name","Email","Notes"\n"Smith, John","john.smith@domain.com","Notes with ""inner quotes"" and, commas"`;
    const sanitized = sanitizeCsv(complexCsv, 'full', allEnabled);

    expect(sanitized).toContain('[REDACTED]');
    expect(sanitized).not.toContain('john.smith@domain.com');
    // Ensure CSV cell escaping remains intact
    expect(sanitized).toContain('Smith, John');
  });
});
