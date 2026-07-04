/**
 * Date formatting utilities.
 */

/**
 * Format a date to a human-readable string
 */
export function formatDate(
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return 'Invalid date';

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'relative':
      return getRelativeTime(d);
    default:
      return d.toLocaleDateString();
  }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHrs = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHrs / 24);
  const diffWeeks = Math.round(diffDays / 7);
  const diffMonths = Math.round(diffDays / 30);

  if (Math.abs(diffSec) < 60) return 'just now';
  if (Math.abs(diffMin) < 60)
    return `${Math.abs(diffMin)} min${Math.abs(diffMin) > 1 ? 's' : ''} ago`;
  if (Math.abs(diffHrs) < 24)
    return `${Math.abs(diffHrs)} hr${Math.abs(diffHrs) > 1 ? 's' : ''} ago`;
  if (Math.abs(diffDays) < 7)
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
  if (Math.abs(diffWeeks) < 5)
    return `${Math.abs(diffWeeks)} week${Math.abs(diffWeeks) > 1 ? 's' : ''} ago`;
  return `${Math.abs(diffMonths)} month${Math.abs(diffMonths) > 1 ? 's' : ''} ago`;
}

/**
 * Format a date for HTML date input (YYYY-MM-DD)
 */
export function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

/**
 * Get the current date as YYYY-MM-DD
 */
export function today(): string {
  return toDateInputValue(new Date());
}
