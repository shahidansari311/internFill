import { AUTOFILL_FIELD_MAPPINGS } from '../mappings/keywords';

export interface ResolvedField {
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
  fieldType: string;
  confidence: number;
  selector: string;
}

function isGenericLabel(text: string): boolean {
  const t = text.toLowerCase().trim();
  return (
    t === 'enter text' ||
    t === 'enter text ...' ||
    t === 'type here' ||
    t === 'write here' ||
    t === 'your answer' ||
    t === 'answer here' ||
    t === 'write your answer' ||
    t === 'optional' ||
    t === 'required' ||
    t === 'type your answer' ||
    t === 'enter your answer' ||
    t === 'type your response' ||
    t === 'enter your response' ||
    t === ''
  );
}

/**
 * Get the label text associated with a form element.
 */
export function getFieldLabel(el: HTMLElement): string {
  // Helper to check if a string is non-empty and not generic
  const clean = (val: string | null | undefined) => {
    if (!val) return '';
    const trimmed = val.trim();
    return isGenericLabel(trimmed) ? '' : trimmed;
  };

  // 1. Associated label via 'for' attribute
  if (el.id) {
    const label = document.querySelector(`label[for="${el.id}"]`);
    const val = clean(label?.textContent);
    if (val) return val;
  }

  // 2. Parent label element
  const parentLabel = el.closest('label');
  if (parentLabel) {
    const clone = parentLabel.cloneNode(true) as HTMLElement;
    const inputs = clone.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => input.remove());
    const val = clean(clone.textContent);
    if (val) return val;
  }

  // 3. Sibling / Ancestor text search (useful for complex forms like Internshala/Indeed)
  let current: HTMLElement | null = el;
  for (let i = 0; i < 3; i++) {
    if (!current) break;
    let prev = current.previousElementSibling;
    while (prev) {
      const val = clean(prev.textContent);
      if (val && val.length > 5) {
        const lowerVal = val.toLowerCase();
        
        // Skip file upload/document disclaimer notes
        if (
          lowerVal.includes('google drive') ||
          lowerVal.includes('dropbox') ||
          lowerVal.includes('max size') ||
          lowerVal.includes('upload')
        ) {
          prev = prev.previousElementSibling;
          continue;
        }

        // Return the closest non-disclaimer text
        return val;
      }
      prev = prev.previousElementSibling;
    }
    current = current.parentElement;
  }

  // 4. Aria label attributes
  const valAria = clean(el.getAttribute('aria-label'));
  if (valAria) return valAria;

  const ariaLabelledBy = el.getAttribute('aria-labelledby');
  if (ariaLabelledBy) {
    const labellingEl = document.getElementById(ariaLabelledBy);
    const valAriaBy = clean(labellingEl?.textContent);
    if (valAriaBy) return valAriaBy;
  }

  // 5. Title attribute
  const valTitle = clean(el.getAttribute('title'));
  if (valTitle) return valTitle;

  // 6. Placeholder
  if ('placeholder' in el) {
    const valPlaceholder = clean((el as HTMLInputElement).placeholder);
    if (valPlaceholder) return valPlaceholder;
  }

  // 7. Preceding text node (heuristic for simple forms)
  const previous = el.previousSibling;
  if (previous && previous.nodeType === Node.TEXT_NODE) {
    const valPrev = clean(previous.textContent);
    if (valPrev && valPrev.length > 5) return valPrev;
  }

  return '';
}

/**
 * Generate a unique CSS selector for a DOM element.
 */
export function generateSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  if (el.getAttribute('name')) return `[name="${el.getAttribute('name')}"]`;

  const parts: string[] = [];
  let current: HTMLElement | null = el;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();
    if (current.id) {
      selector = `#${current.id}`;
      parts.unshift(selector);
      break;
    }
    const parent = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1;
        selector += `:nth-of-type(${index})`;
      }
    }
    parts.unshift(selector);
    current = current.parentElement;
  }

  return parts.join(' > ');
}

/**
 * Score the element's label, name, and ID against the keyword mapping.
 * Returns the matched field type and confidence score (0 to 1).
 */
export function matchField(
  label: string,
  name: string,
  id: string
): { fieldType: string; confidence: number } {
  let bestMatch = 'unknown';
  let maxConfidence = 0;

  const normalizedLabel = label.toLowerCase().trim();
  const normalizedName = name.toLowerCase().trim();
  const normalizedId = id.toLowerCase().trim();

  for (const mapping of AUTOFILL_FIELD_MAPPINGS) {
    for (const keyword of mapping.keywords) {
      const kw = keyword.toLowerCase();

      // Exact match on label
      if (normalizedLabel === kw) {
        return { fieldType: mapping.type, confidence: 0.95 };
      }

      // Exact match on name or ID
      if (normalizedName === kw || normalizedId === kw) {
        return { fieldType: mapping.type, confidence: 0.9 };
      }

      // Label contains keyword as a whole word
      const labelRegex = new RegExp(`\\b${kw}\\b`, 'i');
      if (labelRegex.test(normalizedLabel)) {
        const conf = 0.85;
        if (conf > maxConfidence) {
          maxConfidence = conf;
          bestMatch = mapping.type;
        }
      }

      // Name or ID contains keyword as substring
      if (
        normalizedName.includes(kw.replace(/\s+/g, '')) ||
        normalizedId.includes(kw.replace(/\s+/g, '')) ||
        normalizedName.includes(kw.replace(/\s+/g, '_')) ||
        normalizedId.includes(kw.replace(/\s+/g, '_')) ||
        normalizedName.includes(kw.replace(/\s+/g, '-')) ||
        normalizedId.includes(kw.replace(/\s+/g, '-'))
      ) {
        const conf = 0.65;
        if (conf > maxConfidence) {
          maxConfidence = conf;
          bestMatch = mapping.type;
        }
      }
    }
  }

  return { fieldType: bestMatch, confidence: maxConfidence };
}

/**
 * Scans the DOM and detects form fields suitable for autofilling.
 */
export function detectFields(): ResolvedField[] {
  const elements = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]), textarea, select'
  );

  const resolved: ResolvedField[] = [];

  elements.forEach((el) => {
    // Skip if hidden or disabled
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || el.disabled) {
      return;
    }

    const label = getFieldLabel(el);
    const name = el.getAttribute('name') ?? '';
    const id = el.id ?? '';

    let { fieldType, confidence } = matchField(label, name, id);

    // Fallback: If it's a textarea and unknown, treat it as a custom AI question
    if (fieldType === 'unknown' && el.tagName.toLowerCase() === 'textarea') {
      fieldType = 'customQuestion';
      confidence = 0.8;
    }

    if (fieldType !== 'unknown' && confidence >= 0.5) {
      resolved.push({
        element: el,
        fieldType,
        confidence,
        selector: generateSelector(el),
      });
    }
  });

  return resolved;
}
