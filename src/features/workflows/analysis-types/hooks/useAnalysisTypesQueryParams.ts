import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { AnalysisType } from '@/data/mockData';

export type AnalysisTypeStatus = 'ACTIVE' | 'INACTIVE';

const PARAM_SEARCH = 'atSearch';
const PARAM_STATUS = 'atStatus';

export interface UseAnalysisTypesQueryParamsOptions {
  analysisTypes: AnalysisType[];
}

/**
 * Analysis types list page state driven by URL query params.
 * Params: atSearch, atStatus.
 */
export function useAnalysisTypesQueryParams({ analysisTypes }: UseAnalysisTypesQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const status = (getParam(PARAM_STATUS) ?? 'all') as AnalysisTypeStatus | 'all';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setStatus = useCallback(
    (v: AnalysisTypeStatus | 'all') => setParams({ [PARAM_STATUS]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_STATUS]: undefined,
      }),
    [setParams]
  );

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];
    if (search) {
      badges.push({
        id: PARAM_SEARCH,
        type: 'search',
        label: 'Search',
        value: search,
        onRemove: () => setSearch(''),
      });
    }
    if (status !== 'all') {
      badges.push({
        id: PARAM_STATUS,
        type: 'filter',
        label: 'Status',
        value: status,
        onRemove: () => setStatus('all'),
      });
    }
    return badges;
  }, [search, status, setSearch, setStatus]);

  const filteredAnalysisTypes = useMemo(
    () =>
      analysisTypes.filter((at) => {
        const matchesSearch =
          at.name.toLowerCase().includes(search.toLowerCase()) ||
          at.id.toLowerCase().includes(search.toLowerCase()) ||
          at.version.toLowerCase().includes(search.toLowerCase()) ||
          at.description.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || at.status === status;
        return matchesSearch && matchesStatus;
      }),
    [analysisTypes, search, status]
  );

  return {
    search,
    setSearch,
    status,
    setStatus,
    clearAllFilters,
    activeFilterBadges,
    filteredAnalysisTypes,
  };
}
