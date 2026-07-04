/**
 * InternFill Content Script
 * Injected into web pages to detect and fill form fields.
 */

import { detectFields } from '@/features/autofill/engine/detector';
import { fillForm } from '@/features/autofill/engine/filler';
import { handlePlatformSpecificAutofill } from '@/features/autofill/engine/platforms';
import type { Profile } from '@/features/profile/types';

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
 * Detect form fields on the current page and return serializable summary
 */
function detectFormFields() {
  const fields = detectFields();
  return fields.map((f) => ({
    element: f.element.tagName.toLowerCase(),
    fieldType: f.fieldType,
    confidence: f.confidence,
    selector: f.selector,
  }));
}

/**
 * Handle autofill request by fetching profile and executing fill
 */
async function handleAutofill(
  profileId: string
): Promise<{ filled: number; total: number }> {
  console.log('[InternFill] Starting autofill for profile ID:', profileId);

  // Request decrypted profile data from background service worker
  const profile = (await chrome.runtime.sendMessage({
    type: 'GET_PROFILE_DATA',
    profileId,
  })) as Profile | null;

  if (!profile) {
    throw new Error('No profile data found for autofill.');
  }

  // 1. Try platform specific handlers
  handlePlatformSpecificAutofill(profile);

  // 2. Perform general keyword-mapped autofill
  const result = await fillForm(profile);

  console.log('[InternFill] Autofill completed:', result);
  return result;
}

console.log('[InternFill] Content script loaded');
