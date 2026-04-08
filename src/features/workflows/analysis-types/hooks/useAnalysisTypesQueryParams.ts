import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { AnalysisType } from '@/data/mockData';
import type { ListAnalysisModel } from '../../api/workflows.api';

export type AnalysisTypeStatus = 'ACTIVE' | 'INACTIVE';

const PARAM_STATUS = 'atStatus';
const PARAM_ANALYSIS_NAME = 'atAnalysisName';
const PARAM_ANALYSIS_VERSION = 'atAnalysisVersion';

export const ANALYSIS_TYPES_FILTER_KEYS = [
  PARAM_STATUS,
  PARAM_ANALYSIS_NAME,
  PARAM_ANALYSIS_VERSION,
] as const;

export type AnalysisTypesFilterKey = (typeof ANALYSIS_TYPES_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<AnalysisTypesFilterKey, string> = {
  [PARAM_STATUS]: '',
  [PARAM_ANALYSIS_NAME]: '',
  [PARAM_ANALYSIS_VERSION]: '',
};

export type AnalysisTypesFilterPatch = Partial<{
  atStatus: string | string[];
  atAnalysisName: string | string[];
  atAnalysisVersion: string | string[];
}>;

export interface UseAnalysisTypesQueryParamsOptions {
  analysisTypes?: AnalysisType[];
}

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

/**
 * Analysis types list state driven by URL query params.
 * Filter params: atStatus, atAnalysisName, atAnalysisVersion. Shared: search, orderBy, pagination.
 */
export function useAnalysisTypesQueryParams(options: UseAnalysisTypesQueryParamsOptions = {}) {
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

  const filterValues = useMemo(
    () => ({
      ...DEFAULT_FILTER_VALUES,
      [PARAM_STATUS]: toFirstString(params[PARAM_STATUS] as string | string[] | undefined),
      [PARAM_ANALYSIS_NAME]: toFirstString(
        params[PARAM_ANALYSIS_NAME] as string | string[] | undefined
      ),
      [PARAM_ANALYSIS_VERSION]: toFirstString(
        params[PARAM_ANALYSIS_VERSION] as string | string[] | undefined
      ),
    }),
    [params]
  );

  const setFilterValues = useCallback(
    (patch: AnalysisTypesFilterPatch) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;

      const nextStatus =
        patch.atStatus !== undefined ? str(patch.atStatus) : filterValues[PARAM_STATUS];
      const nextName =
        patch.atAnalysisName !== undefined
          ? str(patch.atAnalysisName)
          : filterValues[PARAM_ANALYSIS_NAME];
      const nextVersion =
        patch.atAnalysisVersion !== undefined
          ? str(patch.atAnalysisVersion)
          : filterValues[PARAM_ANALYSIS_VERSION];

      setParams({
        [PARAM_STATUS]: nextStatus || undefined,
        [PARAM_ANALYSIS_NAME]: nextName || undefined,
        [PARAM_ANALYSIS_VERSION]: nextVersion || undefined,
      });
    },
    [setParams, filterValues]
  );

  const analysisTypesQueryParams = useMemo((): ListAnalysisModel & Record<string, unknown> => {
    const statusRaw = filterValues[PARAM_STATUS];
    const statusForApi =
      !statusRaw || statusRaw === 'all' ? undefined : (statusRaw as AnalysisTypeStatus);

    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: search || undefined,
      analysisName: filterValues[PARAM_ANALYSIS_NAME] || undefined,
      analysisVersion: filterValues[PARAM_ANALYSIS_VERSION] || undefined,
      status: statusForApi,
      ordering: orderBy || undefined,
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(ANALYSIS_TYPES_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const status = (
    !filterValues[PARAM_STATUS] || filterValues[PARAM_STATUS] === 'all'
      ? 'all'
      : filterValues[PARAM_STATUS]
  ) as AnalysisTypeStatus | 'all';

  const setStatus = useCallback(
    (value: AnalysisTypeStatus | 'all') =>
      setFilterValues({ atStatus: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const setAnalysisNameFilter = useCallback(
    (value: string) => setFilterValues({ atAnalysisName: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const setAnalysisVersionFilter = useCallback(
    (value: string) => setFilterValues({ atAnalysisVersion: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];
    if (search) {
      badges.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: search,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (status !== 'all') {
      badges.push({
        id: PARAM_STATUS,
        type: 'filter',
        label: 'Status',
        value: status === 'ACTIVE' ? 'Active' : 'Inactive',
        onRemove: () => setStatus('all'),
      });
    }
    if (filterValues[PARAM_ANALYSIS_NAME]) {
      badges.push({
        id: PARAM_ANALYSIS_NAME,
        type: 'filter',
        label: 'Name',
        value: filterValues[PARAM_ANALYSIS_NAME],
        onRemove: () => setAnalysisNameFilter(''),
      });
    }
    if (filterValues[PARAM_ANALYSIS_VERSION]) {
      badges.push({
        id: PARAM_ANALYSIS_VERSION,
        type: 'filter',
        label: 'Version',
        value: filterValues[PARAM_ANALYSIS_VERSION],
        onRemove: () => setAnalysisVersionFilter(''),
      });
    }
    return badges;
  }, [
    search,
    status,
    filterValues,
    setSearchQuery,
    setStatus,
    setAnalysisNameFilter,
    setAnalysisVersionFilter,
  ]);

  const filteredAnalysisTypes = useMemo(() => {
    const source = options.analysisTypes ?? [];
    const nameFilter = filterValues[PARAM_ANALYSIS_NAME].toLowerCase();
    const versionFilter = filterValues[PARAM_ANALYSIS_VERSION].toLowerCase();

    return source.filter((at) => {
      const matchesSearch =
        at.name.toLowerCase().includes(search.toLowerCase()) ||
        at.id.toLowerCase().includes(search.toLowerCase()) ||
        at.version.toLowerCase().includes(search.toLowerCase()) ||
        at.description.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === 'all' || at.status === status;
      const matchesNameFilter = !nameFilter || at.name.toLowerCase().includes(nameFilter);
      const matchesVersionFilter =
        !versionFilter || at.version.toLowerCase().includes(versionFilter);
      return matchesSearch && matchesStatus && matchesNameFilter && matchesVersionFilter;
    });
  }, [options.analysisTypes, search, status, filterValues]);

  return {
    search,
    setSearch: setSearchQuery,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    analysisTypesQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    status,
    Status: status,
    setStatus,
    analysisNameFilter: filterValues[PARAM_ANALYSIS_NAME],
    setAnalysisNameFilter,
    analysisVersionFilter: filterValues[PARAM_ANALYSIS_VERSION],
    setAnalysisVersionFilter,
    activeFilterBadges,
    filteredAnalysisTypes,
  };
}
