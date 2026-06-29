import type { SubjectDetailType } from '../../shared/api/lab.api';
import { toDisplayValue } from '../../shared/utils';

export interface SubjectIndividualRow {
  individualId: string;
  source: string;
}

export function createSubjectIndividualRows(subject: SubjectDetailType): SubjectIndividualRow[] {
  return subject.individualSet.map((individual) => ({
    individualId: toDisplayValue(individual.individualId),
    source: toDisplayValue(individual.source),
  }));
}
