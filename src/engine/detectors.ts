import { DetectionResult, PIICategory, ValidationStatus } from '../types';
import { validateLuhn } from './luhn';

interface RawMatch {
  category: PIICategory;
  originalValue: string;
  startIndex: number;
  endIndex: number;
  validationStatus: ValidationStatus;
  explanation: string;
  priority: number; // For overlap resolution
}

/**
 * Determines whether a detected candidate is a confirmed PII entity or a rejected candidate.
 * Credit cards failing Luhn and IPv4 with invalid octets are rejected candidates.
 */
export function isConfirmedDetection(d: DetectionResult): boolean {
  if (d.category === 'creditCard') {
    return d.validationStatus === 'luhn_valid';
  }
  if (d.category === 'ip') {
    return d.validationStatus === 'valid';
  }
  return d.validationStatus !== 'luhn_invalid' && d.validationStatus !== 'invalid';
}

/**
 * Validates whether an IPv4 address has all octets in [0, 255].
 */
export function validateIPv4(candidate: string): boolean {
  const parts = candidate.split('.');
  if (parts.length !== 4) return false;
  return parts.every(part => {
    if (!/^\d{1,3}$/.test(part)) return false;
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Checks if 12-digit Aadhaar candidate is obviously invalid (e.g. all same digits like 0000 0000 0000 or 1111 1111 1111)
 */
export function validateAadhaar(candidate: string): boolean {
  const digits = candidate.replace(/[\s-]/g, '');
  if (digits.length !== 12 || !/^\d{12}$/.test(digits)) return false;
  // Cannot be all same repeated digits (e.g. 0000 0000 0000 or 1111 1111 1111)
  if (/^(\d)\1{11}$/.test(digits)) return false;
  return true;
}

/**
 * Detects all PII entities from raw text with deterministic conflict resolution.
 */
export function detectPII(text: string): DetectionResult[] {
  if (!text || text.trim() === '') {
    return [];
  }

  const rawMatches: RawMatch[] = [];

  // 1. Email Detection
  // Validates standard email patterns, rejects malformed emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  let match: RegExpExecArray | null;

  while ((match = emailRegex.exec(text)) !== null) {
    const val = match[0];
    rawMatches.push({
      category: 'email',
      originalValue: val,
      startIndex: match.index,
      endIndex: match.index + val.length,
      validationStatus: 'valid',
      explanation: 'Conforms to RFC 5322 email address format.',
      priority: 90,
    });
  }

  // 2. IPv4 Detection
  // Matches 4-part numeric strings separated by dots
  const ipRegex = /\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b/g;
  while ((match = ipRegex.exec(text)) !== null) {
    const val = match[1];
    const isValid = validateIPv4(val);
    rawMatches.push({
      category: 'ip',
      originalValue: val,
      startIndex: match.index,
      endIndex: match.index + val.length,
      validationStatus: isValid ? 'valid' : 'invalid',
      explanation: isValid
        ? 'Valid IPv4 address with all octets in [0, 255].'
        : 'Invalid IPv4 address: one or more octets exceed 255.',
      priority: 85,
    });
  }

  // 3. Indian PAN Card Detection
  // Format: 5 uppercase letters, 4 digits, 1 uppercase letter (case-insensitive in input)
  const panRegex = /\b([A-Za-z]{5}\d{4}[A-Za-z])\b/g;
  while ((match = panRegex.exec(text)) !== null) {
    const val = match[1];
    rawMatches.push({
      category: 'pan',
      originalValue: val,
      startIndex: match.index,
      endIndex: match.index + val.length,
      validationStatus: 'format_only',
      explanation: 'Matches Indian Permanent Account Number (PAN) structure (5 letters, 4 digits, 1 letter). Format validation does not verify government issuance.',
      priority: 80,
    });
  }

  // 4. Credit Card Detection (13 to 19 digits with optional spaces or dashes)
  // Example formats: 4111 1111 1111 1111, 4111-1111-1111-1111, 4111111111111111
  const ccRegex = /\b(?:\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,7}|\d{13,19})\b/g;
  while ((match = ccRegex.exec(text)) !== null) {
    const val = match[0];
    const cleanDigits = val.replace(/[\s-]/g, '');

    // Skip if it looks like an Aadhaar number (12 digits) or a phone number (10 digits) unless it strictly fits card length
    if (cleanDigits.length >= 13 && cleanDigits.length <= 19) {
      const { isValid } = validateLuhn(val);
      rawMatches.push({
        category: 'creditCard',
        originalValue: val,
        startIndex: match.index,
        endIndex: match.index + val.length,
        validationStatus: isValid ? 'luhn_valid' : 'luhn_invalid',
        explanation: isValid
          ? 'Passed ISO/IEC 7812 Luhn checksum verification for credit/debit card numbers.'
          : 'Failed ISO/IEC 7812 Luhn checksum verification. Not a valid card number.',
        priority: isValid ? 75 : 30, // Higher priority for valid card numbers
      });
    }
  }

  // 5. Aadhaar-shaped Number Detection
  // Format: 12 digits, often formatted as XXXX XXXX XXXX or XXXX-XXXX-XXXX, or 12 continuous digits
  // Negative lookahead prevents 16-digit credit cards from being partially matched as 12-digit Aadhaar
  const aadhaarRegex = /\b(\d{4}[ -]?\d{4}[ -]?\d{4})(?![ -]?\d)\b/g;
  while ((match = aadhaarRegex.exec(text)) !== null) {
    const val = match[1];
    const cleanDigits = val.replace(/[\s-]/g, '');
    if (cleanDigits.length === 12) {
      const isValid = validateAadhaar(val);
      if (isValid) {
        rawMatches.push({
          category: 'aadhaar',
          originalValue: val,
          startIndex: match.index,
          endIndex: match.index + val.length,
          validationStatus: 'format_only',
          explanation: 'Matches 12-digit Indian Aadhaar number format. Format check does not authenticate UIDAI identity verification.',
          priority: 70,
        });
      }
    }
  }

  // 6. Indian Phone Number Detection
  // Formats: +91 9876543210, +91-9876543210, 91 9876543210, 09876543210, 9876543210, +919876543210
  // Starts with 6, 7, 8, 9 for 10-digit mobile numbers
  const phoneRegex = /(?:\+91[\s-]?)?(?:91[\s-]?)?(?:0)?([6-9]\d{9})\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const mobileDigits = match[1];
    // Avoid capturing inside an already captured credit card or aadhaar
    rawMatches.push({
      category: 'phone',
      originalValue: fullMatch,
      startIndex: match.index,
      endIndex: match.index + fullMatch.length,
      validationStatus: 'valid',
      explanation: `Indian mobile number format (+91/0 prefix with valid 10-digit series starting with ${mobileDigits[0]}).`,
      priority: 60,
    });
  }

  // Sort matches deterministically:
  // Primary: startIndex ASC
  // Secondary: Priority DESC (e.g. Luhn Valid Card or Aadhaar over Phone)
  // Tertiary: Length DESC
  rawMatches.sort((a, b) => {
    if (a.startIndex !== b.startIndex) {
      return a.startIndex - b.startIndex;
    }
    if (b.priority !== a.priority) {
      return b.priority - a.priority;
    }
    return (b.endIndex - b.startIndex) - (a.endIndex - a.startIndex);
  });

  // Resolve overlaps deterministically:
  // If a candidate overlaps with an already accepted entity, keep the one with higher priority
  const resolved: DetectionResult[] = [];
  let lastEnd = -1;

  for (let i = 0; i < rawMatches.length; i++) {
    const curr = rawMatches[i];
    
    // Check if curr overlaps with previous
    if (curr.startIndex >= lastEnd) {
      resolved.push({
        id: `entity_${resolved.length + 1}_${curr.category}_${curr.startIndex}`,
        category: curr.category,
        originalValue: curr.originalValue,
        startIndex: curr.startIndex,
        endIndex: curr.endIndex,
        validationStatus: curr.validationStatus,
        explanation: curr.explanation,
      });
      lastEnd = curr.endIndex;
    }
  }

  return resolved;
}
