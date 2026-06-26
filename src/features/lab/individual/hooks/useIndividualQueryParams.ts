import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { IndividualListQueryParams } from '../../shared/api/lab.api';
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
const PARAM_INDIVIDUAL_ID = 'individualId';

export const INDIVIDUAL_FILTER_KEYS = [PARAM_ORCABUS_ID, PARAM_INDIVIDUAL_ID] as const;

export type IndividualFilterKey = (typeof INDIVIDUAL_FILTER_KEYS)[number];
export type IndividualFilterValues = Record<IndividualFilterKey, string>;

const DEFAULT_FILTER_VALUES: IndividualFilterValues = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_INDIVIDUAL_ID]: '',
};

type QueryParamRecord = Record<string, string | string[] | undefined>;

interface CreateIndividualListQueryParamsArgs {
  filterValues: IndividualFilterValues;
  search: string;
  pagination: {
    page: number;
    rowsPerPage: number;
  };
  orderBy: string;
}

export function createIndividualFilterValues(params: QueryParamRecord): IndividualFilterValues {
  return {
    ...DEFAULT_FILTER_VALUES,
    [PARAM_ORCABUS_ID]: toFilterDisplayValue(params[PARAM_ORCABUS_ID]),
    [PARAM_INDIVIDUAL_ID]: toFilterDisplayValue(params[PARAM_INDIVIDUAL_ID]),
  };
}

export function createIndividualListQueryParams({
  filterValues,
  search,
  pagination,
  orderBy,
}: CreateIndividualListQueryParamsArgs): IndividualListQueryParams {
  const query = {
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    search: toSearchApiQueryValue(search),
    ordering: orderBy || undefined,
    orcabusId: toApiCsvQueryValue(filterValues.orcabusId),
    individualId: toApiCsvQueryValue(filterValues.individualId),
  };

  return query as IndividualListQueryParams;
}

/**
 * Individual list page state driven by URL query params.
 * Params: search, filters, sorting, and server-side pagination.
 */
export function useIndividualQueryParams() {
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

  const filterValues = useMemo<IndividualFilterValues>(
    () => createIndividualFilterValues(params),
    [params]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      setParams({
        [PARAM_ORCABUS_ID]: toFilterQueryValue(values[PARAM_ORCABUS_ID]),
        [PARAM_INDIVIDUAL_ID]: toFilterQueryValue(values[PARAM_INDIVIDUAL_ID]),
      });
    },
    [setParams]
  );

  const individualListQueryParams = useMemo(
    () =>
      createIndividualListQueryParams({
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
      ...Object.fromEntries(INDIVIDUAL_FILTER_KEYS.map((key) => [key, undefined])),
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
    individualListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
