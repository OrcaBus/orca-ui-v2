import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { ProjectListQueryParams } from '../../shared/api/lab.api';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import {
  toApiCsvQueryValue,
  toFilterDisplayValue,
  toFilterQueryValue,
  toSearchApiQueryValue,
  toSearchDisplayValue,
  toSearchQueryValue,
} from '@/utils/queryParams';

const PARAM_ORCABUS_ID = 'orcabusId';
const PARAM_PROJECT_ID = 'projectId';
const PARAM_NAME = 'name';

export const PROJECT_FILTER_KEYS = [PARAM_ORCABUS_ID, PARAM_PROJECT_ID, PARAM_NAME] as const;

export type ProjectFilterKey = (typeof PROJECT_FILTER_KEYS)[number];
export type ProjectFilterValues = Record<ProjectFilterKey, string>;

const DEFAULT_FILTER_VALUES: ProjectFilterValues = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_PROJECT_ID]: '',
  [PARAM_NAME]: '',
};

type QueryParamRecord = Record<string, string | string[] | undefined>;

interface CreateProjectListQueryParamsArgs {
  filterValues: ProjectFilterValues;
  search: string;
  pagination: {
    page: number;
    rowsPerPage: number;
  };
  orderBy: string;
}

export function createProjectFilterValues(params: QueryParamRecord): ProjectFilterValues {
  return {
    ...DEFAULT_FILTER_VALUES,
    [PARAM_ORCABUS_ID]: toFilterDisplayValue(params[PARAM_ORCABUS_ID]),
    [PARAM_PROJECT_ID]: toFilterDisplayValue(params[PARAM_PROJECT_ID]),
    [PARAM_NAME]: toFilterDisplayValue(params[PARAM_NAME]),
  };
}

export function createProjectListQueryParams({
  filterValues,
  search,
  pagination,
  orderBy,
}: CreateProjectListQueryParamsArgs): ProjectListQueryParams {
  const query = {
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    search: toSearchApiQueryValue(search),
    ordering: orderBy || undefined,
    orcabusId: toApiCsvQueryValue(filterValues.orcabusId),
    projectId: toApiCsvQueryValue(filterValues.projectId),
    name: toApiCsvQueryValue(filterValues.name),
  };

  return query as ProjectListQueryParams;
}

/**
 * Project list page state driven by URL query params.
 * Params: search, filters, sorting, and server-side pagination.
 */
export function useProjectQueryParams() {
  const {
    params,
    setParams,
    pagination,
    orderBy,
    setPage,
    setRowsPerPage,
    setOrderBy,
    getOrderDirection,
  } = useQueryParams();

  const search = useMemo(
    () => toSearchDisplayValue(params[PARAM_SEARCH] as string | string[] | undefined),
    [params]
  );

  const setSearchQuery = useCallback(
    (value: string) => setParams({ [PARAM_SEARCH]: toSearchQueryValue(value) }),
    [setParams]
  );

  const filterValues = useMemo<ProjectFilterValues>(
    () => createProjectFilterValues(params),
    [params]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      setParams({
        [PARAM_ORCABUS_ID]: toFilterQueryValue(values[PARAM_ORCABUS_ID]),
        [PARAM_PROJECT_ID]: toFilterQueryValue(values[PARAM_PROJECT_ID]),
        [PARAM_NAME]: toFilterQueryValue(values[PARAM_NAME]),
      });
    },
    [setParams]
  );

  const projectListQueryParams = useMemo(
    () =>
      createProjectListQueryParams({
        filterValues,
        search,
        pagination,
        orderBy,
      }),
    [filterValues, pagination, search, orderBy]
  );

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(PROJECT_FILTER_KEYS.map((key) => [key, undefined])),
    });
  }, [setParams]);

  return {
    search,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    projectListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
