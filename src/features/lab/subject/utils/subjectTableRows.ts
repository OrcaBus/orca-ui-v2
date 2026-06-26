import type { SubjectDetailType } from '../../shared/api/lab.api';

const EMPTY_TABLE_VALUE = '-';

export interface SubjectIndividualRow {
  individualId: string;
  source: string;
}

export interface SubjectLibraryRow {
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

export function createSubjectIndividualRows(subject: SubjectDetailType): SubjectIndividualRow[] {
  return subject.individualSet.map((individual) => ({
    individualId: toDisplayValue(individual.individualId),
    source: toDisplayValue(individual.source),
  }));
}

export function createSubjectLibraryRows(subject: SubjectDetailType): SubjectLibraryRow[] {
  return subject.librarySet.map((library) => ({
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

export function joinSubjectTableValues(values: string[]): string {
  return values.filter((value) => value !== EMPTY_TABLE_VALUE).join(', ');
}
