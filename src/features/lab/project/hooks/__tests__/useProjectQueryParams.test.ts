import { describe, expect, it } from 'vitest';
import { createProjectFilterValues, createProjectListQueryParams } from '../useProjectQueryParams';

describe('createProjectFilterValues', () => {
  it('normalizes repeated project filter query params into comma-separated display values', () => {
    const filterValues = createProjectFilterValues({
      orcabusId: ['orcabus-1', 'orcabus-2'],
      projectId: 'ASPi2L',
      name: ['Project A', 'Project B'],
    });

    expect(filterValues).toEqual({
      orcabusId: 'orcabus-1,orcabus-2',
      projectId: 'ASPi2L',
      name: 'Project A,Project B',
    });
  });
});

describe('createProjectListQueryParams', () => {
  it('passes comma-separated project filters to the API as multi-value query params', () => {
    const queryParams = createProjectListQueryParams({
      filterValues: {
        orcabusId: 'orcabus-1, orcabus-2',
        projectId: 'ASPi2L,BRCAm',
        name: 'Project A,Project B',
      },
      search: 'ASPi2L',
      pagination: { page: 3, rowsPerPage: 25 },
      orderBy: '-project_id',
    });

    expect(queryParams).toEqual({
      page: 3,
      rowsPerPage: 25,
      search: 'ASPi2L',
      ordering: '-project_id',
      orcabusId: ['orcabus-1', 'orcabus-2'],
      projectId: ['ASPi2L', 'BRCAm'],
      name: ['Project A', 'Project B'],
    });
  });
});
