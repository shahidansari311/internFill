import { describe, it, expect, beforeEach } from 'vitest';
import { getFieldLabel, matchField, generateSelector } from '../detector';

describe('Autofill Detector', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('getFieldLabel', () => {
    it('finds label associated via "for" attribute', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <label for="test-input">Email Address</label>
        <input id="test-input" />
      `;
      document.body.appendChild(container);
      const input = document.getElementById('test-input')!;
      expect(getFieldLabel(input)).toBe('Email Address');
    });

    it('finds parent label element text', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <label>
          Phone Number
          <input id="test-input" />
        </label>
      `;
      document.body.appendChild(container);
      const input = document.getElementById('test-input')!;
      expect(getFieldLabel(input)).toBe('Phone Number');
    });

    it('falls back to placeholder', () => {
      const input = document.createElement('input');
      input.placeholder = 'Enter your first name';
      expect(getFieldLabel(input)).toBe('Enter your first name');
    });
  });

  describe('matchField', () => {
    it('matches exact keywords with high confidence', () => {
      const match = matchField('First Name', '', '');
      expect(match.fieldType).toBe('firstName');
      expect(match.confidence).toBeGreaterThan(0.9);
    });

    it('matches name/id substrings with lower confidence', () => {
      const match = matchField('', 'txt_first_name', '');
      expect(match.fieldType).toBe('firstName');
      expect(match.confidence).toBe(0.65);
    });

    it('returns unknown if no match found', () => {
      const match = matchField('Favorite Color', 'color', 'col');
      expect(match.fieldType).toBe('unknown');
      expect(match.confidence).toBe(0);
    });
  });

  describe('generateSelector', () => {
    it('generates ID selector if available', () => {
      const input = document.createElement('input');
      input.id = 'unique-id';
      expect(generateSelector(input)).toBe('#unique-id');
    });

    it('generates name attribute selector if available', () => {
      const input = document.createElement('input');
      input.setAttribute('name', 'email');
      expect(generateSelector(input)).toBe('[name="email"]');
    });
  });
});
