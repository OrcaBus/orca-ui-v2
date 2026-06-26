import { describe, expect, it } from 'vitest';
import { createSampleFilterValues, createSampleListQueryParams } from '../useSampleQueryParams';

describe('createSampleFilterValues', () => {
  it('normalizes repeated sample filter query params into comma-separated display values', () => {
    const filterValues = createSampleFilterValues({
      orcabusId: ['orcabus-1', 'orcabus-2'],
      sampleId: 'PRJ000001',
      individualId: ['SBJ000001', 'SBJ000002'],
      libraryId: 'L000001,L000002',
    });

    expect(filterValues).toEqual({
      orcabusId: 'orcabus-1,orcabus-2',
      sampleId: 'PRJ000001',
      individualId: 'SBJ000001,SBJ000002',
      libraryId: 'L000001,L000002',
    });
  });
});

describe('createSampleListQueryParams', () => {
  it('passes comma-separated sample filters to the API as multi-value query params', () => {
    const queryParams = createSampleListQueryParams({
      filterValues: {
        orcabusId: 'orcabus-1, orcabus-2',
        sampleId: 'PRJ000001,PRJ000002',
        individualId: 'SBJ000001,SBJ000002',
        libraryId: 'L000001,L000002',
      },
      search: 'PRJ000001',
      pagination: { page: 3, rowsPerPage: 25 },
      orderBy: '-sample_id',
    });

    expect(queryParams).toEqual({
      page: 3,
      rowsPerPage: 25,
      search: 'PRJ000001',
      ordering: '-sample_id',
      orcabusId: ['orcabus-1', 'orcabus-2'],
      sampleId: ['PRJ000001', 'PRJ000002'],
      individualId: ['SBJ000001', 'SBJ000002'],
      libraryId: ['L000001', 'L000002'],
    });
  });
});
