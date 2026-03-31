import { useState, useCallback } from 'react';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';

export interface TablePagination {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  /** Total item count (maps to API pagination.count). Required for DataTable paginationProps. */
  totalItems: number;
}

/** Optional pagination props; missing fields are filled with defaults. */
export type OptionalPaginationProps = Partial<TablePagination>;

/**
 * Normalizes optional pagination props with defaults. Use when rendering a table
 * with partial pagination (e.g. only totalItems) so page/pageSize/callbacks have safe defaults.
 */
export function usePaginationDefaults(paginationProps?: OptionalPaginationProps): {
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalItemsProp: number | undefined;
} {
  const page = paginationProps?.page ?? 1;
  const pageSize = paginationProps?.pageSize ?? DEFAULT_PAGE_SIZE;
  const onPageChange = paginationProps?.onPageChange ?? (() => {});
  const onPageSizeChange = paginationProps?.onPageSizeChange ?? (() => {});
  const totalItemsProp = paginationProps?.totalItems;
  return { page, pageSize, onPageChange, onPageSizeChange, totalItemsProp };
}

/**
 * Local state for table pagination. Use this when pagination is not yet synced to URL.
 * For URL-driven pagination, use useQueryParams().pagination and setParams instead.
 * Uses same defaults as usePaginationDefaults for page and pageSize.
 */
export function useTablePagination(
  initialPage = 1,
  initialPageSize = DEFAULT_PAGE_SIZE,
  totalItems: number
): TablePagination {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const onPageChange = useCallback((p: number) => setPage(Math.max(1, p)), []);
  const onPageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
  }, []);

  return { page, pageSize, onPageChange, onPageSizeChange, totalItems };
}
