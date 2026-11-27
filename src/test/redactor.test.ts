import { describe, it, expect } from 'vitest';
import { detectPII } from '../engine/detectors';
import {
  createPseudonymContext,
  maskPartially,
  redactDocument,
} from '../engine/redactor';
import { PIICategory } from '../types';

describe('Redaction & Masking Engine', () => {
  const allEnabled: Record<PIICategory, boolean> = {
    email: true,
    phone: true,
    ip: true,
    pan: true,
    aadhaar: true,
    creditCard: true,
  };

  it('performs Full Masking replacing all enabled entities with [REDACTED]', () => {
    const text = 'User rahul@example.com called 9876543210 with PAN ABCDE1234F.';
    const detections = detectPII(text);
    const { sanitizedText } = redactDocument(text, detections, 'full', allEnabled);

    expect(sanitizedText).toBe('User [REDACTED] called [REDACTED] with PAN [REDACTED].');
  });

  it('performs Partial Masking for emails, phones, PAN, Aadhaar, cards, and IPs', () => {
    expect(maskPartially('rahul@example.com', 'email')).toBe('r***@example.com');
    expect(maskPartially('9876543210', 'phone')).toBe('XXXXXX3210');
    expect(maskPartially('ABCDE1234F', 'pan')).toBe('XXXXX1234F');
    expect(maskPartially('2234 5678 9012', 'aadhaar')).toBe('XXXX XXXX 9012');
    expect(maskPartially('4111-1111-1111-1111', 'creditCard')).toBe('XXXX-XXXX-XXXX-1111');
    expect(maskPartially('192.168.1.10', 'ip')).toBe('192.168.*.*');
  });

  it('maintains consistent pseudonymization for repeated entities', () => {
    const text = 'Rahul (rahul@example.com) contacted rahul@example.com again.';
    const detections = detectPII(text);
    const ctx = createPseudonymContext();
    const { sanitizedText } = redactDocument(text, detections, 'pseudonym', allEnabled, ctx);

    // Both occurrences must have USER_01
    expect(sanitizedText).toBe('Rahul (USER_01) contacted USER_01 again.');
  });

  it('assigns different incremented pseudonyms to distinct entities within the same category', () => {
    const text = 'Contact Alice at alice@example.com and Bob at bob@example.com.';
    const detections = detectPII(text);
    const ctx = createPseudonymContext();
    const { sanitizedText } = redactDocument(text, detections, 'pseudonym', allEnabled, ctx);

    expect(sanitizedText).toContain('USER_01');
    expect(sanitizedText).toContain('USER_02');
  });

  it('respects category filtering toggles', () => {
    const text = 'Email: rahul@example.com, Phone: 9876543210';
    const detections = detectPII(text);
    // Disable phone
    const filter = { ...allEnabled, phone: false };
    const { sanitizedText } = redactDocument(text, detections, 'full', filter);

    expect(sanitizedText).toContain('[REDACTED]');
    expect(sanitizedText).toContain('9876543210'); // Phone remains intact
  });

  it('excludes Luhn-invalid card candidates and malformed IPs from redaction', () => {
    const text = 'Valid card: 4111111111111111, Invalid candidate: 4111111111111112, Malformed IP: 192.168.1.300, Valid IP: 192.168.1.10';
    const detections = detectPII(text);
    const { sanitizedText, updatedDetections } = redactDocument(text, detections, 'full', allEnabled);

    // Valid card must be redacted
    expect(sanitizedText).toContain('Valid card: [REDACTED]');
    // Invalid candidate card must NOT be redacted
    expect(sanitizedText).toContain('Invalid candidate: 4111111111111112');
    // Valid IP must be redacted
    expect(sanitizedText).toContain('Valid IP: [REDACTED]');
    // Malformed IP must NOT be redacted
    expect(sanitizedText).toContain('Malformed IP: 192.168.1.300');

    const invalidCardDet = updatedDetections.find(d => d.originalValue === '4111111111111112');
    expect(invalidCardDet?.redactedValue).toContain('Excluded');
  });
});
