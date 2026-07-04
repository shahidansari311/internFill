/**
 * CSV export utility for application tracker data.
 */

export interface CSVColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

/**
 * Escape a CSV field value (wrap in quotes if contains comma, newline, or quote)
 */
function escapeCSVField(value: string): string {
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV string from data array and column definitions
 */
export function generateCSV<T>(data: T[], columns: CSVColumn<T>[]): string {
  const header = columns.map((col) => escapeCSVField(col.header)).join(',');

  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = col.accessor(row);
        const strValue = value == null ? '' : String(value);
        return escapeCSVField(strValue);
      })
      .join(',')
  );

  return [header, ...rows].join('\n');
}

/**
 * Download a CSV string as a file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
