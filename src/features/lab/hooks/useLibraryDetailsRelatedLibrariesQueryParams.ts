import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import type { SortDirection } from '@/hooks/useQueryParams';

// Prefixed params to avoid collisions with other tables on the library details page
// (e.g. the workflow runs table, tab param).
const PARAM_PAGE = 'relLibPage';
const PARAM_ROWS_PER_PAGE = 'relLibRowsPerPage';
const PARAM_ORDER_BY = 'relLibOrdering';

/**
 * Library details page — related libraries table state driven by URL query params.
 * Uses `relLib`-prefixed params to avoid conflicts with other tables on the same page.
 * Params: relLibPage, relLibRowsPerPage, relLibOrdering.
 */
export function useLibraryDetailsRelatedLibrariesQueryParams() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });
  const pageParam = getParam(PARAM_PAGE);
  const rowsPerPageParam = getParam(PARAM_ROWS_PER_PAGE);
  const orderBy = getParam(PARAM_ORDER_BY) ?? '';

  // ---- Derived state ----

  const pagination = useMemo(
    () => ({
      page: Number(pageParam) || 1,
      rowsPerPage: Number(rowsPerPageParam) || DEFAULT_PAGE_SIZE,
    }),
    [pageParam, rowsPerPageParam]
  );

  // ---- Setters ----

  const setPage = useCallback(
    (page: number) => setParams({ [PARAM_PAGE]: page }, { resetPagination: false }),
    [setParams]
  );

  const setRowsPerPage = useCallback(
    (rowsPerPage: number) =>
      setParams(
        { [PARAM_ROWS_PER_PAGE]: rowsPerPage, [PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const setOrderBy = useCallback(
    (value: string) =>
      setParams(
        { [PARAM_ORDER_BY]: value || undefined, [PARAM_PAGE]: 1 },
        { resetPagination: false }
      ),
    [setParams]
  );

  const getOrderDirection = useCallback(
    (field: string): SortDirection | undefined => {
      const current = getParam(PARAM_ORDER_BY) ?? '';
      if (!current) return undefined;
      const normalized = current.startsWith('-') ? current.slice(1) : current;
      if (normalized !== field) return undefined;
      return current.startsWith('-') ? 'desc' : 'asc';
    },
    [getParam]
  );

  return {
    orderBy,
    setOrderBy,
    getOrderDirection,
    pagination,
    setPage,
    setRowsPerPage,
  };
}
