import { describe, expect, it } from 'vitest';
import {
  createIndividualFilterValues,
  createIndividualListQueryParams,
} from '../useIndividualQueryParams';

describe('createIndividualFilterValues', () => {
  it('normalizes repeated individual filter query params into comma-separated display values', () => {
    const filterValues = createIndividualFilterValues({
      orcabusId: ['orcabus-1', 'orcabus-2'],
      individualId: ['SBJ000001', 'SBJ000002'],
    });

    expect(filterValues).toEqual({
      orcabusId: 'orcabus-1,orcabus-2',
      individualId: 'SBJ000001,SBJ000002',
    });
  });
});

describe('createIndividualListQueryParams', () => {
  it('passes comma-separated individual filters to the API as multi-value query params', () => {
    const queryParams = createIndividualListQueryParams({
      filterValues: {
        orcabusId: 'orcabus-1, orcabus-2',
        individualId: 'SBJ000001,SBJ000002',
      },
      search: 'SBJ000001',
      pagination: { page: 2, rowsPerPage: 25 },
      orderBy: '-individual_id',
    });

    expect(queryParams).toEqual({
      page: 2,
      rowsPerPage: 25,
      search: 'SBJ000001',
      ordering: '-individual_id',
      orcabusId: ['orcabus-1', 'orcabus-2'],
      individualId: ['SBJ000001', 'SBJ000002'],
    });
  });
});
