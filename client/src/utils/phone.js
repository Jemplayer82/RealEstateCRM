/**
 * Phone number utilities for US format.
 * Accepts any input format (digits, dashes, dots, spaces, parens).
 * Stores and validates as 10 bare digits.
 * Displays as (XXX) XXX-XXXX.
 */

/** Strip everything that isn't a digit */
export const normalizePhone = (value) =>
  String(value ?? "").replace(/\D/g, "");

/**
 * Format a 10-digit string (or number) as (XXX) XXX-XXXX.
 * Returns the original value unchanged if it isn't exactly 10 digits.
 */
export const formatPhoneUS = (value) => {
  const digits = normalizePhone(value);
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    // Handle +1 country code
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  // Not a standard US number — return as-is so we don't mangle international
  return value ?? "";
};

/**
 * Live formatter for controlled inputs.
 * Strips non-digits as the user types and applies partial formatting:
 *   3 digits  → (XXX
 *   6 digits  → (XXX) XXX
 *   10 digits → (XXX) XXX-XXXX
 */
export const formatPhoneLive = (value) => {
  const digits = normalizePhone(value).slice(0, 10); // cap at 10
  if (digits.length <= 3) return digits.length ? `(${digits}` : "";
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};
