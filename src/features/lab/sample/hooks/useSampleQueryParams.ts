import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { SampleListQueryParams } from '../../shared/api/lab.api';
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
const PARAM_SAMPLE_ID = 'sampleId';
const PARAM_INDIVIDUAL_ID = 'individualId';
const PARAM_LIBRARY_ID = 'libraryId';

export const SAMPLE_FILTER_KEYS = [
  PARAM_ORCABUS_ID,
  PARAM_SAMPLE_ID,
  PARAM_INDIVIDUAL_ID,
  PARAM_LIBRARY_ID,
] as const;

export type SampleFilterKey = (typeof SAMPLE_FILTER_KEYS)[number];
export type SampleFilterValues = Record<SampleFilterKey, string>;

const DEFAULT_FILTER_VALUES: SampleFilterValues = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_SAMPLE_ID]: '',
  [PARAM_INDIVIDUAL_ID]: '',
  [PARAM_LIBRARY_ID]: '',
};

type QueryParamRecord = Record<string, string | string[] | undefined>;

interface CreateSampleListQueryParamsArgs {
  filterValues: SampleFilterValues;
  search: string;
  pagination: {
    page: number;
    rowsPerPage: number;
  };
  orderBy: string;
}

export function createSampleFilterValues(params: QueryParamRecord): SampleFilterValues {
  return {
    ...DEFAULT_FILTER_VALUES,
    [PARAM_ORCABUS_ID]: toFilterDisplayValue(params[PARAM_ORCABUS_ID]),
    [PARAM_SAMPLE_ID]: toFilterDisplayValue(params[PARAM_SAMPLE_ID]),
    [PARAM_INDIVIDUAL_ID]: toFilterDisplayValue(params[PARAM_INDIVIDUAL_ID]),
    [PARAM_LIBRARY_ID]: toFilterDisplayValue(params[PARAM_LIBRARY_ID]),
  };
}

export function createSampleListQueryParams({
  filterValues,
  search,
  pagination,
  orderBy,
}: CreateSampleListQueryParamsArgs): SampleListQueryParams {
  const query = {
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    search: toSearchApiQueryValue(search),
    ordering: orderBy || undefined,
    orcabusId: toApiCsvQueryValue(filterValues.orcabusId),
    sampleId: toApiCsvQueryValue(filterValues.sampleId),
    individualId: toApiCsvQueryValue(filterValues.individualId),
    libraryId: toApiCsvQueryValue(filterValues.libraryId),
  };

  return query as SampleListQueryParams;
}

/**
 * Sample list page state driven by URL query params.
 * Params: search, filters, sorting, and server-side pagination.
 */
export function useSampleQueryParams() {
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

  const filterValues = useMemo<SampleFilterValues>(
    () => createSampleFilterValues(params),
    [params]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      setParams({
        [PARAM_ORCABUS_ID]: toFilterQueryValue(values[PARAM_ORCABUS_ID]),
        [PARAM_SAMPLE_ID]: toFilterQueryValue(values[PARAM_SAMPLE_ID]),
        [PARAM_INDIVIDUAL_ID]: toFilterQueryValue(values[PARAM_INDIVIDUAL_ID]),
        [PARAM_LIBRARY_ID]: toFilterQueryValue(values[PARAM_LIBRARY_ID]),
      });
    },
    [setParams]
  );

  const sampleListQueryParams = useMemo(
    () =>
      createSampleListQueryParams({
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
      ...Object.fromEntries(SAMPLE_FILTER_KEYS.map((key) => [key, undefined])),
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
    sampleListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
