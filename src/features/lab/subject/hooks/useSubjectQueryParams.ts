import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { SubjectListQueryParams } from '../../shared/api/lab.api';
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
const PARAM_SUBJECT_ID = 'subjectId';
const PARAM_INDIVIDUAL_ID = 'individualId';
const PARAM_LIBRARY_ID = 'libraryId';

export const SUBJECT_FILTER_KEYS = [
  PARAM_ORCABUS_ID,
  PARAM_SUBJECT_ID,
  PARAM_INDIVIDUAL_ID,
  PARAM_LIBRARY_ID,
] as const;

export type SubjectFilterKey = (typeof SUBJECT_FILTER_KEYS)[number];
export type SubjectFilterValues = Record<SubjectFilterKey, string>;

const DEFAULT_FILTER_VALUES: SubjectFilterValues = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_SUBJECT_ID]: '',
  [PARAM_INDIVIDUAL_ID]: '',
  [PARAM_LIBRARY_ID]: '',
};

type QueryParamRecord = Record<string, string | string[] | undefined>;

interface CreateSubjectListQueryParamsArgs {
  filterValues: SubjectFilterValues;
  search: string;
  pagination: {
    page: number;
    rowsPerPage: number;
  };
  orderBy: string;
}

export function createSubjectFilterValues(params: QueryParamRecord): SubjectFilterValues {
  return {
    ...DEFAULT_FILTER_VALUES,
    [PARAM_ORCABUS_ID]: toFilterDisplayValue(params[PARAM_ORCABUS_ID]),
    [PARAM_SUBJECT_ID]: toFilterDisplayValue(params[PARAM_SUBJECT_ID]),
    [PARAM_INDIVIDUAL_ID]: toFilterDisplayValue(params[PARAM_INDIVIDUAL_ID]),
    [PARAM_LIBRARY_ID]: toFilterDisplayValue(params[PARAM_LIBRARY_ID]),
  };
}

export function createSubjectListQueryParams({
  filterValues,
  search,
  pagination,
  orderBy,
}: CreateSubjectListQueryParamsArgs): SubjectListQueryParams {
  const query = {
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    search: toSearchApiQueryValue(search),
    ordering: orderBy || undefined,
    orcabusId: toApiCsvQueryValue(filterValues.orcabusId),
    subjectId: toApiCsvQueryValue(filterValues.subjectId),
    individualId: toApiCsvQueryValue(filterValues.individualId),
    libraryId: toApiCsvQueryValue(filterValues.libraryId),
  };

  return query as SubjectListQueryParams;
}

/**
 * Subject list page state driven by URL query params.
 * Params: search, filters, sorting, and server-side pagination.
 */
export function useSubjectQueryParams() {
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

  const filterValues = useMemo<SubjectFilterValues>(
    () => createSubjectFilterValues(params),
    [params]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      setParams({
        [PARAM_ORCABUS_ID]: toFilterQueryValue(values[PARAM_ORCABUS_ID]),
        [PARAM_SUBJECT_ID]: toFilterQueryValue(values[PARAM_SUBJECT_ID]),
        [PARAM_INDIVIDUAL_ID]: toFilterQueryValue(values[PARAM_INDIVIDUAL_ID]),
        [PARAM_LIBRARY_ID]: toFilterQueryValue(values[PARAM_LIBRARY_ID]),
      });
    },
    [setParams]
  );

  const subjectListQueryParams = useMemo(
    () =>
      createSubjectListQueryParams({
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
      ...Object.fromEntries(SUBJECT_FILTER_KEYS.map((key) => [key, undefined])),
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
    subjectListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
