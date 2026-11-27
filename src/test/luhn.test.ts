import { describe, it, expect } from 'vitest';
import { validateLuhn } from '../engine/luhn';

describe('Luhn Algorithm Checksum Verification', () => {
  it('validates a standard Luhn-compliant test card (4111111111111111)', () => {
    const res = validateLuhn('4111111111111111');
    expect(res.isValid).toBe(true);
  });

  it('validates Luhn card with spaces and dashes (4111 1111 1111 1111 / 4111-1111-1111-1111)', () => {
    expect(validateLuhn('4111 1111 1111 1111').isValid).toBe(true);
    expect(validateLuhn('4111-1111-1111-1111').isValid).toBe(true);
  });

  it('rejects an invalid card candidate that fails the checksum (4111111111111112)', () => {
    const res = validateLuhn('4111111111111112');
    expect(res.isValid).toBe(false);
  });

  it('rejects arbitrary non-card strings and random numbers that do not satisfy Luhn', () => {
    expect(validateLuhn('1234567890123456').isValid).toBe(false);
    expect(validateLuhn('9999999999999999').isValid).toBe(false);
  });

  it('rejects strings that are too short or contain non-digits', () => {
    expect(validateLuhn('12345').isValid).toBe(false);
    expect(validateLuhn('abc1234567890123').isValid).toBe(false);
  });
});
