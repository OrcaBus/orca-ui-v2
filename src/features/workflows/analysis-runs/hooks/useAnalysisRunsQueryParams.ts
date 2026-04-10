import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import { toUtcStartOfDay } from '@/utils/timeFormat';

export type AnalysisRunStatus =
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'running';

const PARAM_STATUS = 'arStatus';
const PARAM_TYPE = 'arType';
const PARAM_FROM = 'arFrom';
const PARAM_TO = 'arTo';

export const ANALYSIS_RUNS_FILTER_KEYS = [PARAM_STATUS, PARAM_TYPE, PARAM_FROM, PARAM_TO] as const;

export type AnalysisRunsFilterKey = (typeof ANALYSIS_RUNS_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<AnalysisRunsFilterKey, string> = {
  [PARAM_STATUS]: '',
  [PARAM_TYPE]: '',
  [PARAM_FROM]: '',
  [PARAM_TO]: '',
};

export type AnalysisRunsFilterPatch = Partial<{
  arStatus: string | string[];
  arType: string | string[];
  arFrom: string | string[];
  arTo: string | string[];
}>;

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

function splitTypes(arType: string): string[] {
  return arType
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Analysis runs list page state driven by URL query params.
 * Filter params: arStatus, arType, arFrom, arTo. Shared: search, orderBy, pagination.
 */
export function useAnalysisRunsQueryParams() {
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
    (patch: AnalysisRunsFilterPatch) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;

      const nextStatus =
        patch.arStatus !== undefined ? str(patch.arStatus) : filterValues[PARAM_STATUS];
      const nextFrom = patch.arFrom !== undefined ? str(patch.arFrom) : filterValues[PARAM_FROM];
      const nextTo = patch.arTo !== undefined ? str(patch.arTo) : filterValues[PARAM_TO];

      let nextTypes: string[];
      if (patch.arType !== undefined) {
        nextTypes = Array.isArray(patch.arType)
          ? patch.arType.map((t) => t.trim()).filter(Boolean)
          : splitTypes(str(patch.arType));
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

  const analysisRunListQueryParams = useMemo(() => {
    const typeValues = splitTypes(filterValues[PARAM_TYPE]);
    const statusRaw = filterValues[PARAM_STATUS];
    const statusForApi =
      !statusRaw || statusRaw === 'all' ? undefined : (statusRaw as AnalysisRunStatus);

    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: search || undefined,
      analysis: typeValues.length ? typeValues.join(',') : undefined,
      status: statusForApi,
      is_ongoing: statusRaw === 'ongoing' ? true : undefined,
      start_time: toUtcStartOfDay(filterValues[PARAM_FROM]),
      end_time: toUtcStartOfDay(filterValues[PARAM_TO]),
      // order_by: orderBy || '-timestamp',
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(ANALYSIS_RUNS_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const status = (
    !filterValues[PARAM_STATUS] || filterValues[PARAM_STATUS] === 'all'
      ? 'all'
      : filterValues[PARAM_STATUS]
  ) as AnalysisRunStatus | 'all';

  const typeValues = useMemo(() => splitTypes(filterValues[PARAM_TYPE]), [filterValues]);

  const setStatus = useCallback(
    (v: AnalysisRunStatus | 'all') => setFilterValues({ arStatus: v === 'all' ? '' : v }),
    [setFilterValues]
  );

  const setTypeValues = useCallback(
    (v: string[]) => setFilterValues({ arType: v }),
    [setFilterValues]
  );

  const setDateFrom = useCallback((v: string) => setFilterValues({ arFrom: v }), [setFilterValues]);

  const setDateTo = useCallback((v: string) => setFilterValues({ arTo: v }), [setFilterValues]);

  return {
    search,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    analysisRunListQueryParams,
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
