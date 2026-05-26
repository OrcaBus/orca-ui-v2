import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { DEFAULT_PAGE_SIZE, PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';

const PARAM_CASE_TYPE = 'caseType';

export const CASES_FILTER_KEYS = [PARAM_CASE_TYPE] as const;
export type CasesFilterKey = (typeof CASES_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<CasesFilterKey, string> = {
  [PARAM_CASE_TYPE]: '',
};

export type CasesFilterPatch = Partial<{
  caseType: string | string[];
}>;

function splitTypes(caseType: string): string[] {
  return caseType
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Cases list page state driven by URL query params.
 * Filter params: caseType. Shared: search, orderBy, pagination.
 */
export function useCasesListQueryParams() {
  const {
    getArrayParam,
    setParams,
    pagination,
    search,
    setPage,
    setRowsPerPage,
    setSearchQuery,
    orderBy,
    setOrderBy,
    getOrderDirection,
  } = useQueryParams();

  const filterValues = useMemo(() => {
    const typeParts = getArrayParam(PARAM_CASE_TYPE);
    return {
      ...DEFAULT_FILTER_VALUES,
      [PARAM_CASE_TYPE]: typeParts.join(','),
    };
  }, [getArrayParam]);

  const setFilterValues = useCallback(
    (patch: CasesFilterPatch) => {
      let nextTypes: string[];
      if (patch.caseType !== undefined) {
        nextTypes = Array.isArray(patch.caseType)
          ? patch.caseType.map((t) => t.trim()).filter(Boolean)
          : splitTypes(patch.caseType);
      } else {
        nextTypes = splitTypes(filterValues[PARAM_CASE_TYPE]);
      }
      setParams({
        [PARAM_CASE_TYPE]: nextTypes.length ? nextTypes : undefined,
      });
    },
    [setParams, filterValues]
  );

  const caseListQueryParams = useMemo(() => {
    return {
      page: pagination.page || 1,
      rowsPerPage: pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
      search: search || undefined,
      ordering: orderBy || undefined,
    };
  }, [pagination.page, pagination.rowsPerPage, search, orderBy]);

  /** Clear all list filters in one URL update. */
  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(CASES_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const caseTypeValues = useMemo(() => splitTypes(filterValues[PARAM_CASE_TYPE]), [filterValues]);

  const setCaseTypeValues = useCallback(
    (v: string[]) => setFilterValues({ caseType: v }),
    [setFilterValues]
  );

  const caseTypeFilter = filterValues[PARAM_CASE_TYPE] || 'all';
  const setCaseTypeFilter = useCallback(
    (v: string) => setFilterValues({ caseType: v === 'all' ? [] : splitTypes(v) }),
    [setFilterValues]
  );

  return {
    search,
    setSearchQuery,
    orderBy,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    caseListQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    caseTypeValues,
    setCaseTypeValues,
    caseTypeFilter,
    setCaseTypeFilter,
  };
}

// Alias for backward compatibility
export { useCasesListQueryParams as useCasesQueryParams };
