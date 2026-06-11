import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { toSearchApiQueryValue, toSearchDisplayValue, toStringOrArray } from '@/utils/queryParams';
import type { SortDirection } from '@/hooks/useQueryParams';
import type { LibraryListQueryParams } from '@/features/lab/shared/api/lab.api';

// Prefixed params to avoid collisions with other tables on the same detail page
// (e.g. sample sheets table, timeline).
const LIB_PARAM_PAGE = 'libPage';
const LIB_PARAM_ROWS_PER_PAGE = 'libRowsPerPage';
const LIB_PARAM_SEARCH = 'libSearch';
const LIB_PARAM_ORDER_BY = 'libOrdering';

const LIB_PAGINATION_KEYS = [LIB_PARAM_PAGE, LIB_PARAM_ROWS_PER_PAGE];

/**
 * Sequence run detail — libraries table state driven by URL query params.
 * Uses `lib`-prefixed params to avoid conflicts with other tables on the same page.
 * Params: libPage, libRowsPerPage, libSearch, libOrdering.
 */
export function useSequenceRunDetailsLibrariesQueryParams(libraryIds: string[]) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const pageParam = getParam(LIB_PARAM_PAGE);
  const rowsPerPageParam = getParam(LIB_PARAM_ROWS_PER_PAGE);
  const searchParam = getParam(LIB_PARAM_SEARCH);
  const orderBy = getParam(LIB_PARAM_ORDER_BY) ?? '';

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
    (page: number) => setParams({ [LIB_PARAM_PAGE]: page }, { resetPagination: false }),
    [setParams]
  );

  const setRowsPerPage = useCallback(
    (rowsPerPage: number) =>
      setParams(
        { [LIB_PARAM_ROWS_PER_PAGE]: rowsPerPage, [LIB_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setSearchQuery = useCallback(
    (value: string) =>
      setParams(
        { [LIB_PARAM_SEARCH]: value || undefined, [LIB_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setOrderBy = useCallback(
    (value: string) =>
      setParams(
        { [LIB_PARAM_ORDER_BY]: value || undefined, [LIB_PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const getOrderDirection = useCallback(
    (field: string): SortDirection | undefined => {
      const current = getParam(LIB_PARAM_ORDER_BY) ?? '';
      if (!current) return undefined;
      const normalized = current.startsWith('-') ? current.slice(1) : current;
      if (normalized !== field) return undefined;
      return current.startsWith('-') ? 'desc' : 'asc';
    },
    [getParam]
  );

  const clearAllParams = useCallback(() => {
    setParams({
      [LIB_PARAM_SEARCH]: undefined,
      [LIB_PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(LIB_PAGINATION_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  // ---- API query params ----

  const librariesQueryParams = useMemo<LibraryListQueryParams>(
    () =>
      ({
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
        search: toSearchApiQueryValue(search),
        ordering: orderBy || undefined,
        libraryId: toStringOrArray(libraryIds),
      }) as LibraryListQueryParams,
    [pagination.page, pagination.rowsPerPage, search, orderBy, libraryIds]
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
    librariesQueryParams,
  };
}
