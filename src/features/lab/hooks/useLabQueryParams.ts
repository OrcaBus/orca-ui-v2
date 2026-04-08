import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import type { LibraryListQueryParams } from '../api/lab.api';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';

type LibraryListQuery = NonNullable<LibraryListQueryParams>;

const PARAM_ORCABUS_ID = 'orcabusId';
const PARAM_LIBRARY_ID = 'libraryId';
const PARAM_ASSAY = 'assay';
const PARAM_INDIVIDUAL_ID = 'individualId';
const PARAM_PROJECT_ID = 'projectId';
const PARAM_PHENOTYPE = 'phenotype';
const PARAM_QUALITY = 'quality';
const PARAM_TYPE = 'type';
const PARAM_WORKFLOW = 'workflow';
const PARAM_COVERAGE_MIN = 'coverageMin';
const PARAM_COVERAGE_MAX = 'coverageMax';

export const LAB_FILTER_KEYS = [
  PARAM_ORCABUS_ID,
  PARAM_LIBRARY_ID,
  PARAM_ASSAY,
  PARAM_INDIVIDUAL_ID,
  PARAM_PROJECT_ID,
  PARAM_PHENOTYPE,
  PARAM_QUALITY,
  PARAM_TYPE,
  PARAM_WORKFLOW,
  PARAM_COVERAGE_MIN,
  PARAM_COVERAGE_MAX,
] as const;

export type LabFilterKey = (typeof LAB_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<string, string> = {
  [PARAM_ORCABUS_ID]: '',
  [PARAM_LIBRARY_ID]: '',
  [PARAM_ASSAY]: '',
  [PARAM_INDIVIDUAL_ID]: '',
  [PARAM_PROJECT_ID]: '',
  [PARAM_PHENOTYPE]: '',
  [PARAM_QUALITY]: '',
  [PARAM_TYPE]: '',
  [PARAM_WORKFLOW]: '',
  [PARAM_COVERAGE_MIN]: '',
  [PARAM_COVERAGE_MAX]: '',
};

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

function parseCsvValues(value: string | string[] | undefined): string[] {
  if (value == null) return [];
  const values = Array.isArray(value) ? value : [value];
  return values
    .flatMap((entry) => entry.split(','))
    .map((v) => v.trim())
    .filter(Boolean);
}

function toCsvString(value: string | string[] | undefined): string {
  return parseCsvValues(value).join(',');
}

function toQueryParamValue(value: string | string[] | undefined): string | string[] | undefined {
  const values = parseCsvValues(value);
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

function toFirstCsvValue(value: string | string[] | undefined): string | undefined {
  const first = parseCsvValues(value)[0];
  return first || undefined;
}

function toNumberArray(value: string | string[] | undefined): number[] | undefined {
  const numbers = parseCsvValues(value)
    .map((v) => Number(v))
    .filter((n) => Number.isFinite(n));
  return numbers.length ? numbers : undefined;
}

function toNumber(value: string | string[] | undefined): number | undefined {
  const first = toFirstCsvValue(value);
  if (!first?.trim()) return undefined;
  const number = Number(first);
  return Number.isFinite(number) ? number : undefined;
}

function toStringOrArray(values: string[]): string | string[] | undefined {
  if (values.length === 0) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

function toSearchQueryValue(value: string): string | string[] | undefined {
  return toQueryParamValue(value);
}

function toFilterQueryValue(value: string | string[] | undefined): string | string[] | undefined {
  return toQueryParamValue(value);
}

function toCsvList(value: string | string[] | undefined): string[] {
  return parseCsvValues(value);
}

function toSearchDisplayValue(value: string | string[] | undefined): string {
  return toCsvString(value);
}

function toFilterDisplayValue(value: string | string[] | undefined): string {
  return toCsvString(value);
}

function toCoverageValue(value: string | string[] | undefined): string {
  return toFirstString(value);
}

function toProjectIdQueryValue(
  value: string | string[] | undefined
): number | number[] | undefined {
  const values = toNumberArray(value);
  if (!values?.length) return undefined;
  if (values.length === 1) return values[0];
  return values;
}

function toSearchApiQueryValue(value: string): string | string[] | undefined {
  const values = toCsvList(value);
  return toStringOrArray(values);
}

function toApiCsvQueryValue(value: string): string | string[] | undefined {
  const values = toCsvList(value);
  return toStringOrArray(values);
}

/**
 * Lab list page state driven by URL query params.
 * Params: search, filters, and server-side pagination.
 */
export function useLabQueryParams() {
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

  const filterValues = useMemo<Record<string, string>>(
    () => ({
      ...DEFAULT_FILTER_VALUES,
      [PARAM_ORCABUS_ID]: toFilterDisplayValue(
        params[PARAM_ORCABUS_ID] as string | string[] | undefined
      ),
      [PARAM_LIBRARY_ID]: toFilterDisplayValue(
        params[PARAM_LIBRARY_ID] as string | string[] | undefined
      ),
      [PARAM_ASSAY]: toFilterDisplayValue(params[PARAM_ASSAY] as string | string[] | undefined),
      [PARAM_INDIVIDUAL_ID]: toFilterDisplayValue(
        params[PARAM_INDIVIDUAL_ID] as string | string[] | undefined
      ),
      [PARAM_PROJECT_ID]: toFilterDisplayValue(
        params[PARAM_PROJECT_ID] as string | string[] | undefined
      ),
      [PARAM_PHENOTYPE]: toFilterDisplayValue(
        params[PARAM_PHENOTYPE] as string | string[] | undefined
      ),
      [PARAM_QUALITY]: toFilterDisplayValue(params[PARAM_QUALITY] as string | string[] | undefined),
      [PARAM_TYPE]: toFilterDisplayValue(params[PARAM_TYPE] as string | string[] | undefined),
      [PARAM_WORKFLOW]: toFilterDisplayValue(
        params[PARAM_WORKFLOW] as string | string[] | undefined
      ),
      [PARAM_COVERAGE_MIN]: toCoverageValue(
        params[PARAM_COVERAGE_MIN] as string | string[] | undefined
      ),
      [PARAM_COVERAGE_MAX]: toCoverageValue(
        params[PARAM_COVERAGE_MAX] as string | string[] | undefined
      ),
    }),
    [params]
  );

  const setFilterValues = useCallback(
    (values: Record<string, string | string[]>) => {
      setParams({
        [PARAM_ORCABUS_ID]: toFilterQueryValue(values.orcabusId),
        [PARAM_LIBRARY_ID]: toFilterQueryValue(values.libraryId),
        [PARAM_ASSAY]: toFilterQueryValue(values.assay),
        [PARAM_INDIVIDUAL_ID]: toFilterQueryValue(values.individualId),
        [PARAM_PROJECT_ID]: toFilterQueryValue(values.projectId),
        [PARAM_PHENOTYPE]: toFilterQueryValue(values.phenotype),
        [PARAM_QUALITY]: toFilterQueryValue(values.quality),
        [PARAM_TYPE]: toFilterQueryValue(values.type),
        [PARAM_WORKFLOW]: toFilterQueryValue(values.workflow),
        [PARAM_COVERAGE_MIN]: toCoverageValue(values.coverageMin) || undefined,
        [PARAM_COVERAGE_MAX]: toCoverageValue(values.coverageMax) || undefined,
      });
    },
    [setParams]
  );

  const libraryListQueryParams = useMemo<LibraryListQueryParams>(() => {
    const query = {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: toSearchApiQueryValue(search),
      ordering: orderBy || undefined,
      orcabusId: toApiCsvQueryValue(filterValues.orcabusId),
      libraryId: toApiCsvQueryValue(filterValues.libraryId),
      assay: toApiCsvQueryValue(filterValues.assay),
      individualId: toApiCsvQueryValue(filterValues.individualId),
      projectId: toProjectIdQueryValue(filterValues.projectId),
      phenotype: toApiCsvQueryValue(filterValues.phenotype) as LibraryListQuery['phenotype'],
      quality: toApiCsvQueryValue(filterValues.quality) as LibraryListQuery['quality'],
      type: toApiCsvQueryValue(filterValues.type) as LibraryListQuery['type'],
      workflow: toApiCsvQueryValue(filterValues.workflow) as LibraryListQuery['workflow'],
      'coverage[gte]': toNumber(filterValues.coverageMin),
      'coverage[lte]': toNumber(filterValues.coverageMax),
    };
    return query as LibraryListQueryParams;
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  /** Clear search and all filters (for "Clear all" in AdvancedFilterBar). */
  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(LAB_FILTER_KEYS.map((k) => [k, undefined])),
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
    libraryListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    clearAllFilters,
  };
}
