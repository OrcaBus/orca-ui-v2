import type { IndividualDetailType } from '../../shared/api/lab.api';

const EMPTY_TABLE_VALUE = '-';

export interface IndividualSubjectRow {
  subjectId: string;
}

function toDisplayValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return EMPTY_TABLE_VALUE;

  const displayValue = String(value).trim();
  return displayValue || EMPTY_TABLE_VALUE;
}

export function createIndividualSubjectRows(
  individual: IndividualDetailType
): IndividualSubjectRow[] {
  return individual.subjectSet.map((subject) => ({
    subjectId: toDisplayValue(subject.subjectId),
  }));
}

export function joinIndividualTableValues(values: string[]): string {
  return values.filter((value) => value !== EMPTY_TABLE_VALUE).join(', ');
}
