import { useCallback, useMemo } from 'react';
import type { FilterBadge } from '@/components/tables/FilterBar';
import { useQueryParams } from '@/hooks/useQueryParams';
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  PARAM_INFO,
  PARAM_SEARCH,
} from '@/utils/constants';

const PARAM_STACK_ID = 'stack_id';

function normalizePage(value: number): number {
  return Number.isInteger(value) && value > 0 ? value : 1;
}

function normalizeRowsPerPage(value: number): number {
  return DEFAULT_PAGE_SIZE_OPTIONS.includes(value) ? value : DEFAULT_PAGE_SIZE;
}

export function useDeploymentPulseQueryParams() {
  const {
    pagination,
    getParam,
    getBooleanParam,
    setParams,
    setPage,
    setRowsPerPage,
    search,
    setSearchQuery,
  } = useQueryParams();
  const page = normalizePage(pagination.page);
  const rowsPerPage = normalizeRowsPerPage(pagination.rowsPerPage);
  const selectedStackId = getParam(PARAM_STACK_ID) ?? null;
  const isInfoDrawerOpen = selectedStackId == null && getBooleanParam(PARAM_INFO);

  /** The shared `search` param drives the API's `stackName` filter. */
  const stackListQueryParams = useMemo(
    () => ({ page, rowsPerPage, stackName: search || undefined }),
    [page, rowsPerPage, search]
  );

  const activeFilterBadges = useMemo(
    (): FilterBadge[] =>
      search
        ? [
            {
              id: PARAM_SEARCH,
              type: 'search',
              label: 'Stack name',
              value: search,
              onRemove: () => setSearchQuery(''),
            },
          ]
        : [],
    [search, setSearchQuery]
  );

  const clearAllFilters = useCallback(() => setSearchQuery(''), [setSearchQuery]);

  const openStackDetails = useCallback(
    (stackId: string) =>
      setParams({ [PARAM_STACK_ID]: stackId, [PARAM_INFO]: undefined }, { resetPagination: false }),
    [setParams]
  );
  const closeStackDetails = useCallback(
    () =>
      setParams({ [PARAM_STACK_ID]: undefined }, { resetPagination: false, historyReplace: true }),
    [setParams]
  );
  const openInfoDrawer = useCallback(
    () =>
      setParams({ [PARAM_INFO]: true, [PARAM_STACK_ID]: undefined }, { resetPagination: false }),
    [setParams]
  );
  const closeInfoDrawer = useCallback(
    () => setParams({ [PARAM_INFO]: undefined }, { resetPagination: false, historyReplace: true }),
    [setParams]
  );

  return {
    page,
    rowsPerPage,
    stackListQueryParams,
    setPage,
    setRowsPerPage,
    search,
    setSearch: setSearchQuery,
    activeFilterBadges,
    clearAllFilters,
    selectedStackId,
    openStackDetails,
    closeStackDetails,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  };
}
