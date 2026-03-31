import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { WorkflowRun } from '@/data/mockData';

const PARAM_SEARCH = 'vaultWfSearch';
const PARAM_TYPE = 'vaultWfType';
const PARAM_STATUS = 'vaultWfStatus';

export interface UseVaultWorkflowsQueryParamsOptions {
  workflowRuns: WorkflowRun[];
}

/**
 * Vault workflows list state driven by URL query params.
 * Params: vaultWfSearch, vaultWfType, vaultWfStatus.
 */
export function useVaultWorkflowsQueryParams({
  workflowRuns,
}: UseVaultWorkflowsQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const typeFilter = getParam(PARAM_TYPE) ?? 'all';
  const statusFilter = getParam(PARAM_STATUS) ?? 'all';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setTypeFilter = useCallback(
    (v: string) => setParams({ [PARAM_TYPE]: v === 'all' ? undefined : v }),
    [setParams]
  );
  const setStatusFilter = useCallback(
    (v: string) => setParams({ [PARAM_STATUS]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_TYPE]: undefined,
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
    if (typeFilter !== 'all') {
      badges.push({
        id: PARAM_TYPE,
        type: 'filter',
        label: 'Type',
        value: typeFilter,
        onRemove: () => setTypeFilter('all'),
      });
    }
    if (statusFilter !== 'all') {
      badges.push({
        id: PARAM_STATUS,
        type: 'filter',
        label: 'Status',
        value: statusFilter,
        onRemove: () => setStatusFilter('all'),
      });
    }
    return badges;
  }, [search, typeFilter, statusFilter, setSearch, setTypeFilter, setStatusFilter]);

  const filteredWorkflows = useMemo(
    () =>
      workflowRuns.filter((wf) => {
        const matchesSearch =
          wf.name.toLowerCase().includes(search.toLowerCase()) ||
          wf.workflowType.toLowerCase().includes(search.toLowerCase()) ||
          wf.id.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || wf.workflowType === typeFilter;
        const matchesStatus = statusFilter === 'all' || wf.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      }),
    [workflowRuns, search, typeFilter, statusFilter]
  );

  const workflowTypes = useMemo(
    () => Array.from(new Set(workflowRuns.map((w) => w.workflowType))),
    [workflowRuns]
  );

  return {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflows,
    workflowTypes,
  };
}
