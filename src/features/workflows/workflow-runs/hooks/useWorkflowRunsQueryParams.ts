import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import { toUtcStartOfDayQueryParam } from '@/utils/timeFormat';

export type WorkflowRunStatus =
  | 'draft'
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing';

const PARAM_STATUS = 'wfStatus';
const PARAM_TYPE = 'wfType';
const PARAM_FROM = 'wfFrom';
const PARAM_TO = 'wfTo';

export const WORKFLOW_RUNS_FILTER_KEYS = [PARAM_STATUS, PARAM_TYPE, PARAM_FROM, PARAM_TO] as const;

export type WorkflowRunsFilterKey = (typeof WORKFLOW_RUNS_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<WorkflowRunsFilterKey, string> = {
  [PARAM_STATUS]: '',
  [PARAM_TYPE]: '',
  [PARAM_FROM]: '',
  [PARAM_TO]: '',
};

export type WorkflowRunsFilterPatch = Partial<{
  wfStatus: string | string[];
  wfType: string | string[];
  wfFrom: string | string[];
  wfTo: string | string[];
}>;

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

function splitTypes(wfType: string): string[] {
  return wfType
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Workflow runs list page state driven by URL query params.
 * Filter params: wfStatus, wfType, wfFrom, wfTo. Shared: search, orderBy, pagination.
 */
export function useWorkflowRunsQueryParams() {
  const {
    params,
    getArrayParam,
    setParams,
    pagination,
    search,
    orderBy,
    setPage,
    setRowsPerPage,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
  } = useQueryParams();

  const filterValues = useMemo(() => {
    const typeParts = getArrayParam(PARAM_TYPE);
    return {
      ...DEFAULT_FILTER_VALUES,
      [PARAM_STATUS]: toFirstString(params[PARAM_STATUS] as string | string[] | undefined),
      [PARAM_TYPE]: typeParts.join(','),
      [PARAM_FROM]: toFirstString(params[PARAM_FROM] as string | string[] | undefined),
      [PARAM_TO]: toFirstString(params[PARAM_TO] as string | string[] | undefined),
    };
  }, [params, getArrayParam]);

  const setFilterValues = useCallback(
    (patch: WorkflowRunsFilterPatch) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;

      const nextStatus =
        patch.wfStatus !== undefined ? str(patch.wfStatus) : filterValues[PARAM_STATUS];
      const nextFrom = patch.wfFrom !== undefined ? str(patch.wfFrom) : filterValues[PARAM_FROM];
      const nextTo = patch.wfTo !== undefined ? str(patch.wfTo) : filterValues[PARAM_TO];

      let nextTypes: string[];
      if (patch.wfType !== undefined) {
        nextTypes = Array.isArray(patch.wfType)
          ? patch.wfType.map((t) => t.trim()).filter(Boolean)
          : splitTypes(str(patch.wfType));
      } else {
        nextTypes = splitTypes(filterValues[PARAM_TYPE]);
      }

      setParams({
        [PARAM_STATUS]: nextStatus || undefined,
        [PARAM_TYPE]: nextTypes.length ? nextTypes : undefined,
        [PARAM_FROM]: nextFrom || undefined,
        [PARAM_TO]: nextTo || undefined,
      });
    },
    [setParams, filterValues]
  );

  const workflowRunListQueryParams = useMemo(() => {
    const typeValues = splitTypes(filterValues[PARAM_TYPE]);
    const statusRaw = filterValues[PARAM_STATUS];
    const statusForApi =
      !statusRaw || statusRaw === 'all' ? undefined : (statusRaw as WorkflowRunStatus);

    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: search || undefined,
      workflow__orcabus_id: typeValues.length ? typeValues.join(',') : undefined,
      status: statusForApi,
      is_ongoing: statusRaw === 'ongoing' ? true : undefined,
      start_time: toUtcStartOfDayQueryParam(filterValues[PARAM_FROM]),
      end_time: toUtcStartOfDayQueryParam(filterValues[PARAM_TO]),
      order_by: orderBy || '-timestamp',
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(WORKFLOW_RUNS_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const status = (
    !filterValues[PARAM_STATUS] || filterValues[PARAM_STATUS] === 'all'
      ? 'all'
      : filterValues[PARAM_STATUS]
  ) as WorkflowRunStatus | 'all';

  const typeValues = useMemo(() => splitTypes(filterValues[PARAM_TYPE]), [filterValues]);

  const setStatus = useCallback(
    (v: WorkflowRunStatus | 'all') => setFilterValues({ wfStatus: v === 'all' ? '' : v }),
    [setFilterValues]
  );

  const setTypeValues = useCallback(
    (v: string[]) => setFilterValues({ wfType: v }),
    [setFilterValues]
  );

  const setDateFrom = useCallback((v: string) => setFilterValues({ wfFrom: v }), [setFilterValues]);

  const setDateTo = useCallback((v: string) => setFilterValues({ wfTo: v }), [setFilterValues]);

  return {
    search,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    workflowRunListQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    status,
    setStatus,
    typeValues,
    setTypeValues,
    dateFrom: filterValues[PARAM_FROM],
    setDateFrom,
    dateTo: filterValues[PARAM_TO],
    setDateTo,
  };
}
