import { describe, it, expect } from 'vitest';
import { exportSanitizedPDF } from '../engine/pdfExport';
import { AnalyticsSummary, DetectionResult } from '../types';

describe('Client-Side PDF Export Engine', () => {
  const dummyAnalytics: AnalyticsSummary = {
    totalDetected: 5,
    totalRedacted: 5,
    totalRejected: 1,
    categoryBreakdown: {
      email: 2,
      phone: 1,
      ip: 1,
      pan: 1,
      aadhaar: 0,
      creditCard: 0,
    },
    rejectedBreakdown: {
      luhnInvalid: 1,
      malformedIp: 0,
    },
    uniqueSensitiveCount: 5,
    luhnValidCards: 0,
    luhnInvalidCards: 1,
    redactionEfficiency: 100,
  };

  const dummyDetections: DetectionResult[] = [
    {
      id: 'email-1',
      category: 'email',
      originalValue: 'rahul@example.com',
      startIndex: 0,
      endIndex: 17,
      validationStatus: 'valid',
      explanation: 'RFC 5322 compliant',
      redactedValue: '[REDACTED]',
    },
  ];

  it('generates a valid sanitized PDF document with correct metadata and non-zero bytes', () => {
    const res = exportSanitizedPDF({
      filename: 'sample_audit.txt',
      sanitizedText: 'Hello [REDACTED], your session is verified.',
      redactionMode: 'full',
      analytics: dummyAnalytics,
      detections: dummyDetections,
      isSummaryOnly: false,
    });

    expect(res).toBeDefined();
    expect(res.filename).toContain('PrivacyGuard_Sanitized_Report_');
    expect(res.filename.endsWith('.pdf')).toBe(true);
    expect(res.size).toBeGreaterThan(1000); // Valid PDF blob structure
  });

  it('generates an audit summary PDF when isSummaryOnly is true', () => {
    const res = exportSanitizedPDF({
      filename: 'financial_records.csv',
      sanitizedText: 'USER_01, PHONE_01, [REDACTED]',
      redactionMode: 'pseudonym',
      analytics: dummyAnalytics,
      detections: dummyDetections,
      isSummaryOnly: true,
    });

    expect(res).toBeDefined();
    expect(res.filename).toContain('.pdf');
    expect(res.size).toBeGreaterThan(500);
  });
});
