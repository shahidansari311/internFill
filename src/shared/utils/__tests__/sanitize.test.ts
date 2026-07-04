import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeEmail,
  sanitizeUrl,
  sanitizePhone,
  escapeHtml,
  stripHtml,
  sanitizeObject,
} from '@/shared/utils/sanitize';

describe('sanitize utilities', () => {
  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <b>world</b></p>')).toBe('Hello world');
    });

    it('removes script tags', () => {
      expect(stripHtml('<script>alert("xss")</script>safe')).toBe('safe');
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('collapses multiple spaces', () => {
      expect(sanitizeString('hello    world')).toBe('hello world');
    });

    it('strips HTML', () => {
      expect(sanitizeString('<b>bold</b>')).toBe('bold');
    });

    it('returns empty for non-string', () => {
      expect(sanitizeString(123 as unknown as string)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('lowercases email', () => {
      expect(sanitizeEmail('User@Example.COM')).toBe('user@example.com');
    });
  });

  describe('sanitizeUrl', () => {
    it('preserves https URLs', () => {
      expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
    });

    it('adds https to bare domains', () => {
      expect(sanitizeUrl('example.com')).toBe('https://example.com');
    });
  });

  describe('sanitizePhone', () => {
    it('keeps valid phone characters', () => {
      expect(sanitizePhone('+1 (555) 123-4567')).toBe('+1 (555) 123-4567');
    });

    it('strips invalid characters', () => {
      expect(sanitizePhone('+1 555-ABC-4567')).toBe('+1 555--4567');
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML special characters', () => {
      expect(escapeHtml('<script>"test" & \'value\'')).toBe(
        '&lt;script&gt;&quot;test&quot; &amp; &#x27;value&#x27;'
      );
    });
  });

  describe('sanitizeObject', () => {
    it('deep sanitizes string values', () => {
      const result = sanitizeObject({
        name: '<b>John</b>',
        age: 25,
        tags: ['<i>dev</i>', 'student'],
      });
      expect(result.name).toBe('John');
      expect(result.age).toBe(25);
      expect(result.tags).toEqual(['dev', 'student']);
    });
  });
});
