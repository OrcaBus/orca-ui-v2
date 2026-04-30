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

// ---------------------------------------------------------------------------
// Sample sheet JSON → CSV conversion
// Mirrors the logic from the reference orca-ui samplesheetUtils.ts
// ---------------------------------------------------------------------------

type SampleSheetJsonValue = string | number | boolean | null | undefined;
type SampleSheetJsonSection = Record<string, SampleSheetJsonValue>;

export interface SampleSheetJsonModel {
  [key: string]: SampleSheetJsonSection | SampleSheetJsonSection[] | undefined;
}

/** Convert a camelCase key to an IEM-style section heading, e.g. "bclconvertData" → "BCLConvert_Data" */
function formatSectionHeading(key: string): string {
  return key
    .replace(/([A-Z])/g, '_$1')
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('_')
    .replace(/^_/, '');
}

/**
 * Convert a parsed sample sheet JSON object to IEM CSV format.
 * Accepts `unknown` input so callers with `sampleSheetContent: unknown` don't need unsafe casts.
 * Non-data sections (header, reads, settings) render as key,value rows.
 * Data sections (arrays) render as column header + data rows.
 */
export function jsonToCsv(input: unknown): string {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return '';
  const json = input as SampleSheetJsonModel;
  const sections: string[] = [];

  // Settings / scalar sections first (not ending in "Data")
  for (const [key, value] of Object.entries(json)) {
    if (!key.endsWith('Data') && value && typeof value === 'object' && !Array.isArray(value)) {
      const heading = formatSectionHeading(key);
      const rows = Object.entries(value)
        .map(([k, v]) => `${k},${v ?? ''}`)
        .join('\n');
      sections.push(`[${heading}]\n${rows}\n`);
    }
  }

  // Data array sections
  for (const [key, value] of Object.entries(json)) {
    if (key.endsWith('Data') && Array.isArray(value) && value.length > 0) {
      const heading = formatSectionHeading(key);
      const cols = Object.keys(value[0]);
      const header = cols.join(',');
      const rows = value
        .map((row: SampleSheetJsonSection) => cols.map((c) => row[c] ?? '').join(','))
        .join('\n');
      sections.push(`[${heading}]\n${header}\n${rows}\n`);
    }
  }

  return sections.join('\n');
}
