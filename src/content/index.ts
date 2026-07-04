/**
 * InternFill Content Script
 * Injected into web pages to detect and fill form fields.
 * Full implementation in Milestone 3.
 */

// ── Message Listener ──
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'AUTOFILL_PAGE') {
    handleAutofill(message.profileId)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ error: String(err) }));
    return true;
  }

  if (message.type === 'DETECT_FIELDS') {
    const fields = detectFormFields();
    sendResponse({ type: 'FIELDS_DETECTED', fields });
    return true;
  }

  return false;
});

/**
 * Detect form fields on the current page (placeholder)
 */
function detectFormFields(): DetectedFormField[] {
  const inputs = document.querySelectorAll(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]), textarea, select'
  );

  const fields: DetectedFormField[] = [];

  inputs.forEach((el) => {
    const input = el as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    const label = getFieldLabel(input);
    const name = input.name || input.id || '';

    if (label || name) {
      fields.push({
        element: input.tagName.toLowerCase(),
        fieldType: guessFieldType(label, name, input),
        confidence: 0.5,
        selector: generateSelector(input),
      });
    }
  });

  return fields;
}

/**
 * Get the label text for a form field
 */
function getFieldLabel(el: HTMLElement): string {
  // Check for associated label
  const id = el.id;
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.textContent?.trim() ?? '';
  }

  // Check parent label
  const parentLabel = el.closest('label');
  if (parentLabel) return parentLabel.textContent?.trim() ?? '';

  // Check placeholder
  if ('placeholder' in el) {
    const placeholder = (el as HTMLInputElement).placeholder;
    if (placeholder) return placeholder;
  }

  // Check aria-label
  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  return '';
}

/**
 * Guess field type from label/name (basic — enhanced in Milestone 3)
 */
function guessFieldType(
  label: string,
  name: string,
  _el: HTMLElement
): string {
  const text = `${label} ${name}`.toLowerCase();

  if (text.includes('email')) return 'email';
  if (text.includes('phone') || text.includes('mobile')) return 'phone';
  if (text.includes('first') && text.includes('name')) return 'firstName';
  if (text.includes('last') && text.includes('name')) return 'lastName';
  if (text.includes('name')) return 'fullName';
  if (text.includes('linkedin')) return 'linkedin';
  if (text.includes('github')) return 'github';
  if (text.includes('portfolio') || text.includes('website')) return 'portfolio';
  if (text.includes('university') || text.includes('school')) return 'university';
  if (text.includes('degree') || text.includes('major')) return 'degree';
  if (text.includes('gpa') || text.includes('cgpa')) return 'cgpa';
  if (text.includes('graduat')) return 'graduationYear';

  return 'unknown';
}

/**
 * Generate a CSS selector for an element
 */
function generateSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  if (el.getAttribute('name')) return `[name="${el.getAttribute('name')}"]`;

  // Build path from parent
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
 * Handle autofill request (placeholder — full implementation in Milestone 3)
 */
async function handleAutofill(
  _profileId: string
): Promise<{ filled: number; total: number }> {
  const fields = detectFormFields();
  console.log('[InternFill] Detected fields:', fields);

  // Placeholder: will be implemented in Milestone 3
  return { filled: 0, total: fields.length };
}

console.log('[InternFill] Content script loaded');
