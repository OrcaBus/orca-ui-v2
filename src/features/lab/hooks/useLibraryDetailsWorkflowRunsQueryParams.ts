import { useMemo, useCallback } from 'react';
import { useQueryParams, type SortDirection } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

const PARAM_WORKFLOW_TYPE = 'workflowType';
const PARAM_PORTAL_RUN_ID = 'portalRunId';

const PARAM_RUN_PAGE = 'libWfPage';
const PARAM_RUN_ROWS_PER_PAGE = 'libWfRowsPerPage';
const PARAM_RUN_SEARCH = 'libWfSearch';
const PARAM_RUN_ORDER_BY = 'libWfOrdering';

const PARAM_FILE_PAGE = 'libWfFilePage';
const PARAM_FILE_ROWS_PER_PAGE = 'libWfFileRowsPerPage';
const PARAM_FILE_SEARCH = 'libWfFileSearch';
const PARAM_FILE_ORDER_BY = 'libWfFileOrdering';

const WORKFLOW_RUN_TABLE_PARAM_KEYS = [
  PARAM_RUN_PAGE,
  PARAM_RUN_ROWS_PER_PAGE,
  PARAM_RUN_SEARCH,
  PARAM_RUN_ORDER_BY,
] as const;

const WORKFLOW_RUN_FILE_TABLE_PARAM_KEYS = [
  PARAM_FILE_PAGE,
  PARAM_FILE_ROWS_PER_PAGE,
  PARAM_FILE_SEARCH,
  PARAM_FILE_ORDER_BY,
] as const;

type PaginationState = {
  page: number;
  rowsPerPage: number;
};

type LibraryDetailsWorkflowRunQueryParamsArgs = {
  libraryOrcabusId?: string;
  workflowOrcabusIds?: string[];
  search: string;
  pagination: PaginationState;
  orderBy: string;
};

type LibraryDetailsWorkflowRunFileQueryParamsArgs = {
  portalRunId?: string;
  search: string;
  pagination: PaginationState;
  orderBy: string;
};

export type LibraryDetailsWorkflowRunsApiQueryParams = Record<
  string,
  string | string[] | number | boolean | undefined
>;

export type LibraryDetailsWorkflowRunsQueryParamsState = {
  workflowTypeName: string;
  portalRunId: string;
  setWorkflowTypeName: (nextWorkflowTypeName: string | null | undefined) => void;
  clearWorkflowType: () => void;
  setPortalRunId: (nextPortalRunId: string) => void;
  clearPortalRunId: () => void;
  workflowRunSearch: string;
  workflowRunPagination: PaginationState;
  workflowRunOrderBy: string;
  setWorkflowRunPage: (page: number) => void;
  setWorkflowRunRowsPerPage: (rowsPerPage: number) => void;
  setWorkflowRunSearchQuery: (value: string) => void;
  setWorkflowRunOrderBy: (field: string, nextDirection: 'asc' | 'desc') => void;
  getWorkflowRunOrderDirection: (field: string) => SortDirection | undefined;
  clearWorkflowRunTableParams: () => void;
  workflowRunListQueryParams: LibraryDetailsWorkflowRunsApiQueryParams;
  workflowRunFileSearch: string;
  workflowRunFilePagination: PaginationState;
  workflowRunFileOrderBy: string;
  setWorkflowRunFilePage: (page: number) => void;
  setWorkflowRunFileRowsPerPage: (rowsPerPage: number) => void;
  setWorkflowRunFileSearchQuery: (value: string) => void;
  setWorkflowRunFileOrderBy: (field: string, nextDirection: 'asc' | 'desc') => void;
  getWorkflowRunFileOrderDirection: (field: string) => SortDirection | undefined;
  clearWorkflowRunFileTableParams: () => void;
  workflowRunFileListQueryParams: LibraryDetailsWorkflowRunsApiQueryParams;
};

function normalizeSearch(search: string): string | undefined {
  const trimmed = search.trim();
  return trimmed || undefined;
}

function getNextSortOrder(field: string, nextDirection: 'asc' | 'desc'): string {
  return nextDirection === 'desc' ? `-${field}` : field;
}

function getOrderDirection(orderBy: string, field: string): SortDirection | undefined {
  if (!orderBy) return undefined;
  const normalized = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
  if (normalized !== field) return undefined;
  return orderBy.startsWith('-') ? 'desc' : 'asc';
}

export function createLibraryDetailsWorkflowRunQueryParams({
  libraryOrcabusId,
  workflowOrcabusIds = [],
  search,
  pagination,
  orderBy,
}: LibraryDetailsWorkflowRunQueryParamsArgs): LibraryDetailsWorkflowRunsApiQueryParams {
  return {
    page: pagination.page || 1,
    rows_per_page: pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
    ordering: orderBy || '-timestamp',
    libraries__orcabusId: libraryOrcabusId || undefined,
    workflow__orcabus_id: workflowOrcabusIds.length ? workflowOrcabusIds : undefined,
    search: normalizeSearch(search),
  };
}

export function createLibraryDetailsWorkflowRunFileQueryParams({
  portalRunId,
  search,
  pagination,
  orderBy,
}: LibraryDetailsWorkflowRunFileQueryParamsArgs): LibraryDetailsWorkflowRunsApiQueryParams {
  return {
    page: pagination.page || 1,
    rowsPerPage: pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
    ordering: orderBy || '-timestamp',
    currentState: true,
    'attributes[portalRunId][]': portalRunId ? [portalRunId] : undefined,
    search: normalizeSearch(search),
  };
}

export function useLibraryDetailsWorkflowRunsQueryParams({
  libraryOrcabusId,
  workflowOrcabusIds,
}: {
  libraryOrcabusId?: string;
  workflowOrcabusIds?: string[];
} = {}): LibraryDetailsWorkflowRunsQueryParamsState {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const workflowTypeName = getParam(PARAM_WORKFLOW_TYPE) ?? '';
  const portalRunId = getParam(PARAM_PORTAL_RUN_ID) ?? '';

  const workflowRunPagination = useMemo(
    () => ({
      page: Number(getParam(PARAM_RUN_PAGE)) || 1,
      rowsPerPage: Number(getParam(PARAM_RUN_ROWS_PER_PAGE)) || DEFAULT_PAGE_SIZE,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getParam(PARAM_RUN_PAGE), getParam(PARAM_RUN_ROWS_PER_PAGE)]
  );

  const workflowRunSearch = getParam(PARAM_RUN_SEARCH) ?? '';
  const workflowRunOrderBy = getParam(PARAM_RUN_ORDER_BY) ?? '';

  const workflowRunFilePagination = useMemo(
    () => ({
      page: Number(getParam(PARAM_FILE_PAGE)) || 1,
      rowsPerPage: Number(getParam(PARAM_FILE_ROWS_PER_PAGE)) || DEFAULT_PAGE_SIZE,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getParam(PARAM_FILE_PAGE), getParam(PARAM_FILE_ROWS_PER_PAGE)]
  );

  const workflowRunFileSearch = getParam(PARAM_FILE_SEARCH) ?? '';
  const workflowRunFileOrderBy = getParam(PARAM_FILE_ORDER_BY) ?? '';

  const clearWorkflowRunTableParams = useCallback(() => {
    setParams(Object.fromEntries(WORKFLOW_RUN_TABLE_PARAM_KEYS.map((key) => [key, undefined])), {
      resetPagination: false,
      historyReplace: true,
    });
  }, [setParams]);

  const clearWorkflowRunFileTableParams = useCallback(() => {
    setParams(
      Object.fromEntries(WORKFLOW_RUN_FILE_TABLE_PARAM_KEYS.map((key) => [key, undefined])),
      {
        resetPagination: false,
        historyReplace: true,
      }
    );
  }, [setParams]);

  const setWorkflowTypeName = useCallback(
    (nextWorkflowTypeName: string | null | undefined) => {
      setParams(
        {
          [PARAM_WORKFLOW_TYPE]: nextWorkflowTypeName || undefined,
          [PARAM_PORTAL_RUN_ID]: undefined,
          ...Object.fromEntries(WORKFLOW_RUN_TABLE_PARAM_KEYS.map((key) => [key, undefined])),
          ...Object.fromEntries(WORKFLOW_RUN_FILE_TABLE_PARAM_KEYS.map((key) => [key, undefined])),
        },
        { resetPagination: false }
      );
    },
    [setParams]
  );

  const clearWorkflowType = useCallback(
    () => setWorkflowTypeName(undefined),
    [setWorkflowTypeName]
  );

  const setPortalRunId = useCallback(
    (nextPortalRunId: string) => {
      setParams(
        {
          [PARAM_PORTAL_RUN_ID]: nextPortalRunId || undefined,
          ...Object.fromEntries(WORKFLOW_RUN_FILE_TABLE_PARAM_KEYS.map((key) => [key, undefined])),
        },
        { resetPagination: false }
      );
    },
    [setParams]
  );

  const clearPortalRunId = useCallback(() => {
    setParams(
      {
        [PARAM_PORTAL_RUN_ID]: undefined,
        ...Object.fromEntries(WORKFLOW_RUN_FILE_TABLE_PARAM_KEYS.map((key) => [key, undefined])),
      },
      { resetPagination: false }
    );
  }, [setParams]);

  const setWorkflowRunPage = useCallback(
    (page: number) => setParams({ [PARAM_RUN_PAGE]: page }, { resetPagination: false }),
    [setParams]
  );

  const setWorkflowRunRowsPerPage = useCallback(
    (rowsPerPage: number) =>
      setParams(
        { [PARAM_RUN_ROWS_PER_PAGE]: rowsPerPage, [PARAM_RUN_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setWorkflowRunSearchQuery = useCallback(
    (value: string) =>
      setParams(
        { [PARAM_RUN_SEARCH]: value || undefined, [PARAM_RUN_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setWorkflowRunOrderBy = useCallback(
    (field: string, nextDirection: 'asc' | 'desc') =>
      setParams(
        { [PARAM_RUN_ORDER_BY]: getNextSortOrder(field, nextDirection), [PARAM_RUN_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const getWorkflowRunOrderDirection = useCallback(
    (field: string) => getOrderDirection(workflowRunOrderBy, field),
    [workflowRunOrderBy]
  );

  const setWorkflowRunFilePage = useCallback(
    (page: number) => setParams({ [PARAM_FILE_PAGE]: page }, { resetPagination: false }),
    [setParams]
  );

  const setWorkflowRunFileRowsPerPage = useCallback(
    (rowsPerPage: number) =>
      setParams(
        { [PARAM_FILE_ROWS_PER_PAGE]: rowsPerPage, [PARAM_FILE_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setWorkflowRunFileSearchQuery = useCallback(
    (value: string) =>
      setParams(
        { [PARAM_FILE_SEARCH]: value || undefined, [PARAM_FILE_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setWorkflowRunFileOrderBy = useCallback(
    (field: string, nextDirection: 'asc' | 'desc') =>
      setParams(
        { [PARAM_FILE_ORDER_BY]: getNextSortOrder(field, nextDirection), [PARAM_FILE_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const getWorkflowRunFileOrderDirection = useCallback(
    (field: string) => getOrderDirection(workflowRunFileOrderBy, field),
    [workflowRunFileOrderBy]
  );

  const workflowRunListQueryParams = useMemo(
    () =>
      createLibraryDetailsWorkflowRunQueryParams({
        libraryOrcabusId,
        workflowOrcabusIds,
        search: workflowRunSearch,
        pagination: workflowRunPagination,
        orderBy: workflowRunOrderBy,
      }),
    [
      libraryOrcabusId,
      workflowOrcabusIds,
      workflowRunSearch,
      workflowRunPagination,
      workflowRunOrderBy,
    ]
  );

  const workflowRunFileListQueryParams = useMemo(
    () =>
      createLibraryDetailsWorkflowRunFileQueryParams({
        portalRunId,
        search: workflowRunFileSearch,
        pagination: workflowRunFilePagination,
        orderBy: workflowRunFileOrderBy,
      }),
    [portalRunId, workflowRunFileSearch, workflowRunFilePagination, workflowRunFileOrderBy]
  );

  return {
    workflowTypeName,
    portalRunId,
    setWorkflowTypeName,
    clearWorkflowType,
    setPortalRunId,
    clearPortalRunId,
    workflowRunSearch,
    workflowRunPagination,
    workflowRunOrderBy,
    setWorkflowRunPage,
    setWorkflowRunRowsPerPage,
    setWorkflowRunSearchQuery,
    setWorkflowRunOrderBy,
    getWorkflowRunOrderDirection,
    clearWorkflowRunTableParams,
    workflowRunListQueryParams,
    workflowRunFileSearch,
    workflowRunFilePagination,
    workflowRunFileOrderBy,
    setWorkflowRunFilePage,
    setWorkflowRunFileRowsPerPage,
    setWorkflowRunFileSearchQuery,
    setWorkflowRunFileOrderBy,
    getWorkflowRunFileOrderDirection,
    clearWorkflowRunFileTableParams,
    workflowRunFileListQueryParams,
  };
}
