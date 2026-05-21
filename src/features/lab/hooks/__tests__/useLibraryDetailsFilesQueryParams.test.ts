import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  createLibraryDetailsWorkflowRunFileQueryParams,
  createLibraryDetailsWorkflowRunQueryParams,
  useLibraryDetailsWorkflowRunsQueryParams,
  type LibraryDetailsWorkflowRunsQueryParamsState,
} from '../useLibraryDetailsWorkflowRunsQueryParams';

describe('createLibraryDetailsWorkflowRunQueryParams', () => {
  it('uses default pagination and omits empty search', () => {
    const params = createLibraryDetailsWorkflowRunQueryParams({
      libraryOrcabusId: 'lib.123',
      workflowOrcabusIds: [],
      search: '',
      pagination: { page: 0, rowsPerPage: 0 },
      orderBy: '',
    });

    expect(params).toMatchObject({
      page: 1,
      rows_per_page: 10,
      libraries__orcabusId: 'lib.123',
    });
    expect(params.workflow__orcabus_id).toBeUndefined();
    expect(params.search).toBeUndefined();
  });

  it('includes library id, grouped workflow ids, and search', () => {
    const params = createLibraryDetailsWorkflowRunQueryParams({
      libraryOrcabusId: 'lib.123',
      workflowOrcabusIds: ['wf.1', 'wf.2'],
      search: 'portal-run',
      pagination: { page: 2, rowsPerPage: 20 },
      orderBy: '',
    });

    expect(params).toEqual({
      page: 2,
      rows_per_page: 20,
      ordering: '-timestamp',
      libraries__orcabusId: 'lib.123',
      workflow__orcabus_id: ['wf.1', 'wf.2'],
      search: 'portal-run',
    });
  });
});

describe('createLibraryDetailsWorkflowRunFileQueryParams', () => {
  it('uses current state and portal run id for file lookup', () => {
    const params = createLibraryDetailsWorkflowRunFileQueryParams({
      portalRunId: '20260514abcd', //pragma: allowlist secrets
      search: '',
      pagination: { page: 1, rowsPerPage: 50 },
      orderBy: '',
    });

    expect(params).toEqual({
      page: 1,
      rowsPerPage: 50,
      ordering: '-timestamp',
      currentState: true,
      'attributes[portalRunId][]': ['20260514abcd'], //pragma: allowlist secrets
    });
  });

  it('includes search when provided', () => {
    const params = createLibraryDetailsWorkflowRunFileQueryParams({
      portalRunId: '20260514abcd', //pragma: allowlist secrets
      search: 'dragen',
      pagination: { page: 3, rowsPerPage: 25 },
      orderBy: '',
    });

    expect(params.search).toBe('dragen');
  });
});

describe('useLibraryDetailsWorkflowRunsQueryParams types', () => {
  it('exposes typed search and selection callbacks for the workflow runs tab', () => {
    type HookState = ReturnType<typeof useLibraryDetailsWorkflowRunsQueryParams>;

    expectTypeOf<HookState>().toEqualTypeOf<LibraryDetailsWorkflowRunsQueryParamsState>();
    expectTypeOf<HookState['workflowRunSearch']>().toEqualTypeOf<string>();
    expectTypeOf<HookState['workflowRunFileSearch']>().toEqualTypeOf<string>();
    expectTypeOf<HookState['setWorkflowRunSearchQuery']>().toEqualTypeOf<(value: string) => void>();
    expectTypeOf<HookState['setWorkflowRunFileSearchQuery']>().toEqualTypeOf<
      (value: string) => void
    >();
    expectTypeOf<HookState['setWorkflowTypeName']>().toEqualTypeOf<
      (nextWorkflowTypeName: string | null | undefined) => void
    >();
    expectTypeOf<HookState['clearWorkflowType']>().toEqualTypeOf<() => void>();
    expectTypeOf<HookState['clearPortalRunId']>().toEqualTypeOf<() => void>();
  });
});
