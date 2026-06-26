import { describe, expect, it } from 'vitest';
import { createSubjectFilterValues, createSubjectListQueryParams } from '../useSubjectQueryParams';

describe('createSubjectFilterValues', () => {
  it('normalizes repeated subject filter query params into comma-separated display values', () => {
    const filterValues = createSubjectFilterValues({
      orcabusId: ['orcabus-1', 'orcabus-2'],
      subjectId: 'PRJ000001',
      individualId: ['SBJ000001', 'SBJ000002'],
      libraryId: 'L000001,L000002',
    });

    expect(filterValues).toEqual({
      orcabusId: 'orcabus-1,orcabus-2',
      subjectId: 'PRJ000001',
      individualId: 'SBJ000001,SBJ000002',
      libraryId: 'L000001,L000002',
    });
  });
});

describe('createSubjectListQueryParams', () => {
  it('passes comma-separated subject filters to the API as multi-value query params', () => {
    const queryParams = createSubjectListQueryParams({
      filterValues: {
        orcabusId: 'orcabus-1, orcabus-2',
        subjectId: 'PRJ000001,PRJ000002',
        individualId: 'SBJ000001,SBJ000002',
        libraryId: 'L000001,L000002',
      },
      search: 'PRJ000001',
      pagination: { page: 3, rowsPerPage: 25 },
      orderBy: '-subject_id',
    });

    expect(queryParams).toEqual({
      page: 3,
      rowsPerPage: 25,
      search: 'PRJ000001',
      ordering: '-subject_id',
      orcabusId: ['orcabus-1', 'orcabus-2'],
      subjectId: ['PRJ000001', 'PRJ000002'],
      individualId: ['SBJ000001', 'SBJ000002'],
      libraryId: ['L000001', 'L000002'],
    });
  });
});
