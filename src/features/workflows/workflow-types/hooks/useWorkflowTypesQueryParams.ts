import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { WorkflowTypeDefinition } from '@/data/mockData';

export type ValidationState = 'validated' | 'unvalidated' | 'deprecated' | 'failed';

const PARAM_SEARCH = 'wtSearch';
const PARAM_VALIDATION_STATE = 'wtValidationState';
const PARAM_TYPE_NAME = 'wtTypeName';
const PARAM_EXECUTION_ENGINE = 'wtExecutionEngine';

export interface UseWorkflowTypesQueryParamsOptions {
  workflowTypes: WorkflowTypeDefinition[];
}

/**
 * Workflow types list page state driven by URL query params.
 * Params: wtSearch, wtValidationState, wtTypeName, wtExecutionEngine.
 */
export function useWorkflowTypesQueryParams({ workflowTypes }: UseWorkflowTypesQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const search = getParam(PARAM_SEARCH) ?? '';
  const validationState = (getParam(PARAM_VALIDATION_STATE) ?? 'all') as ValidationState | 'all';
  const typeName = getParam(PARAM_TYPE_NAME) ?? 'all';
  const executionEngine = getParam(PARAM_EXECUTION_ENGINE) ?? 'all';

  const setSearch = useCallback(
    (v: string) => setParams({ [PARAM_SEARCH]: v || undefined }),
    [setParams]
  );
  const setValidationState = useCallback(
    (v: ValidationState | 'all') =>
      setParams({ [PARAM_VALIDATION_STATE]: v === 'all' ? undefined : v }),
    [setParams]
  );
  const setTypeName = useCallback(
    (v: string) => setParams({ [PARAM_TYPE_NAME]: v === 'all' ? undefined : v }),
    [setParams]
  );
  const setExecutionEngine = useCallback(
    (v: string) => setParams({ [PARAM_EXECUTION_ENGINE]: v === 'all' ? undefined : v }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_VALIDATION_STATE]: undefined,
        [PARAM_TYPE_NAME]: undefined,
        [PARAM_EXECUTION_ENGINE]: undefined,
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
    if (validationState !== 'all') {
      badges.push({
        id: PARAM_VALIDATION_STATE,
        type: 'filter',
        label: 'Validation',
        value: validationState.charAt(0).toUpperCase() + validationState.slice(1),
        onRemove: () => setValidationState('all'),
      });
    }
    if (typeName !== 'all') {
      badges.push({
        id: PARAM_TYPE_NAME,
        type: 'filter',
        label: 'Type',
        value: typeName,
        onRemove: () => setTypeName('all'),
      });
    }
    if (executionEngine !== 'all') {
      badges.push({
        id: PARAM_EXECUTION_ENGINE,
        type: 'filter',
        label: 'Engine',
        value: executionEngine,
        onRemove: () => setExecutionEngine('all'),
      });
    }
    return badges;
  }, [
    search,
    validationState,
    typeName,
    executionEngine,
    setSearch,
    setValidationState,
    setTypeName,
    setExecutionEngine,
  ]);

  const filteredWorkflowTypes = useMemo(
    () =>
      workflowTypes.filter((wt) => {
        const matchesSearch =
          wt.name.toLowerCase().includes(search.toLowerCase()) ||
          wt.id.toLowerCase().includes(search.toLowerCase()) ||
          wt.version.toLowerCase().includes(search.toLowerCase());
        const matchesValidationState =
          validationState === 'all' || wt.validationState === validationState;
        const matchesTypeName = typeName === 'all' || wt.name === typeName;
        const matchesExecutionEngine =
          executionEngine === 'all' || wt.executionEngine === executionEngine;
        return matchesSearch && matchesValidationState && matchesTypeName && matchesExecutionEngine;
      }),
    [workflowTypes, search, validationState, typeName, executionEngine]
  );

  const workflowTypeNames = useMemo(
    () => Array.from(new Set(workflowTypes.map((wt) => wt.name))),
    [workflowTypes]
  );

  return {
    search,
    setSearch,
    validationState,
    setValidationState,
    typeName,
    setTypeName,
    executionEngine,
    setExecutionEngine,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflowTypes,
    workflowTypeNames,
  };
}
