/**
 * Input sanitization utilities.
 * Prevents XSS and ensures data integrity before storage.
 */

const DANGEROUS_TAGS =
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const HTML_TAGS = /<\/?[^>]+(>|$)/g;
const MULTIPLE_SPACES = /\s{2,}/g;
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/**
 * Strip all HTML tags from a string
 */
export function stripHtml(input: string): string {
  return input.replace(DANGEROUS_TAGS, '').replace(HTML_TAGS, '');
}

/**
 * Sanitize a string input: strip HTML, control chars, normalize whitespace
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(DANGEROUS_TAGS, '')
    .replace(HTML_TAGS, '')
    .replace(CONTROL_CHARS, '')
    .replace(MULTIPLE_SPACES, ' ')
    .trim();
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(email: string): string {
  return sanitizeString(email).toLowerCase();
}

/**
 * Sanitize a URL
 */
export function sanitizeUrl(url: string): string {
  const sanitized = sanitizeString(url);

  // Only allow http, https, and mailto protocols
  if (
    sanitized.startsWith('http://') ||
    sanitized.startsWith('https://') ||
    sanitized.startsWith('mailto:')
  ) {
    return sanitized;
  }

  // If no protocol, assume https
  if (sanitized && !sanitized.includes('://')) {
    return `https://${sanitized}`;
  }

  return sanitized;
}

/**
 * Sanitize a phone number (keep digits, +, -, spaces, parens)
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d\s+\-()]/g, '').trim();
}

/**
 * Escape a string for safe HTML rendering
 */
export function escapeHtml(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  };
  return input.replace(/[&<>"']/g, (char) => map[char] ?? char);
}

/**
 * Deep sanitize an object — recursively sanitize all string values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T
): T {
  const result = { ...obj };

  for (const key of Object.keys(result)) {
    const value = result[key as keyof T];
    if (typeof value === 'string') {
      (result as Record<string, unknown>)[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      (result as Record<string, unknown>)[key] = value.map((item) =>
        typeof item === 'string'
          ? sanitizeString(item)
          : typeof item === 'object' && item !== null
            ? sanitizeObject(item as Record<string, unknown>)
            : item
      );
    } else if (typeof value === 'object' && value !== null) {
      (result as Record<string, unknown>)[key] = sanitizeObject(
        value as Record<string, unknown>
      );
    }
  }

  return result;
}
