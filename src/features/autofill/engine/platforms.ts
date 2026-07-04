/**
 * Platform-specific handlers for common job portals (Greenhouse, Lever, Workday, Google Forms).
 * Enhances the default keyword mapping with platform-specific adjustments.
 */

import type { Profile } from '@/features/profile/types';
import { setElementValue } from './events';

/**
 * Check if current page is on a specific platform and run platform-specific autofill enhancements.
 */
export function handlePlatformSpecificAutofill(profile: Profile): boolean {
  const hostname = window.location.hostname.toLowerCase();

  if (hostname.includes('greenhouse.io')) {
    return fillGreenhouse(profile);
  }
  if (hostname.includes('lever.co')) {
    return fillLever(profile);
  }
  if (hostname.includes('myworkdayjobs.com') || hostname.includes('workday.com')) {
    return fillWorkday(profile);
  }
  if (hostname.includes('docs.google.com') && window.location.pathname.includes('/forms')) {
    return fillGoogleForms(profile);
  }

  return false; // Fall back to generic autofill
}

/**
 * Greenhouse specific adjustments.
 * Greenhouse forms are generally standard HTML forms, but have some nested structures.
 */
function fillGreenhouse(_profile: Profile): boolean {
  console.log('[InternFill] Detected Greenhouse portal. Applying portal adjustments.');
  // Default keywords cover Greenhouse well, but we can do extra checks if needed.
  return false; // Let generic handle the rest
}

/**
 * Lever specific adjustments.
 * Lever forms are standard but often contain custom questions.
 */
function fillLever(_profile: Profile): boolean {
  console.log('[InternFill] Detected Lever portal. Applying portal adjustments.');
  return false;
}

/**
 * Workday specific adjustments.
 * Workday uses custom select fields and auto-suggest inputs that load options via API.
 */
function fillWorkday(profile: Profile): boolean {
  console.log('[InternFill] Detected Workday portal. Applying portal adjustments.');

  // Workday custom selects / input dropdowns
  const suggestions = document.querySelectorAll('[data-automation-id="searchSuggestions"]');
  if (suggestions.length > 0) {
    const container = suggestions[0];
    if (container) {
      const firstOption = container.querySelector('li, [role="option"]');
      if (firstOption) {
        (firstOption as HTMLElement).click();
      }
    }
  }

  // Workday specific yes/no checkboxes or dropdowns can be targeted here
  const workdaySelects = document.querySelectorAll('select[data-automation-id^="dropdown"]');
  workdaySelects.forEach((select) => {
    const label = select.getAttribute('aria-label') || '';
    if (label.toLowerCase().includes('hear about') && profile.socialLinks.other) {
      setElementValue(select as HTMLSelectElement, 'Social Media');
    }
  });

  return false;
}

/**
 * Google Forms specific adjustments.
 * Google Forms does not use native inputs for radio buttons, checkboxes, or dropdowns.
 */
function fillGoogleForms(profile: Profile): boolean {
  console.log('[InternFill] Detected Google Forms. Applying portal adjustments.');

  const pi = profile.personalInfo || {};
  const edu = profile.education?.[0] || null;

  // Google Forms uses role="listbox", role="radio", and standard inputs
  const inputs = document.querySelectorAll('input[type="text"], textarea');
  inputs.forEach((el) => {
    const input = el as HTMLInputElement | HTMLTextAreaElement;
    const parentContainer = input.closest('[role="listitem"]');
    const labelText = parentContainer?.querySelector('[role="heading"], label')?.textContent || '';
    const text = labelText.toLowerCase();

    if (text.includes('email')) {
      setElementValue(input, pi.email);
    } else if (text.includes('first name')) {
      setElementValue(input, pi.firstName);
    } else if (text.includes('last name')) {
      setElementValue(input, pi.lastName);
    } else if (text.includes('name')) {
      setElementValue(input, `${pi.firstName} ${pi.lastName}`);
    } else if (text.includes('phone') || text.includes('mobile')) {
      setElementValue(input, pi.phone);
    } else if (text.includes('university') || text.includes('college')) {
      setElementValue(input, edu?.university || '');
    } else if (text.includes('degree')) {
      setElementValue(input, edu?.degree || '');
    } else if (text.includes('gpa') || text.includes('cgpa')) {
      setElementValue(input, edu?.cgpa || '');
    }
  });

  return true;
}
