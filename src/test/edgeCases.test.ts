import { describe, it, expect } from 'vitest';
import { detectPII, validateIPv4, validateAadhaar } from '../engine/detectors';
import { redactDocument, createPseudonymContext, maskPartially, getPseudonym } from '../engine/redactor';
import { validateLuhn } from '../engine/luhn';
import { PIICategory } from '../types';

describe('PII Detection Engine — Comprehensive Edge Cases & Hardening', () => {
  const allEnabled: Record<PIICategory, boolean> = {
    email: true,
    phone: true,
    ip: true,
    pan: true,
    aadhaar: true,
    creditCard: true,
  };

  it('detects multiple distinct PII categories packed in a single sentence', () => {
    const text = 'User rahul@test.com with PAN ABCDE1234F, mobile +91 9876543210, IP 10.0.0.1, Aadhaar 2345 6789 0123, card 4111 1111 1111 1111.';
    const detections = detectPII(text);
    
    expect(detections.length).toBe(6);
    const categories = detections.map(d => d.category);
    expect(categories).toContain('email');
    expect(categories).toContain('pan');
    expect(categories).toContain('phone');
    expect(categories).toContain('ip');
    expect(categories).toContain('aadhaar');
    expect(categories).toContain('creditCard');
  });

  it('guarantees identical pseudonym mapping for repeated occurrences of the same PII value', () => {
    const text = 'Sent email to rahul@company.com. Forwarded by rahul@company.com to support. Reply to rahul@company.com.';
    const detections = detectPII(text);
    expect(detections.length).toBe(3);

    const ctx = createPseudonymContext();
    const { sanitizedText } = redactDocument(text, detections, 'pseudonym', allEnabled, ctx);

    // All 3 occurrences must resolve to USER_01
    expect(sanitizedText).toBe('Sent email to USER_01. Forwarded by USER_01 to support. Reply to USER_01.');
    expect(ctx.counters.email).toBe(2); // Only 1 unique entity assigned
  });

  it('assigns incrementing pseudonyms to distinct PII entities in the same category', () => {
    const ctx = createPseudonymContext();
    const p1 = getPseudonym('alice@test.com', 'email', ctx);
    const p2 = getPseudonym('bob@test.com', 'email', ctx);
    const p3 = getPseudonym('alice@test.com', 'email', ctx); // repeated

    expect(p1).toBe('USER_01');
    expect(p2).toBe('USER_02');
    expect(p3).toBe('USER_01'); // repeated value must match first
  });

  it('validates and detects various phone number formatting styles (+91, 91, 0, dashes, spaces)', () => {
    const text = 'A: +91 9876543210, B: +91-9876543210, C: 91 9876543210, D: 09876543210, E: 9876543210.';
    const detections = detectPII(text);
    const phones = detections.filter(d => d.category === 'phone');
    expect(phones.length).toBe(5);
  });

  it('rejects non-Indian phone patterns starting with 0-5 without mobile series', () => {
    const text = 'Not mobile: 0123456789, 1234567890, 2345678901, 5551234567.';
    const detections = detectPII(text);
    const phones = detections.filter(d => d.category === 'phone');
    expect(phones.length).toBe(0);
  });

  it('detects Aadhaar with space formatting, hyphen formatting, and continuous format', () => {
    const text = 'Spaced: 2345 6789 0123, Dashed: 2345-6789-0123, Continuous: 234567890123.';
    const detections = detectPII(text);
    const aadhaarList = detections.filter(d => d.category === 'aadhaar');
    expect(aadhaarList.length).toBe(3);
  });

  it('rejects Aadhaar false positives with repetitive digit sequences', () => {
    expect(validateAadhaar('0000 0000 0000')).toBe(false);
    expect(validateAadhaar('1111 1111 1111')).toBe(false);
    expect(validateAadhaar('9999 9999 9999')).toBe(false);
    expect(validateAadhaar('1234 5678')).toBe(false); // only 8 digits
    expect(validateAadhaar('1234 5678 9012 3456')).toBe(false); // 16 digits
  });

  it('prevents random 16-digit numeric strings from false-positive credit card verification via Luhn', () => {
    // 1234567890123456 fails Luhn
    const test1 = validateLuhn('1234 5678 9012 3456');
    expect(test1.isValid).toBe(false);

    // 0000 0000 0000 0000 has checksum 0 mod 10, but random sequences must strictly follow Luhn
    const text = 'Random invoice number 1234-5678-9012-3456 on transaction.';
    const detections = detectPII(text);
    const card = detections.find(d => d.category === 'creditCard');
    expect(card).toBeDefined();
    expect(card?.validationStatus).toBe('luhn_invalid');

    // When redacting, invalid Luhn card must NOT be redacted as a confirmed credit card
    const ctx = createPseudonymContext();
    const { sanitizedText } = redactDocument(text, detections, 'full', allEnabled, ctx);
    expect(sanitizedText).toBe(text); // Preserved because invalid candidate is rejected!
  });

  it('validates IPv4 octet bounds strictly [0, 255]', () => {
    expect(validateIPv4('0.0.0.0')).toBe(true);
    expect(validateIPv4('255.255.255.255')).toBe(true);
    expect(validateIPv4('127.0.0.1')).toBe(true);
    expect(validateIPv4('256.0.0.1')).toBe(false);
    expect(validateIPv4('192.168.1.300')).toBe(false);
    expect(validateIPv4('192.168.1')).toBe(false);
    expect(validateIPv4('192.168.1.1.1')).toBe(false);
  });

  it('handles partial masking correctly across all 6 PII categories', () => {
    expect(maskPartially('swapnil@example.com', 'email')).toBe('s***@example.com');
    expect(maskPartially('9876543210', 'phone')).toBe('XXXXXX3210');
    expect(maskPartially('+919876543210', 'phone')).toBe('XXXXXXXX3210');
    expect(maskPartially('ABCDE1234F', 'pan')).toBe('XXXXX1234F');
    expect(maskPartially('1234 5678 9012', 'aadhaar')).toBe('XXXX XXXX 9012');
    expect(maskPartially('1234-5678-9012', 'aadhaar')).toBe('XXXX-XXXX-9012');
    expect(maskPartially('4111 1111 1111 1111', 'creditCard')).toBe('XXXX XXXX XXXX 1111');
    expect(maskPartially('192.168.1.55', 'ip')).toBe('192.168.*.*');
  });

  it('preserves Unicode, accents, Devanagari text, and emojis around PII tokens', () => {
    const text = 'नमस्ते Rahul (rahul@example.com) 🛡️ secure PAN: ABCDE1234F résumé: François.';
    const detections = detectPII(text);
    expect(detections.length).toBe(2);

    const { sanitizedText } = redactDocument(text, detections, 'full', allEnabled);
    expect(sanitizedText).toContain('नमस्ते Rahul ([REDACTED]) 🛡️ secure PAN: [REDACTED] résumé: François.');
  });

  it('handles very large continuous text streams (50,000+ characters) with high throughput', () => {
    const unit = 'Record log: user contact rahul.large@domain.com from IP 10.20.30.40 on phone 9876543210. ';
    const repeated = unit.repeat(600); // ~54,000 characters
    expect(repeated.length).toBeGreaterThan(50000);

    const startTime = performance.now();
    const detections = detectPII(repeated);
    const duration = performance.now() - startTime;

    expect(detections.length).toBe(1800); // 3 PII entities * 600 repetitions
    expect(duration).toBeLessThan(1000); // Must execute in under 1 second client-side
  });
});
