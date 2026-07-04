import type { Profile } from '@/features/profile/types';
import { detectFields, getFieldLabel } from './detector';
import { setElementValue } from './events';

/**
 * Get the value from the profile for a given field type.
 */
export async function getFieldValue(profile: Profile, fieldType: string, element?: HTMLElement): Promise<string> {
  const pi = profile.personalInfo || {};
  const sl = profile.socialLinks || {};
  const edu = profile.education?.[0] || null;

  switch (fieldType) {
    case 'firstName':
      return pi.firstName || '';
    case 'lastName':
      return pi.lastName || '';
    case 'fullName':
      return pi.firstName && pi.lastName ? `${pi.firstName} ${pi.lastName}` : pi.firstName || pi.lastName || '';
    case 'email':
      return pi.email || '';
    case 'phone':
      return pi.phone || '';
    case 'location':
      return pi.location || '';
    case 'summary':
      return pi.summary || '';
    case 'linkedin':
      return sl.linkedin || '';
    case 'github':
      return sl.github || '';
    case 'portfolio':
      return sl.portfolio || '';
    case 'twitter':
      return sl.twitter || '';
    case 'leetcode':
      return sl.leetcode || '';
    case 'university':
      return edu?.university || '';
    case 'degree':
      return edu?.degree || '';
    case 'fieldOfStudy':
      return edu?.fieldOfStudy || '';
    case 'cgpa':
      return edu?.cgpa || '';
    case 'graduationYear':
      if (edu?.endDate) {
        // Extract 4-digit year from end date if possible
        const match = edu.endDate.match(/\b(19|20)\d{2}\b/);
        return match ? match[0] : edu.endDate;
      }
      return '';
    case 'whyHire':
    case 'projectsDetail':
    case 'customQuestion':
      try {
        const questionText = element ? getFieldLabel(element) : '';
        const generated = await chrome.runtime.sendMessage({
          type: 'GENERATE_AI_ANSWER',
          profile,
          questionType: fieldType,
          questionText,
        });
        return typeof generated === 'string' ? generated : '';
      } catch (e) {
        console.error('Error generating AI answer:', e);
        return '';
      }
    default:
      return '';
  }
}

export async function fillForm(profile: Profile): Promise<{ filled: number; total: number }> {
  console.log('[InternFill] Starting form autofill. Profile:', profile);
  const fields = detectFields();
  console.log('[InternFill] Detected fields on page:', fields.map(f => ({
    type: f.fieldType,
    selector: f.selector,
    label: getFieldLabel(f.element),
  })));
  let filledCount = 0;

  for (const field of fields) {
    console.log(`[InternFill] Processing field: ${field.fieldType} (${field.selector})`);
    try {
      const value = await getFieldValue(profile, field.fieldType, field.element);
      console.log(`[InternFill] Extracted value for ${field.fieldType}:`, value ? (value.substring(0, 80) + '...') : '(empty)');
      if (value) {
        setElementValue(field.element, value);
        filledCount++;
      }
    } catch (err) {
      console.error(`[InternFill] Error filling field ${field.fieldType}:`, err);
    }
  }

  console.log(`[InternFill] Autofill complete. Successfully filled ${filledCount}/${fields.length} fields.`);
  return {
    filled: filledCount,
    total: fields.length,
  };
}
