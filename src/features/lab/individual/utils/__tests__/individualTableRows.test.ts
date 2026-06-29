import { describe, expect, it } from 'vitest';
import type { IndividualDetailType } from '../../../shared/api/lab.api';
import { createIndividualSubjectRows } from '../individualTableRows';

describe('createIndividualSubjectRows', () => {
  it('keeps every subjectSet record as an ordered vertical row', () => {
    const individual = {
      subjectSet: [
        { orcabusId: 'subject-1', subjectId: 'CUPID-FMC-072' },
        { orcabusId: 'subject-2', subjectId: '10484837' },
      ],
    } as IndividualDetailType;

    expect(createIndividualSubjectRows(individual)).toEqual([
      { subjectId: 'CUPID-FMC-072' },
      { subjectId: '10484837' },
    ]);
  });

  it('uses table dashes for missing subject IDs', () => {
    const individual = {
      subjectSet: [
        { orcabusId: 'subject-1', subjectId: null },
        { orcabusId: 'subject-2', subjectId: '' },
      ],
    } as IndividualDetailType;

    expect(createIndividualSubjectRows(individual)).toEqual([
      { subjectId: '-' },
      { subjectId: '-' },
    ]);
  });
});
