import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';
import type { Case } from '../types/case.types';

const PARAM_SEARCH = 'search';
const PARAM_CASE_TYPE = 'caseType';
const PARAM_DATE_FROM = 'dateFrom';
const PARAM_DATE_TO = 'dateTo';
const PARAM_DRAWER = 'drawer';

/** Parse comma-separated param into trimmed non-empty array. Single value or multiple. */
function parseMultiParam(value: string | undefined): string[] {
  if (value == null || value === '') return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

interface UseCasesQueryParamsOptions {
  cases: Case[];
  libraries: { id: string; name: string }[];
}

/**
 * Cases list page state driven by URL query params.
 * Params: search, caseType (single or comma-separated), dateFrom, dateTo, drawer (case id for summary drawer).
 */
export function useCasesQueryParams({ cases, libraries }: UseCasesQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const searchQuery = getParam(PARAM_SEARCH) ?? '';
  const caseTypeRaw = getParam(PARAM_CASE_TYPE) ?? 'all';
  const dateFromFilter = getParam(PARAM_DATE_FROM) ?? '';
  const dateToFilter = getParam(PARAM_DATE_TO) ?? '';
  const drawerCaseId = getParam(PARAM_DRAWER) ?? undefined;

  const caseTypeFilter = caseTypeRaw === '' ? 'all' : caseTypeRaw;
  const caseTypeValues = useMemo(
    () => (caseTypeFilter === 'all' ? [] : parseMultiParam(caseTypeFilter)),
    [caseTypeFilter]
  );

  const setSearchQuery = useCallback(
    (value: string) => setParams({ [PARAM_SEARCH]: value || undefined }),
    [setParams]
  );
  const setCaseTypeFilter = useCallback(
    (value: string) => setParams({ [PARAM_CASE_TYPE]: value === 'all' ? undefined : value }),
    [setParams]
  );
  const setDateFromFilter = useCallback(
    (value: string) => setParams({ [PARAM_DATE_FROM]: value || undefined }),
    [setParams]
  );
  const setDateToFilter = useCallback(
    (value: string) => setParams({ [PARAM_DATE_TO]: value || undefined }),
    [setParams]
  );
  const setDrawerCaseId = useCallback(
    (id: string | null | undefined) =>
      setParams({ [PARAM_DRAWER]: id && id !== '' ? id : undefined }),
    [setParams]
  );

  /** Clear all list filters in one URL update (avoids React batching leaving other params). */
  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_CASE_TYPE]: undefined,
        [PARAM_DATE_FROM]: undefined,
        [PARAM_DATE_TO]: undefined,
      }),
    [setParams]
  );

  const filteredCases = useMemo(() => {
    return cases.filter((case_) => {
      const matchesSearch =
        !searchQuery ||
        case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        case_.linkedLibraries.some((libId) =>
          libraries
            .find((lib) => lib.id === libId)
            ?.name.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );

      const matchesType = caseTypeValues.length === 0 || caseTypeValues.includes(case_.type);

      let matchesDateRange = true;
      if (dateFromFilter || dateToFilter) {
        const caseDate = new Date(case_.lastModified);
        if (dateFromFilter) {
          const fromDate = new Date(dateFromFilter);
          matchesDateRange = matchesDateRange && caseDate >= fromDate;
        }
        if (dateToFilter) {
          const toDate = new Date(dateToFilter);
          toDate.setHours(23, 59, 59, 999);
          matchesDateRange = matchesDateRange && caseDate <= toDate;
        }
      }

      return matchesSearch && matchesType && matchesDateRange;
    });
  }, [cases, libraries, searchQuery, caseTypeValues, dateFromFilter, dateToFilter]);

  const selectedCase = useMemo(
    () => (drawerCaseId ? (cases.find((c) => c.id === drawerCaseId) ?? null) : null),
    [cases, drawerCaseId]
  );
  const setSelectedCase = useCallback(
    (case_: Case | null) => setDrawerCaseId(case_?.id ?? null),
    [setDrawerCaseId]
  );

  return {
    searchQuery,
    setSearchQuery,
    caseTypeFilter,
    setCaseTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    clearAllFilters,
    drawerCaseId: drawerCaseId ?? null,
    setDrawerCaseId,
    selectedCase,
    setSelectedCase,
    filteredCases,
  };
}
