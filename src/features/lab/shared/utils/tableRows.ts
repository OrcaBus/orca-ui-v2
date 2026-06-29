import type { SubjectDetailType } from '../api/lab.api';

/** Placeholder shown when a metadata value is missing; dropped from CSV exports. */
export const EMPTY_TABLE_VALUE = '-';

/** Library record shared by the Subject and Sample detail payloads. */
type LabLibrary = SubjectDetailType['librarySet'][number];

/** Normalised library row rendered by the Subject and Sample tables. */
export interface LibraryTableRow {
  orcabusId: string;
  libraryId: string;
  phenotype: string;
  workflow: string;
  quality: string;
  type: string;
  assay: string;
  coverage: string;
  overrideCycles: string;
  requestFormId: string;
}

/**
 * Converts a raw metadata value into a trimmed display string, falling back to
 * {@link EMPTY_TABLE_VALUE} for nullish or blank values.
 */
export function toDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_TABLE_VALUE;

  const displayValue = String(value).trim();
  return displayValue || EMPTY_TABLE_VALUE;
}

/** Joins display values for CSV export, dropping empty placeholders. */
export function joinTableValues(values: string[]): string {
  return values.filter((value) => value !== EMPTY_TABLE_VALUE).join(', ');
}

/** Builds the stacked library rows shared by the Subject and Sample tables. */
export function createLibraryRows(librarySet: LabLibrary[]): LibraryTableRow[] {
  return librarySet.map((library) => ({
    orcabusId: library.orcabusId,
    libraryId: toDisplayValue(library.libraryId),
    phenotype: toDisplayValue(library.phenotype),
    workflow: toDisplayValue(library.workflow),
    quality: toDisplayValue(library.quality),
    type: toDisplayValue(library.type),
    assay: toDisplayValue(library.assay),
    coverage: toDisplayValue(library.coverage),
    overrideCycles: toDisplayValue(library.overrideCycles),
    requestFormId: toDisplayValue(library.requestFormId),
  }));
}
