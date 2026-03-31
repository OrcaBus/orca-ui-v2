import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { WorkflowRun } from '@/data/mockData';
import { matchesDateRange } from '../utils/matchesDateRange';

export type WorkflowRunStatus =
  | 'succeeded'
  | 'failed'
  | 'aborted'
  | 'resolved'
  | 'deprecated'
  | 'ongoing';

const PARAM_SEARCH = 'wfSearch';
const PARAM_STATUS = 'wfStatus';
const PARAM_TYPE = 'wfType';
const PARAM_FROM = 'wfFrom';
const PARAM_TO = 'wfTo';

export interface UseWorkflowRunsQueryParamsOptions {
  workflowRuns: WorkflowRun[];
}

/**
 * Workflow runs list page state driven by URL query params.
 * Params: wfSearch, wfStatus, wfType (array), wfFrom, wfTo.
 */
export function useWorkflowRunsQueryParams({ workflowRuns }: UseWorkflowRunsQueryParamsOptions) {
  const { getParam, getArrayParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const status = (getParam(PARAM_STATUS) ?? 'all') as WorkflowRunStatus | 'all';
  const typeValues = getArrayParam(PARAM_TYPE);
  const dateFrom = getParam(PARAM_FROM) ?? '';
  const dateTo = getParam(PARAM_TO) ?? '';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setStatus = useCallback(
    (v: WorkflowRunStatus | 'all') => setParams({ [PARAM_STATUS]: v === 'all' ? undefined : v }),
    [setParams]
  );
  const setTypeValues = useCallback(
    (v: string[]) => setParams({ [PARAM_TYPE]: v.length ? v : undefined }),
    [setParams]
  );
  const setDateFrom = useCallback(
    (v: string) => setParams({ [PARAM_FROM]: v || undefined }),
    [setParams]
  );
  const setDateTo = useCallback(
    (v: string) => setParams({ [PARAM_TO]: v || undefined }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_STATUS]: undefined,
        [PARAM_TYPE]: undefined,
        [PARAM_FROM]: undefined,
        [PARAM_TO]: undefined,
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
    typeValues.forEach((t) => {
      badges.push({
        id: `${PARAM_TYPE}-${t}`,
        type: 'filter',
        label: 'Type',
        value: t,
        onRemove: () => setTypeValues(typeValues.filter((x) => x !== t)),
      });
    });
    if (dateFrom) {
      badges.push({
        id: PARAM_FROM,
        type: 'range',
        label: 'From',
        value: dateFrom,
        onRemove: () => setDateFrom(''),
      });
    }
    if (dateTo) {
      badges.push({
        id: PARAM_TO,
        type: 'range',
        label: 'To',
        value: dateTo,
        onRemove: () => setDateTo(''),
      });
    }
    return badges;
  }, [
    search,
    status,
    typeValues,
    dateFrom,
    dateTo,
    setSearch,
    setStatus,
    setTypeValues,
    setDateFrom,
    setDateTo,
  ]);

  const filteredWorkflowRuns = useMemo(
    () =>
      workflowRuns.filter((wf) => {
        const matchesSearch =
          wf.name.toLowerCase().includes(search.toLowerCase()) ||
          wf.portalRunId.toLowerCase().includes(search.toLowerCase()) ||
          wf.executionId.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = status === 'all' || wf.status === status;
        const matchesType = typeValues.length === 0 || typeValues.includes(wf.workflowType);
        const matchesTime = matchesDateRange(wf.lastModified, dateFrom, dateTo);
        return matchesSearch && matchesStatus && matchesType && matchesTime;
      }),
    [workflowRuns, search, status, typeValues, dateFrom, dateTo]
  );

  const workflowTypeOptions = useMemo(
    () => Array.from(new Set(workflowRuns.map((wf) => wf.workflowType))),
    [workflowRuns]
  );

  return {
    search,
    setSearch,
    status,
    setStatus,
    typeValues,
    setTypeValues,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflowRuns,
    workflowTypeOptions,
  };
}
