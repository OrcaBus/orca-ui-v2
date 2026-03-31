import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { File } from '@/data/mockData';

const PARAM_SEARCH = 'bamsSearch';
const PARAM_SIZE = 'bamsSize';

export type BamsSizeFilter = 'all' | 'small' | 'medium' | 'large';

export interface UseBamsQueryParamsOptions {
  bamFiles: File[];
}

/**
 * BAMs list state driven by URL query params.
 * Params: bamsSearch, bamsSize (all | small | medium | large).
 */
export function useBamsQueryParams({ bamFiles }: UseBamsQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const sizeFilter = (getParam(PARAM_SIZE) ?? 'all') as BamsSizeFilter;

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setSizeFilter = useCallback(
    (v: BamsSizeFilter) => setParams({ [PARAM_SIZE]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_SIZE]: undefined,
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
    if (sizeFilter !== 'all') {
      const label =
        sizeFilter === 'small' ? '< 10 GB' : sizeFilter === 'medium' ? '10 - 50 GB' : '> 50 GB';
      badges.push({
        id: PARAM_SIZE,
        type: 'filter',
        label: 'Size',
        value: label,
        onRemove: () => setSizeFilter('all'),
      });
    }
    return badges;
  }, [search, sizeFilter, setSearch, setSizeFilter]);

  const filteredBams = useMemo(
    () =>
      bamFiles.filter((file) => {
        const matchesSearch =
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.s3Key.toLowerCase().includes(search.toLowerCase()) ||
          (file.portalRunId && file.portalRunId.toLowerCase().includes(search.toLowerCase()));

        let matchesSize = true;
        if (sizeFilter === 'small') {
          matchesSize = file.sizeBytes < 10_000_000_000;
        } else if (sizeFilter === 'medium') {
          matchesSize = file.sizeBytes >= 10_000_000_000 && file.sizeBytes < 50_000_000_000;
        } else if (sizeFilter === 'large') {
          matchesSize = file.sizeBytes >= 50_000_000_000;
        }
        return matchesSearch && matchesSize;
      }),
    [bamFiles, search, sizeFilter]
  );

  return {
    search,
    setSearch,
    sizeFilter,
    setSizeFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredBams,
  };
}
