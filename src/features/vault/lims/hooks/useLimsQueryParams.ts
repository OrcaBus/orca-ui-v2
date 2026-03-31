import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { Library } from '@/data/mockData';

const PARAM_SEARCH = 'limsSearch';
const PARAM_TYPE = 'limsType';

export interface UseLimsQueryParamsOptions {
  libraries: Library[];
}

/**
 * LIMS (libraries) list state driven by URL query params.
 * Params: limsSearch, limsType.
 */
export function useLimsQueryParams({ libraries }: UseLimsQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const typeFilter = getParam(PARAM_TYPE) ?? 'all';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setTypeFilter = useCallback(
    (v: string) => setParams({ [PARAM_TYPE]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_TYPE]: undefined,
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
    if (typeFilter !== 'all') {
      badges.push({
        id: PARAM_TYPE,
        type: 'filter',
        label: 'Type',
        value: typeFilter,
        onRemove: () => setTypeFilter('all'),
      });
    }
    return badges;
  }, [search, typeFilter, setSearch, setTypeFilter]);

  const filteredLibraries = useMemo(
    () =>
      libraries.filter((lib) => {
        const matchesSearch =
          lib.name.toLowerCase().includes(search.toLowerCase()) ||
          lib.sampleId.toLowerCase().includes(search.toLowerCase()) ||
          lib.id.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || lib.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [libraries, search, typeFilter]
  );

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredLibraries,
  };
}
