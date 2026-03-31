import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { AnalysisRun } from '@/data/mockData';

export type AnalysisRunStatus =
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing';

const PARAM_SEARCH = 'arSearch';
const PARAM_STATUS = 'arStatus';
const PARAM_TYPE = 'arType';

export interface UseAnalysisRunsQueryParamsOptions {
  analysisRuns: AnalysisRun[];
}

/**
 * Analysis runs list page state driven by URL query params.
 * Params: arSearch, arStatus, arType.
 */
export function useAnalysisRunsQueryParams({ analysisRuns }: UseAnalysisRunsQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const status = (getParam(PARAM_STATUS) ?? 'all') as AnalysisRunStatus | 'all';
  const typeValue = getParam(PARAM_TYPE) ?? 'all';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setStatus = useCallback(
    (v: AnalysisRunStatus | 'all') => setParams({ [PARAM_STATUS]: v === 'all' ? undefined : v }),
    [setParams]
  );
  const setTypeValue = useCallback(
    (v: string) => setParams({ [PARAM_TYPE]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_STATUS]: undefined,
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
    if (status !== 'all') {
      badges.push({
        id: PARAM_STATUS,
        type: 'filter',
        label: 'Status',
        value: status.charAt(0).toUpperCase() + status.slice(1),
        onRemove: () => setStatus('all'),
      });
    }
    if (typeValue !== 'all') {
      badges.push({
        id: PARAM_TYPE,
        type: 'filter',
        label: 'Type',
        value: typeValue,
        onRemove: () => setTypeValue('all'),
      });
    }
    return badges;
  }, [search, status, typeValue, setSearch, setStatus, setTypeValue]);

  const filteredAnalysisRuns = useMemo(
    () =>
      analysisRuns.filter((ar) => {
        const matchesSearch =
          ar.name.toLowerCase().includes(search.toLowerCase()) ||
          ar.analysisId.toLowerCase().includes(search.toLowerCase()) ||
          ar.analysisType.toLowerCase().includes(search.toLowerCase()) ||
          ar.analysisName.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || ar.status === status;
        const matchesType =
          typeValue === 'all' || `${ar.analysisName} ${ar.analysisVersion}` === typeValue;
        return matchesSearch && matchesStatus && matchesType;
      }),
    [analysisRuns, search, status, typeValue]
  );

  const analysisTypeOptions = useMemo(
    () => Array.from(new Set(analysisRuns.map((ar) => `${ar.analysisName} ${ar.analysisVersion}`))),
    [analysisRuns]
  );

  return {
    search,
    setSearch,
    status,
    setStatus,
    typeValue,
    setTypeValue,
    clearAllFilters,
    activeFilterBadges,
    filteredAnalysisRuns,
    analysisTypeOptions,
  };
}
