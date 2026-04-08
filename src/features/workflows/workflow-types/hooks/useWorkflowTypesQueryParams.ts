import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import type { FilterBadge } from '@/components/tables/FilterBar';
import type { WorkflowTypeDefinition } from '@/data/mockData';
import type { ExecutionEngineEnum, ValidationStateEnum } from '../../api/workflows.api';

export type ValidationState = ValidationStateEnum;
export type ExecutionEngine = ExecutionEngineEnum;

const PARAM_VALIDATION_STATE = 'wtValidationState';
const PARAM_TYPE_NAME = 'wtTypeName';
const PARAM_EXECUTION_ENGINE = 'wtExecutionEngine';

export const WORKFLOW_TYPES_FILTER_KEYS = [
  PARAM_VALIDATION_STATE,
  PARAM_TYPE_NAME,
  PARAM_EXECUTION_ENGINE,
] as const;

export type WorkflowTypesFilterKey = (typeof WORKFLOW_TYPES_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<WorkflowTypesFilterKey, string> = {
  [PARAM_VALIDATION_STATE]: '',
  [PARAM_TYPE_NAME]: '',
  [PARAM_EXECUTION_ENGINE]: '',
};

export type WorkflowTypesFilterPatch = Partial<{
  wtValidationState: string | string[];
  wtTypeName: string | string[];
  wtExecutionEngine: string | string[];
}>;

export interface UseWorkflowTypesQueryParamsOptions {
  workflowTypes?: WorkflowTypeDefinition[];
}

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

/**
 * Workflow types list page state driven by URL query params.
 * Filter params: wtValidationState, wtTypeName, wtExecutionEngine. Shared: search, orderBy, pagination.
 */
export function useWorkflowTypesQueryParams(options: UseWorkflowTypesQueryParamsOptions = {}) {
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
      [PARAM_VALIDATION_STATE]: toFirstString(
        params[PARAM_VALIDATION_STATE] as string | string[] | undefined
      ),
      [PARAM_TYPE_NAME]: toFirstString(params[PARAM_TYPE_NAME] as string | string[] | undefined),
      [PARAM_EXECUTION_ENGINE]: toFirstString(
        params[PARAM_EXECUTION_ENGINE] as string | string[] | undefined
      ),
    }),
    [params]
  );

  const setFilterValues = useCallback(
    (patch: WorkflowTypesFilterPatch) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;

      const nextValidationState =
        patch.wtValidationState !== undefined
          ? str(patch.wtValidationState)
          : filterValues[PARAM_VALIDATION_STATE];
      const nextTypeName =
        patch.wtTypeName !== undefined ? str(patch.wtTypeName) : filterValues[PARAM_TYPE_NAME];
      const nextExecutionEngine =
        patch.wtExecutionEngine !== undefined
          ? str(patch.wtExecutionEngine)
          : filterValues[PARAM_EXECUTION_ENGINE];

      setParams({
        [PARAM_VALIDATION_STATE]: nextValidationState || undefined,
        [PARAM_TYPE_NAME]: nextTypeName || undefined,
        [PARAM_EXECUTION_ENGINE]: nextExecutionEngine || undefined,
      });
    },
    [setParams, filterValues]
  );

  const workflowTypesQueryParams = useMemo(() => {
    const validationState = filterValues[PARAM_VALIDATION_STATE];

    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: search || undefined,
      name: filterValues[PARAM_TYPE_NAME] || undefined,
      executionEngine: (filterValues[PARAM_EXECUTION_ENGINE] || undefined) as
        | ExecutionEngineEnum
        | undefined,
      validationState: validationState
        ? (validationState.toUpperCase() as Uppercase<ValidationState>)
        : undefined,
      ordering: orderBy || undefined,
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(WORKFLOW_TYPES_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const validationState = (
    !filterValues[PARAM_VALIDATION_STATE] || filterValues[PARAM_VALIDATION_STATE] === 'all'
      ? 'all'
      : filterValues[PARAM_VALIDATION_STATE]
  ) as ValidationState | 'all';

  const setValidationState = useCallback(
    (value: ValidationState | 'all') =>
      setFilterValues({ wtValidationState: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const setTypeName = useCallback(
    (value: string) => setFilterValues({ wtTypeName: value === 'all' ? '' : value }),
    [setFilterValues]
  );

  const setExecutionEngine = useCallback(
    (value: string) => setFilterValues({ wtExecutionEngine: value === 'all' ? '' : value }),
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
    if (validationState !== 'all') {
      badges.push({
        id: PARAM_VALIDATION_STATE,
        type: 'filter',
        label: 'Validation',
        value: validationState.charAt(0).toUpperCase() + validationState.slice(1),
        onRemove: () => setValidationState('all'),
      });
    }
    if (filterValues[PARAM_TYPE_NAME]) {
      badges.push({
        id: PARAM_TYPE_NAME,
        type: 'filter',
        label: 'Type',
        value: filterValues[PARAM_TYPE_NAME],
        onRemove: () => setTypeName(''),
      });
    }
    if (filterValues[PARAM_EXECUTION_ENGINE]) {
      badges.push({
        id: PARAM_EXECUTION_ENGINE,
        type: 'filter',
        label: 'Engine',
        value: filterValues[PARAM_EXECUTION_ENGINE],
        onRemove: () => setExecutionEngine(''),
      });
    }
    return badges;
  }, [
    search,
    validationState,
    filterValues,
    setSearchQuery,
    setValidationState,
    setTypeName,
    setExecutionEngine,
  ]);

  const filteredWorkflowTypes = useMemo(() => {
    const source = options.workflowTypes ?? [];
    return source.filter((wt) => {
      const matchesSearch =
        wt.name.toLowerCase().includes(search.toLowerCase()) ||
        wt.id.toLowerCase().includes(search.toLowerCase()) ||
        wt.version.toLowerCase().includes(search.toLowerCase());
      const matchesValidationState =
        validationState === 'all' ||
        wt.validationState.toLowerCase() === validationState.toLowerCase();
      const matchesTypeName =
        !filterValues[PARAM_TYPE_NAME] || wt.name === filterValues[PARAM_TYPE_NAME];
      const matchesExecutionEngine =
        !filterValues[PARAM_EXECUTION_ENGINE] ||
        wt.executionEngine === filterValues[PARAM_EXECUTION_ENGINE];
      return matchesSearch && matchesValidationState && matchesTypeName && matchesExecutionEngine;
    });
  }, [options.workflowTypes, search, validationState, filterValues]);

  const workflowTypeNames = useMemo(
    () => Array.from(new Set((options.workflowTypes ?? []).map((wt) => wt.name))),
    [options.workflowTypes]
  );

  return {
    search,
    setSearch: setSearchQuery,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    workflowTypesQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    validationState,
    ValidationState: validationState,
    setValidationState,
    typeName: filterValues[PARAM_TYPE_NAME],
    setTypeName,
    executionEngine: filterValues[PARAM_EXECUTION_ENGINE],
    setExecutionEngine,
    activeFilterBadges,
    filteredWorkflowTypes,
    workflowTypeNames,
  };
}
