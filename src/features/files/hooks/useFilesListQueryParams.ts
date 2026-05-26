import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE, PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';

// URL param keys
const PARAM_PORTAL_RUN_ID = 'portalRunId';
const PARAM_KEY = 'key';
const PARAM_KEY_OP = 'keyOp';
const PARAM_BUCKET = 'bucket';
// Legacy URL param. Bucket filters are now always sent as bucket[or][].
const PARAM_BUCKET_OP = 'bucketOp';

export type FilterOp = 'and' | 'or';
type FilesQueryParams = Record<string, string | string[] | undefined>;

export interface FilesFilters {
  /** Portal run IDs to filter by (OR match). */
  portalRunIds: string[];
  /** S3 key patterns; matched with keyOp logic. */
  keys: string[];
  /** How multiple key patterns are combined. Default: 'and'. */
  keyOp: FilterOp;
  /** Bucket names to filter by (OR match). */
  buckets: string[];
}

interface CreateFileListQueryParamsArgs {
  filters: FilesFilters;
  search: string;
  pagination: { page: number; rowsPerPage: number };
  orderBy: string;
}

export interface UseFilesListQueryParamsReturn {
  /** General free-text search (matches portalRunId, bucket, s3Key). */
  search: string;
  filters: FilesFilters;
  setSearch: (v: string) => void;
  setFilters: (patch: Partial<FilesFilters>) => void;
  clearAll: () => void;
  pagination: { page: number; rowsPerPage: number };
  setPage: (p: number) => void;
  setRowsPerPage: (r: number) => void;
  orderBy: string;
  setOrderBy: (o: string) => void;
  getOrderDirection: (field: string) => 'asc' | 'desc' | undefined;
  hasSearchORFilters: boolean;
  /**
   * API-ready query params derived from current URL state.
   *
   * URL:  ?key=*%2Foncoanalyser*&key=*%2Frnasum*&bucket=bucket1&portalRunId=abc
   * API:  key[and][]=*%2Foncoanalyser*&key[and][]=*%2Frnasum*&bucket[or][]=bucket1
   *       &attributes[portalRunId][]=abc&page=1&rowsPerPage=10
   */
  fileListQueryParams: Record<string, string | string[] | number>;
}

function toArray(value: string | string[] | undefined): string[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function toOp(value: string | string[] | undefined, defaultOp: FilterOp): FilterOp {
  const v = Array.isArray(value) ? value[0] : value;
  if (v === 'and' || v === 'or') return v;
  return defaultOp;
}

export function createFilesFilters(params: FilesQueryParams): FilesFilters {
  return {
    portalRunIds: toArray(params[PARAM_PORTAL_RUN_ID]),
    keys: toArray(params[PARAM_KEY]),
    keyOp: toOp(params[PARAM_KEY_OP], 'and'),
    buckets: toArray(params[PARAM_BUCKET]),
  };
}

export function createFileListQueryParams({
  filters,
  search,
  pagination,
  orderBy,
}: CreateFileListQueryParamsArgs): Record<string, string | string[] | number> {
  const p: Record<string, string | string[] | number> = {
    page: pagination.page | 1,
    rowsPerPage: pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
    ordering: orderBy || '-timestamp',
  };
  if (search) p['search'] = search;
  if (filters.keys.length > 0) p[`key[${filters.keyOp}][]`] = filters.keys;
  if (filters.buckets.length > 0) p['bucket[or][]'] = filters.buckets;
  if (filters.portalRunIds.length > 0) p['attributes[portalRunId][]'] = filters.portalRunIds;
  return p;
}

/**
 * Files page state driven by URL query params.
 *
 * URL params: search, portalRunId[], key[], keyOp, bucket[], page, rowsPerPage
 */
export function useFilesListQueryParams(): UseFilesListQueryParamsReturn {
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

  const filters = useMemo<FilesFilters>(() => createFilesFilters(params), [params]);

  const setFilters = useCallback(
    (patch: Partial<FilesFilters>) => {
      const next: Record<string, string | string[] | undefined> = {
        [PARAM_BUCKET_OP]: undefined,
      };
      if ('portalRunIds' in patch)
        next[PARAM_PORTAL_RUN_ID] = patch.portalRunIds?.length ? patch.portalRunIds : undefined;
      if ('keys' in patch) next[PARAM_KEY] = patch.keys?.length ? patch.keys : undefined;
      if ('keyOp' in patch) next[PARAM_KEY_OP] = patch.keyOp === 'and' ? undefined : patch.keyOp;
      if ('buckets' in patch)
        next[PARAM_BUCKET] = patch.buckets?.length ? patch.buckets : undefined;
      setParams(next);
    },
    [setParams]
  );

  const clearAll = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_ORDER_BY]: undefined,
        [PARAM_PORTAL_RUN_ID]: undefined,
        [PARAM_KEY]: undefined,
        [PARAM_KEY_OP]: undefined,
        [PARAM_BUCKET]: undefined,
        [PARAM_BUCKET_OP]: undefined,
      }),
    [setParams]
  );

  const hasSearchORFilters =
    search.trim() !== '' ||
    filters.portalRunIds.length > 0 ||
    filters.keys.length > 0 ||
    filters.buckets.length > 0;

  // API query params from current URL
  const fileListQueryParams = useMemo<Record<string, string | string[] | number>>(
    () => createFileListQueryParams({ filters, search, pagination, orderBy }),
    [search, filters, pagination, orderBy]
  );

  return {
    search,
    filters,
    setSearch: setSearchQuery,
    setFilters,
    clearAll,
    pagination,
    setPage,
    setRowsPerPage,
    orderBy,
    setOrderBy,
    getOrderDirection,
    hasSearchORFilters,
    fileListQueryParams,
  };
}
