import type { IndividualDetailType } from '../../shared/api/lab.api';
import { toDisplayValue } from '../../shared/utils';

export interface IndividualSubjectRow {
  subjectId: string;
}

export function createIndividualSubjectRows(
  individual: IndividualDetailType
): IndividualSubjectRow[] {
  return individual.subjectSet.map((subject) => ({
    subjectId: toDisplayValue(subject.subjectId),
  }));
}
