import { describe, expect, it } from 'vitest';
import type { SubjectDetailType } from '../../../shared/api/lab.api';
import { createSubjectIndividualRows } from '../subjectTableRows';

describe('createSubjectIndividualRows', () => {
  it('keeps every individualSet record as an ordered vertical row', () => {
    const subject = {
      individualSet: [
        { orcabusId: 'ind-1', individualId: 'SBJ000001', source: 'blood' },
        { orcabusId: 'ind-2', individualId: 'SBJ000002', source: 'tissue' },
      ],
    } as SubjectDetailType;

    expect(createSubjectIndividualRows(subject)).toEqual([
      { individualId: 'SBJ000001', source: 'blood' },
      { individualId: 'SBJ000002', source: 'tissue' },
    ]);
  });

  it('falls back to a dash for missing individual values', () => {
    const subject = {
      individualSet: [{ orcabusId: 'ind-1', individualId: 'SBJ000001', source: null }],
    } as unknown as SubjectDetailType;

    expect(createSubjectIndividualRows(subject)).toEqual([
      { individualId: 'SBJ000001', source: '-' },
    ]);
  });
});
