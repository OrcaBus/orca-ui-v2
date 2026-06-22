import { useCallback, useMemo } from 'react';
import type { FilterBadge } from '@/components/tables/FilterBar';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE, PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import type { ListRunContextModel, WorkflowStatusEnum } from '../../shared/api/workflows.api';

export type RunContextStatus = WorkflowStatusEnum;

const PARAM_STATUS = 'rcStatus';

export const RUN_CONTEXTS_FILTER_KEYS = [PARAM_STATUS] as const;

export type RunContextsFilterKey = (typeof RUN_CONTEXTS_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<RunContextsFilterKey, string> = {
  [PARAM_STATUS]: '',
};

export type RunContextsFilterPatch = Partial<{
  rcStatus: string | string[];
}>;

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

/**
 * Run contexts list state driven by URL query params.
 * Filter params: rcStatus. Shared: search, ordering, pagination.
 */
export function useRunContextsListQueryParams() {
  const {
    params,
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

  const filterValues = useMemo(
    () => ({
      ...DEFAULT_FILTER_VALUES,
      [PARAM_STATUS]: toFirstString(params[PARAM_STATUS] as string | string[] | undefined),
    }),
    [params]
  );

  const setFilterValues = useCallback(
    (patch: RunContextsFilterPatch) => {
      const nextStatus =
        patch.rcStatus !== undefined ? toFirstString(patch.rcStatus) : filterValues[PARAM_STATUS];

      setParams({
        [PARAM_STATUS]: nextStatus || undefined,
      });
    },
    [setParams, filterValues]
  );

  const runContextsQueryParams = useMemo((): ListRunContextModel => {
    const statusRaw = filterValues[PARAM_STATUS];
    const statusForApi =
      !statusRaw || statusRaw === 'all' ? undefined : (statusRaw as RunContextStatus);

    return {
      page: pagination.page || 1,
      rowsPerPage: pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
      search: search || undefined,
      status: statusForApi,
      ordering: orderBy || undefined,
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(RUN_CONTEXTS_FILTER_KEYS.map((key) => [key, undefined])),
    });
  }, [setParams]);

  const status = (
    !filterValues[PARAM_STATUS] || filterValues[PARAM_STATUS] === 'all'
      ? 'all'
      : filterValues[PARAM_STATUS]
  ) as RunContextStatus | 'all';

  const setStatus = useCallback(
    (value: RunContextStatus | 'all') =>
      setFilterValues({ rcStatus: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];

    if (search) {
      badges.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: search,
        onRemove: () => setSearchQuery(''),
      });
    }

    if (status !== 'all') {
      badges.push({
        id: PARAM_STATUS,
        type: 'filter',
        label: 'Status',
        value: status === 'ACTIVE' ? 'Active' : 'Inactive',
        onRemove: () => setStatus('all'),
      });
    }

    return badges;
  }, [search, setSearchQuery, setStatus, status]);

  return {
    search,
    setSearch: setSearchQuery,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    runContextsQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    status,
    setStatus,
    activeFilterBadges,
  };
}
