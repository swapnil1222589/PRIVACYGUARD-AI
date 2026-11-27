/**
 * Luhn algorithm implementation for validating credit card candidates.
 * 
 * Rules:
 * - Strip spaces and hyphens
 * - Candidate must consist of digits only (13-19 digits)
 * - From right to left, double every second digit starting from the penultimate digit
 * - If doubled digit > 9, subtract 9
 * - Sum all digits
 * - Valid if sum % 10 === 0
 */
export function validateLuhn(candidate: string): { isValid: boolean; cleanNumber: string } {
  // Strip spaces, dashes, dots
  const cleanNumber = candidate.replace(/[\s\-.]/g, '');

  // Must consist only of 13 to 19 digits (standard credit card lengths: Visa 13/16/19, MC 16, Amex 15, Discover 16, Diners 14, RuPay 16)
  if (!/^\d{13,19}$/.test(cleanNumber)) {
    return { isValid: false, cleanNumber };
  }

  let sum = 0;
  let shouldDouble = false;

  // Loop through digits from right to left
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return {
    isValid: sum % 10 === 0,
    cleanNumber,
  };
}
