import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_PAGE_SIZE,
  PARAM_ORDER_BY,
  PARAM_PAGE,
  PARAM_ROWS_PER_PAGE,
  PARAM_SEARCH,
} from '../utils/constants';

export type SortDirection = 'asc' | 'desc';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ParamValue = string | string[] | number | boolean | null | undefined;
type ParsedParams = Record<string, string | string[]>;

interface SetParamsOptions {
  /** Replace current params entirely instead of merging (default: false) */
  replace?: boolean;
  /** Reset pagination keys when setting non-pagination params (default: auto-detect) */
  resetPagination?: boolean;
  /** Use `history.replaceState` instead of `pushState` (default: false) */
  historyReplace?: boolean;
}

interface UseQueryParamsOptions {
  defaultPageSize?: number;
  paginationKeys?: string[];
}

interface PaginationState {
  page: number;
  rowsPerPage: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse URLSearchParams into a plain object, collapsing duplicate keys into arrays. */
function parseSearchParams(searchParams: URLSearchParams): ParsedParams {
  const result: ParsedParams = {};
  for (const [key, val] of searchParams.entries()) {
    const existing = result[key];
    if (existing !== undefined) {
      result[key] = Array.isArray(existing) ? [...existing, val] : [existing, val];
    } else {
      result[key] = val;
    }
  }
  return result;
}

/** Convert typed param values to a string-only record, stripping nullish / empty values. */
function serializeParams(params: Record<string, ParamValue>): Record<string, string | string[]> {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === '') continue;
    if (Array.isArray(value)) {
      const filtered = value.filter((v): v is string => v != null && v !== '');
      if (filtered.length > 0) result[key] = filtered;
    } else {
      result[key] = String(value);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useQueryParams(options: UseQueryParamsOptions = {}) {
  const {
    defaultPageSize = DEFAULT_PAGE_SIZE,
    paginationKeys = [PARAM_PAGE, PARAM_ROWS_PER_PAGE],
  } = options;

  const [searchParams, setSearchParams] = useSearchParams();

  /** Parsed query params as a plain object (memoized). */
  const params = useMemo(() => parseSearchParams(searchParams), [searchParams]);

  /**
   * Merge (or replace) query params.
   * Set a value to `undefined` / `null` / `''` to remove that key.
   * Non-pagination changes automatically reset page & rowsPerPage unless overridden.
   */
  const setParams = useCallback(
    (nextParams: Record<string, ParamValue>, opts: SetParamsOptions = {}) => {
      const { replace = false, resetPagination, historyReplace = false } = opts;

      const isTouchingPagination = Object.keys(nextParams).some((k) => paginationKeys.includes(k));
      const shouldResetPagination = resetPagination ?? !isTouchingPagination;

      setSearchParams(
        (prev) => {
          const base = replace ? {} : parseSearchParams(prev);

          if (shouldResetPagination) {
            for (const key of paginationKeys) {
              delete base[key];
            }
          }

          return serializeParams({ ...base, ...nextParams });
        },
        { replace: historyReplace }
      );
    },
    [setSearchParams, paginationKeys]
  );

  /** Remove specific params by key. */
  const removeParams = useCallback(
    (keys: string[]) => {
      setSearchParams((prev) => {
        const current = parseSearchParams(prev);
        for (const key of keys) {
          delete current[key];
        }
        return current;
      });
    },
    [setSearchParams]
  );

  /** Clear all params. Optionally provide keys to keep. */
  const clearParams = useCallback(
    (keep?: string[]) => {
      if (!keep?.length) {
        setSearchParams({});
        return;
      }
      setSearchParams((prev) => {
        const current = parseSearchParams(prev);
        const kept: ParsedParams = {};
        for (const key of keep) {
          if (key in current) kept[key] = current[key];
        }
        return kept;
      });
    },
    [setSearchParams]
  );

  // ---- Typed accessors ----

  /** Get a single string value (first value if multi-value). */
  const getParam = useCallback(
    (key: string): string | undefined => {
      const value = params[key];
      return Array.isArray(value) ? value[0] : value;
    },
    [params]
  );

  /** Get a param as a string array (always returns an array). */
  const getArrayParam = useCallback(
    (key: string): string[] => {
      const value = params[key];
      if (value === undefined) return [];
      return Array.isArray(value) ? value : [value];
    },
    [params]
  );

  /** Get a param as a number. Returns `fallback` when absent or NaN. */
  const getNumericParam = useCallback(
    (key: string, fallback?: number): number | undefined => {
      const str = (() => {
        const v = params[key];
        return Array.isArray(v) ? v[0] : v;
      })();
      if (str === undefined) return fallback;
      const num = Number(str);
      return Number.isNaN(num) ? fallback : num;
    },
    [params]
  );

  /** Get a param as a boolean (`'true'` / `'1'` -> true). */
  const getBooleanParam = useCallback(
    (key: string, fallback = false): boolean => {
      const str = (() => {
        const v = params[key];
        return Array.isArray(v) ? v[0] : v;
      })();
      if (str === undefined) return fallback;
      return str === 'true' || str === '1';
    },
    [params]
  );

  /** Pagination state derived from current query params. */
  const pagination = useMemo<PaginationState>(
    () => ({
      page: Number(searchParams.get(PARAM_PAGE)) || 1,
      rowsPerPage: Number(searchParams.get(PARAM_ROWS_PER_PAGE)) || defaultPageSize,
    }),
    [searchParams, defaultPageSize]
  );

  const setPage = useCallback((page: number) => setParams({ [PARAM_PAGE]: page }), [setParams]);
  const setRowsPerPage = useCallback(
    (rowsPerPage: number) => setParams({ [PARAM_ROWS_PER_PAGE]: rowsPerPage, [PARAM_PAGE]: 1 }),
    [setParams]
  );

  const setSearchQuery = useCallback(
    (value: string) => setParams({ [PARAM_SEARCH]: value || undefined }),
    [setParams]
  );

  /**
   * Set sort order as a raw API-style string: `field` = asc, `-field` = desc (e.g. `timestamp`, `-timestamp`).
   * Resets page to 1.
   */
  const setOrderBy = useCallback(
    (value: string) =>
      setParams({
        [PARAM_ORDER_BY]: value || undefined,
        [PARAM_PAGE]: 1,
      }),
    [setParams]
  );

  const getOrderDirection = useCallback(
    (field: string): SortDirection | undefined => {
      const orderBy = getParam(PARAM_ORDER_BY) ?? '';
      if (!orderBy) return undefined;
      const normalized = orderBy.startsWith('-') ? orderBy.slice(1) : orderBy;
      if (normalized !== field) return undefined;
      return orderBy.startsWith('-') ? 'desc' : 'asc';
    },
    [getParam]
  );

  return {
    /** Parsed query params object */
    params,
    /** Raw URLSearchParams instance */
    rawParams: searchParams,
    /** Merge (or replace) query params. */
    setParams,
    /** Remove specific params by key. */
    removeParams,
    /** Clear all params. Optionally provide keys to keep. */
    clearParams,
    /** Get a single string value (first value if multi-value). */
    getParam,
    /** Get a param as a string array (always returns an array). */
    getArrayParam,
    /** Get a param as a number. Returns `fallback` when absent or NaN. */
    getNumericParam,
    /** Get a param as a boolean (`'true'` / `'1'` -> true). */
    getBooleanParam,
    /** Pagination state derived from current query params. */
    pagination,
    /** Set the page number. */
    setPage,
    /** Set the rows per page. */
    setRowsPerPage,
    /** Get the search query param (`PARAM_SEARCH`). */
    search: getParam(PARAM_SEARCH) ?? '',
    /** Set the search query param (`PARAM_SEARCH`). */
    setSearchQuery,
    /** Get the search query param (`PARAM_SEARCH`). */
    orderBy: getParam(PARAM_ORDER_BY) ?? '',
    /** Set sort as `field` (asc) or `-field` (desc). Resets page to 1. */
    setOrderBy,
    /** Direction for `field` if the current `PARAM_ORDER_BY` value targets that field. */
    getOrderDirection,
  } as const;
}
