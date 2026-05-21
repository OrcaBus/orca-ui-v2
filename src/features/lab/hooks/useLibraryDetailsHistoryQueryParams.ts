import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

// Prefixed params to avoid collisions with other tables on the library details page
// (e.g. the workflow runs table, related libraries table, tab param).
const PARAM_PAGE = 'libHistPage';
const PARAM_ROWS_PER_PAGE = 'libHistRowsPerPage';

/**
 * Library details page — history table state driven by URL query params.
 * Uses `libHist`-prefixed params to avoid conflicts with other tables on the same page.
 * Params: libHistPage, libHistRowsPerPage.
 */
export function useLibraryDetailsHistoryQueryParams() {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const pagination = useMemo(
    () => ({
      page: Number(getParam(PARAM_PAGE)) || 1,
      rowsPerPage: Number(getParam(PARAM_ROWS_PER_PAGE)) || DEFAULT_PAGE_SIZE,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [getParam(PARAM_PAGE), getParam(PARAM_ROWS_PER_PAGE)]
  );

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

  return {
    pagination,
    setPage,
    setRowsPerPage,
  };
}
