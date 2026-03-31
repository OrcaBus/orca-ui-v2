import type { Column } from '@/components/tables/DataTable';

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function resolveValue<T>(item: T, col: Column<T>): string {
  if (col.csvValue) {
    const v = col.csvValue(item);
    if (v === null || v === undefined) return '';
    return String(v);
  }
  const raw = (item as Record<string, unknown>)[col.key];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'object') return JSON.stringify(raw);
  if (typeof raw === 'string') return raw;
  return JSON.stringify(raw);
}

/**
 * Generate a CSV string from data rows using the provided column definitions.
 * Columns with a `csvValue` accessor use that; otherwise raw `item[key]` is used.
 */
export function buildCsvString<T>(rows: T[], visibleColumns: Column<T>[]): string {
  const headerRow = visibleColumns.map((c) => escapeCsvField(c.header)).join(',');
  const dataRows = rows.map((row) =>
    visibleColumns.map((col) => escapeCsvField(resolveValue(row, col))).join(',')
  );
  return [headerRow, ...dataRows].join('\r\n');
}

/**
 * Trigger a browser download for a CSV string.
 */
export function downloadCsvFile(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Build a filename with an ISO-ish timestamp, e.g. `libraries_2026-03-31_143025.csv` */
export function buildTimestampedFilename(prefix: string, extension = 'csv'): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
    '_',
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('');
  return `${prefix}_${stamp}.${extension}`;
}

/**
 * One-shot helper: build CSV from rows + columns and download it.
 * When no filename is given, generates a timestamped name from `filenamePrefix`.
 */
export function downloadTableAsCsv<T>(
  rows: T[],
  visibleColumns: Column<T>[],
  filenameOrPrefix = 'export'
): void {
  const filename = filenameOrPrefix.endsWith('.csv')
    ? filenameOrPrefix
    : buildTimestampedFilename(filenameOrPrefix);
  const csv = buildCsvString(rows, visibleColumns);
  downloadCsvFile(csv, filename);
}
