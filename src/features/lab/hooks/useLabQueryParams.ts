import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { LibraryListQueryParams } from '../api/lab.api';

type LibraryListQuery = NonNullable<LibraryListQueryParams>;
type SortDirection = 'asc' | 'desc';

const PARAM_SEARCH = 'search';
const PARAM_ORCABUS_ID = 'orcabusId';
const PARAM_LIBRARY_ID = 'libraryId';
const PARAM_ASSAY = 'assay';
const PARAM_INDIVIDUAL_ID = 'individualId';
const PARAM_PROJECT_ID = 'projectId';
const PARAM_PHENOTYPE = 'phenotype';
const PARAM_QUALITY = 'quality';
const PARAM_TYPE = 'type';
const PARAM_WORKFLOW = 'workflow';
const PARAM_COVERAGE_MIN = 'coverageMin';
const PARAM_COVERAGE_MAX = 'coverageMax';
const PARAM_ORDERING = 'ordering';

export const LAB_FILTER_KEYS = [
  PARAM_ORCABUS_ID,
  PARAM_LIBRARY_ID,
  PARAM_ASSAY,
  PARAM_INDIVIDUAL_ID,
  PARAM_PROJECT_ID,
  PARAM_PHENOTYPE,
  PARAM_QUALITY,
  PARAM_TYPE,
  PARAM_WORKFLOW,
  PARAM_COVERAGE_MIN,
  PARAM_COVERAGE_MAX,
] as const;

export type LabFilterKey = (typeof LAB_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<string, string> = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_LIBRARY_ID]: '',
  [PARAM_ASSAY]: '',
  [PARAM_INDIVIDUAL_ID]: '',
  [PARAM_PROJECT_ID]: '',
  [PARAM_PHENOTYPE]: '',
  [PARAM_QUALITY]: '',
  [PARAM_TYPE]: '',
  [PARAM_WORKFLOW]: '',
  [PARAM_COVERAGE_MIN]: '',
  [PARAM_COVERAGE_MAX]: '',
};

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

function toFirstCsvValue(value: string): string | undefined {
  const first = value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)[0];
  return first || undefined;
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

/**
 * Lab list page state driven by URL query params.
 * Params: search, filters, and server-side pagination.
 */
export function useLabQueryParams() {
  const { params, getParam, setParams, pagination } = useQueryParams();

  const searchQuery = getParam(PARAM_SEARCH) ?? '';
  const ordering = getParam(PARAM_ORDERING) ?? '';
  const filterValues = useMemo<Record<string, string>>(
    () => ({
      ...DEFAULT_FILTER_VALUES,
      [PARAM_ORCABUS_ID]: toFirstString(params[PARAM_ORCABUS_ID] as string | string[] | undefined),
      [PARAM_LIBRARY_ID]: toFirstString(params[PARAM_LIBRARY_ID] as string | string[] | undefined),
      [PARAM_ASSAY]: toFirstString(params[PARAM_ASSAY] as string | string[] | undefined),
      [PARAM_INDIVIDUAL_ID]: toFirstString(
        params[PARAM_INDIVIDUAL_ID] as string | string[] | undefined
      ),
      [PARAM_PROJECT_ID]: toFirstString(params[PARAM_PROJECT_ID] as string | string[] | undefined),
      [PARAM_PHENOTYPE]: toFirstString(params[PARAM_PHENOTYPE] as string | string[] | undefined),
      [PARAM_QUALITY]: toFirstString(params[PARAM_QUALITY] as string | string[] | undefined),
      [PARAM_TYPE]: toFirstString(params[PARAM_TYPE] as string | string[] | undefined),
      [PARAM_WORKFLOW]: toFirstString(params[PARAM_WORKFLOW] as string | string[] | undefined),
      [PARAM_COVERAGE_MIN]: toFirstString(
        params[PARAM_COVERAGE_MIN] as string | string[] | undefined
      ),
      [PARAM_COVERAGE_MAX]: toFirstString(
        params[PARAM_COVERAGE_MAX] as string | string[] | undefined
      ),
    }),
    [params]
  );

  const setSearchQuery = useCallback(
    (value: string) => setParams({ [PARAM_SEARCH]: value || undefined }),
    [setParams]
  );
  const setOrdering = useCallback(
    (direction: SortDirection, field: string) =>
      setParams({
        [PARAM_ORDERING]: direction === 'desc' ? `-${field}` : field || undefined,
        page: 1,
      }),
    [setParams]
  );

  const getSortDirection = useCallback(
    (field: string): SortDirection | undefined => {
      if (!ordering) return undefined;
      const normalized = ordering.startsWith('-') ? ordering.slice(1) : ordering;
      if (normalized !== field) return undefined;
      return ordering.startsWith('-') ? 'desc' : 'asc';
    },
    [ordering]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;
      setParams({
        [PARAM_ORCABUS_ID]: str(values.orcabusId) || undefined,
        [PARAM_LIBRARY_ID]: str(values.libraryId) || undefined,
        [PARAM_ASSAY]: str(values.assay) || undefined,
        [PARAM_INDIVIDUAL_ID]: str(values.individualId) || undefined,
        [PARAM_PROJECT_ID]: str(values.projectId) || undefined,
        [PARAM_PHENOTYPE]: str(values.phenotype) || undefined,
        [PARAM_QUALITY]: str(values.quality) || undefined,
        [PARAM_TYPE]: str(values.type) || undefined,
        [PARAM_WORKFLOW]: str(values.workflow) || undefined,
        [PARAM_COVERAGE_MIN]: str(values.coverageMin) || undefined,
        [PARAM_COVERAGE_MAX]: str(values.coverageMax) || undefined,
      });
    },
    [setParams]
  );

  const libraryListQueryParams = useMemo<LibraryListQueryParams>(() => {
    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: searchQuery || undefined,
      ordering: ordering || undefined,
      orcabusId: filterValues.orcabusId || undefined,
      libraryId: filterValues.libraryId || undefined,
      assay: filterValues.assay || undefined,
      individualId: filterValues.individualId || undefined,
      projectId: toNumber(filterValues.projectId),
      phenotype: toFirstCsvValue(filterValues.phenotype) as LibraryListQuery['phenotype'],
      quality: toFirstCsvValue(filterValues.quality) as LibraryListQuery['quality'],
      type: toFirstCsvValue(filterValues.type) as LibraryListQuery['type'],
      workflow: toFirstCsvValue(filterValues.workflow) as LibraryListQuery['workflow'],
      'coverage[gte]': toNumber(filterValues.coverageMin),
      'coverage[lte]': toNumber(filterValues.coverageMax),
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, searchQuery, ordering]);

  const setPage = useCallback((page: number) => setParams({ page }), [setParams]);
  const setRowsPerPage = useCallback(
    (rowsPerPage: number) => setParams({ rowsPerPage, page: 1 }),
    [setParams]
  );

  /** Clear search and all filters (for "Clear all" in AdvancedFilterBar). */
  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDERING]: undefined,
      ...Object.fromEntries(LAB_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  return {
    searchQuery,
    setSearchQuery,
    ordering,
    setOrdering,
    getSortDirection,
    filterValues,
    setFilterValues,
    libraryListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
