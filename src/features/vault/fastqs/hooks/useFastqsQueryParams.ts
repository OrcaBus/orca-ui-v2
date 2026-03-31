import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { File } from '@/data/mockData';

const PARAM_SEARCH = 'fastqsSearch';
const PARAM_FORMAT = 'fastqsFormat';

export type FastqsFormatFilter = 'all' | 'gzip' | 'ora';

export interface UseFastqsQueryParamsOptions {
  fastqFiles: File[];
}

/**
 * FASTQs list state driven by URL query params.
 * Params: fastqsSearch, fastqsFormat (all | gzip | ora).
 */
export function useFastqsQueryParams({ fastqFiles }: UseFastqsQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const formatFilter = (getParam(PARAM_FORMAT) ?? 'all') as FastqsFormatFilter;

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setFormatFilter = useCallback(
    (v: FastqsFormatFilter) => setParams({ [PARAM_FORMAT]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_FORMAT]: undefined,
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
    if (formatFilter !== 'all') {
      const label = formatFilter === 'gzip' ? 'Gzip Compressed' : 'ORA Format';
      badges.push({
        id: PARAM_FORMAT,
        type: 'filter',
        label: 'Format',
        value: label,
        onRemove: () => setFormatFilter('all'),
      });
    }
    return badges;
  }, [search, formatFilter, setSearch, setFormatFilter]);

  const filteredFastqs = useMemo(
    () =>
      fastqFiles.filter((file) => {
        const matchesSearch =
          file.name.toLowerCase().includes(search.toLowerCase()) ||
          file.s3Key.toLowerCase().includes(search.toLowerCase()) ||
          (file.portalRunId && file.portalRunId.toLowerCase().includes(search.toLowerCase()));

        let matchesFormat = true;
        if (formatFilter === 'gzip') {
          matchesFormat = file.name.endsWith('.gz');
        } else if (formatFilter === 'ora') {
          matchesFormat = file.name.endsWith('.ora');
        }
        return matchesSearch && matchesFormat;
      }),
    [fastqFiles, search, formatFilter]
  );

  return {
    search,
    setSearch,
    formatFilter,
    setFormatFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredFastqs,
  };
}
