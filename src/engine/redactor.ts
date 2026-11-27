import { DetectionResult, PIICategory, RedactionMode } from '../types';
import { isConfirmedDetection } from './detectors';

export interface PseudonymContext {
  mapping: Map<string, string>; // normalized original value -> placeholder
  counters: Record<PIICategory, number>;
}

export function createPseudonymContext(): PseudonymContext {
  return {
    mapping: new Map<string, string>(),
    counters: {
      email: 1,
      phone: 1,
      ip: 1,
      pan: 1,
      aadhaar: 1,
      creditCard: 1,
    },
  };
}

const CATEGORY_PREFIXES: Record<PIICategory, string> = {
  email: 'USER',
  phone: 'PHONE',
  ip: 'IP',
  pan: 'PAN',
  aadhaar: 'AADHAAR',
  creditCard: 'CARD',
};

/**
 * Partial masking per category.
 */
export function maskPartially(value: string, category: PIICategory): string {
  switch (category) {
    case 'email': {
      const atIndex = value.indexOf('@');
      if (atIndex > 1) {
        const username = value.slice(0, atIndex);
        const domain = value.slice(atIndex);
        return `${username[0]}***${domain}`;
      } else if (atIndex === 1) {
        return `*${value.slice(atIndex)}`;
      }
      return '***@***.***';
    }

    case 'phone': {
      // Keep last 4 digits, replace earlier digits with X
      const digitsOnly = value.replace(/\D/g, '');
      if (digitsOnly.length >= 4) {
        const last4 = digitsOnly.slice(-4);
        const prefixLen = digitsOnly.length - 4;
        return `${'X'.repeat(prefixLen)}${last4}`;
      }
      return 'XXXXXX' + value.slice(-4);
    }

    case 'pan': {
      // Format: ABCDE1234F -> XXXXX1234F
      if (value.length === 10) {
        return 'XXXXX' + value.slice(5);
      }
      return 'XXXXX' + value.slice(-5);
    }

    case 'aadhaar': {
      // Format: 1234 5678 9012 -> XXXX XXXX 9012 or 1234-5678-9012 -> XXXX-XXXX-9012
      if (value.includes(' ')) {
        return 'XXXX XXXX ' + value.slice(-4);
      } else if (value.includes('-')) {
        return 'XXXX-XXXX-' + value.slice(-4);
      }
      return 'XXXXXXXX' + value.slice(-4);
    }

    case 'creditCard': {
      // Format: 4111 1111 1111 1111 -> XXXX XXXX XXXX 1111 or dashes or contiguous
      const cleanDigits = value.replace(/\D/g, '');
      const last4 = cleanDigits.slice(-4);
      if (value.includes('-')) {
        return 'XXXX-XXXX-XXXX-' + last4;
      } else if (value.includes(' ')) {
        return 'XXXX XXXX XXXX ' + last4;
      }
      return 'XXXX-XXXX-XXXX-' + last4;
    }

    case 'ip': {
      // Format: 192.168.1.10 -> 192.168.*.*
      const parts = value.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.*.*`;
      }
      return '*.*.*.*';
    }

    default:
      return '[REDACTED]';
  }
}

/**
 * Consistent pseudonymization mapping in-memory.
 */
export function getPseudonym(
  value: string,
  category: PIICategory,
  context: PseudonymContext
): string {
  // Normalize key for consistent matching (e.g. lowercase for email, uppercase for PAN)
  const normKey = `${category}:${value.trim().toLowerCase()}`;

  if (context.mapping.has(normKey)) {
    return context.mapping.get(normKey)!;
  }

  const prefix = CATEGORY_PREFIXES[category] || 'ENTITY';
  const count = context.counters[category] || 1;
  const countStr = count < 10 ? `0${count}` : `${count}`;
  const pseudonym = `${prefix}_${countStr}`;

  context.counters[category] = count + 1;
  context.mapping.set(normKey, pseudonym);

  return pseudonym;
}

/**
 * Applies the selected redaction mode to all detected entities in the source text.
 * Returns the sanitized string and updated detection list with `redactedValue`.
 */
export function redactDocument(
  sourceText: string,
  detections: DetectionResult[],
  mode: RedactionMode,
  enabledCategories: Record<PIICategory, boolean>,
  context: PseudonymContext = createPseudonymContext()
): { sanitizedText: string; updatedDetections: DetectionResult[] } {
  if (!sourceText || detections.length === 0) {
    return { sanitizedText: sourceText, updatedDetections: detections };
  }

  // Filter only detections whose category is enabled AND that are confirmed valid entities
  // Invalid Luhn candidates and malformed IPs are rejected and excluded from redaction
  const activeDetections = detections.filter(
    d => enabledCategories[d.category] !== false && isConfirmedDetection(d)
  );

  // Sort by start index ascending
  const sorted = [...activeDetections].sort((a, b) => a.startIndex - b.startIndex);

  const activeRedactedMap = new Map<string, string>();
  let result = '';
  let cursor = 0;

  for (const det of sorted) {
    // Append text before this detection
    result += sourceText.substring(cursor, det.startIndex);

    // Compute redacted value
    let redactedValue = '[REDACTED]';
    if (mode === 'full') {
      redactedValue = '[REDACTED]';
    } else if (mode === 'partial') {
      redactedValue = maskPartially(det.originalValue, det.category);
    } else if (mode === 'pseudonym') {
      redactedValue = getPseudonym(det.originalValue, det.category, context);
    }

    result += redactedValue;
    cursor = det.endIndex;
    activeRedactedMap.set(det.id, redactedValue);
  }

  // Append remaining text
  result += sourceText.substring(cursor);

  // Annotate all detections with accurate replacement or rejection status
  const updatedDetections = detections.map(det => {
    if (activeRedactedMap.has(det.id)) {
      return {
        ...det,
        redactedValue: activeRedactedMap.get(det.id),
      };
    }
    if (!isConfirmedDetection(det)) {
      return {
        ...det,
        redactedValue: '(Excluded — Checksum/Validation Failed)',
      };
    }
    return {
      ...det,
      redactedValue: '(Filtered Out — Category Disabled)',
    };
  });

  return {
    sanitizedText: result,
    updatedDetections,
  };
}
