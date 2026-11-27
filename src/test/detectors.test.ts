import { describe, it, expect } from 'vitest';
import { detectPII, validateIPv4, validateAadhaar } from '../engine/detectors';

describe('PII Detection Engine', () => {
  it('detects standard email addresses', () => {
    const text = 'Contact Rahul at rahul.demo@example.com for compliance.';
    const detections = detectPII(text);
    const emailDet = detections.find(d => d.category === 'email');
    expect(emailDet).toBeDefined();
    expect(emailDet?.originalValue).toBe('rahul.demo@example.com');
    expect(emailDet?.validationStatus).toBe('valid');
  });

  it('rejects malformed email patterns', () => {
    const text = 'Invalid emails: missingat.com, user@, @domain.com, user@domain.';
    const detections = detectPII(text);
    const emailDets = detections.filter(d => d.category === 'email');
    expect(emailDets.length).toBe(0);
  });

  it('detects Indian phone numbers with +91, 91, 0 prefixes and clean formats', () => {
    const text = 'Call +91 9876543210 or 9876543210 or 09876543210.';
    const detections = detectPII(text);
    const phones = detections.filter(d => d.category === 'phone');
    expect(phones.length).toBeGreaterThanOrEqual(3);
  });

  it('detects and validates IPv4 addresses with octets in [0, 255]', () => {
    expect(validateIPv4('192.168.1.10')).toBe(true);
    expect(validateIPv4('10.0.0.1')).toBe(true);
    expect(validateIPv4('256.100.0.1')).toBe(false);
    expect(validateIPv4('192.168.1.300')).toBe(false);

    const text = 'Primary: 192.168.1.10, Malformed: 192.168.1.300';
    const detections = detectPII(text);
    const validIp = detections.find(d => d.originalValue === '192.168.1.10');
    const invalidIp = detections.find(d => d.originalValue === '192.168.1.300');

    expect(validIp?.validationStatus).toBe('valid');
    expect(invalidIp?.validationStatus).toBe('invalid');
  });

  it('detects Indian PAN card format (ABCDE1234F)', () => {
    const text = 'Tax identifier: ABCDE1234F recorded.';
    const detections = detectPII(text);
    const pan = detections.find(d => d.category === 'pan');
    expect(pan).toBeDefined();
    expect(pan?.originalValue).toBe('ABCDE1234F');
    expect(pan?.validationStatus).toBe('format_only');
  });

  it('detects 12-digit Aadhaar-shaped numbers and rejects repetitive digit sequences', () => {
    expect(validateAadhaar('1234 5678 9012')).toBe(true);
    expect(validateAadhaar('0000 0000 0000')).toBe(false);
    expect(validateAadhaar('1111 1111 1111')).toBe(false);

    const text = 'Valid shape: 1234 5678 9012, Repetitive: 0000 0000 0000';
    const detections = detectPII(text);
    const aadhaar = detections.find(d => d.category === 'aadhaar');
    expect(aadhaar).toBeDefined();
    expect(aadhaar?.originalValue).toBe('1234 5678 9012');
  });

  it('detects candidate credit cards and verifies Luhn status', () => {
    const text = 'Valid: 4111111111111111, Invalid: 4111111111111112';
    const detections = detectPII(text);
    const cards = detections.filter(d => d.category === 'creditCard');

    const validCard = cards.find(c => c.originalValue === '4111111111111111');
    const invalidCard = cards.find(c => c.originalValue === '4111111111111112');

    expect(validCard?.validationStatus).toBe('luhn_valid');
    expect(invalidCard?.validationStatus).toBe('luhn_invalid');
  });

  it('resolves overlapping matches deterministically without mutating source text', () => {
    const text = 'User Rahul with card 4111 1111 1111 1111 and phone 9876543210';
    const detections = detectPII(text);
    expect(detections.length).toBe(2);
    // Ensure no overlapping start/end indices
    for (let i = 0; i < detections.length - 1; i++) {
      expect(detections[i].endIndex).toBeLessThanOrEqual(detections[i + 1].startIndex);
    }
  });

  it('handles empty text gracefully', () => {
    expect(detectPII('')).toEqual([]);
    expect(detectPII('   ')).toEqual([]);
  });
});
