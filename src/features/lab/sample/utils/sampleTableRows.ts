import type { SampleDetailType } from '../../shared/api/lab.api';

const EMPTY_TABLE_VALUE = '-';

export interface SampleLibraryRow {
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

function toDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_TABLE_VALUE;

  const displayValue = String(value).trim();
  return displayValue || EMPTY_TABLE_VALUE;
}

export function createSampleLibraryRows(sample: SampleDetailType): SampleLibraryRow[] {
  return sample.librarySet.map((library) => ({
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

export function joinSampleTableValues(values: string[]): string {
  return values.filter((value) => value !== EMPTY_TABLE_VALUE).join(', ');
}
