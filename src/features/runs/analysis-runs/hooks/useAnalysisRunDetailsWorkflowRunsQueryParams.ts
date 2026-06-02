import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { toSearchApiQueryValue, toSearchDisplayValue } from '@/utils/queryParams';
import type { SortDirection } from '@/hooks/useQueryParams';
import type { WorkflowRunListParamsModel } from '../../api/workflows.api';
import { WorkflowRunStatus } from '@/features/runs/workflow-runs/hooks/useWorkflowRunListQueryParams';

// Workflow run status type
export type AnalysisRunWorkflowRunStatus = WorkflowRunStatus;

// Prefixed params to avoid collisions with other tables on the same details page
// (e.g. run-context table, readsets table).
const WFR_PARAM_PAGE = 'wfrPage';
const WFR_PARAM_ROWS_PER_PAGE = 'wfrRowsPerPage';
const WFR_PARAM_SEARCH = 'wfrSearch';
const WFR_PARAM_ORDER_BY = 'wfrOrdering';

const WFR_PAGINATION_KEYS = [WFR_PARAM_PAGE, WFR_PARAM_ROWS_PER_PAGE];

/**
 * Analysis run details page — workflow runs table state driven by URL query params.
 * Uses `wfr`-prefixed params to avoid conflicts with other tables on the same page.
 * Params: wfrPage, wfrRowsPerPage, wfrSearch, wfrOrdering.
 */
export function useAnalysisRunDetailsWorkflowRunsQueryParams(analysisRunOrcabusId: string) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const pageParam = getParam(WFR_PARAM_PAGE);
  const rowsPerPageParam = getParam(WFR_PARAM_ROWS_PER_PAGE);
  const searchParam = getParam(WFR_PARAM_SEARCH);
  const orderBy = getParam(WFR_PARAM_ORDER_BY) ?? '';

  // ---- Derived state ----

  const pagination = useMemo(
    () => ({
      page: Number(pageParam) || 1,
      rowsPerPage: Number(rowsPerPageParam) || DEFAULT_PAGE_SIZE,
    }),
    [pageParam, rowsPerPageParam]
  );

  const search = toSearchDisplayValue(searchParam);

  // ---- Setters ----

  const setPage = useCallback(
    (page: number) => setParams({ [WFR_PARAM_PAGE]: page }, { resetPagination: false }),
    [setParams]
  );

  const setRowsPerPage = useCallback(
    (rowsPerPage: number) =>
      setParams(
        { [WFR_PARAM_ROWS_PER_PAGE]: rowsPerPage, [WFR_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setSearchQuery = useCallback(
    (value: string) =>
      setParams(
        { [WFR_PARAM_SEARCH]: value || undefined, [WFR_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setOrderBy = useCallback(
    (value: string) =>
      setParams(
        { [WFR_PARAM_ORDER_BY]: value || undefined, [WFR_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const getOrderDirection = useCallback(
    (field: string): SortDirection | undefined => {
      const current = getParam(WFR_PARAM_ORDER_BY) ?? '';
      if (!current) return undefined;
      const normalized = current.startsWith('-') ? current.slice(1) : current;
      if (normalized !== field) return undefined;
      return current.startsWith('-') ? 'desc' : 'asc';
    },
    [getParam]
  );

  const clearAllParams = useCallback(() => {
    setParams({
      [WFR_PARAM_SEARCH]: undefined,
      [WFR_PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(WFR_PAGINATION_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  // ---- API query params ----

  const workflowRunsQueryParams = useMemo<WorkflowRunListParamsModel>(
    () =>
      ({
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
        search: toSearchApiQueryValue(search),
        ordering: orderBy || undefined,
        analysisRun__orcabusId: analysisRunOrcabusId,
      }) as WorkflowRunListParamsModel,
    [pagination.page, pagination.rowsPerPage, search, orderBy, analysisRunOrcabusId]
  );

  return {
    search,
    orderBy,
    pagination,
    setPage,
    setRowsPerPage,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    clearAllParams,
    workflowRunsQueryParams,
  };
}
