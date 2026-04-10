import { useMemo, useCallback } from 'react';
import { useQueryParams } from '@/hooks/useQueryParams';
import { PARAM_ORDER_BY, PARAM_SEARCH } from '@/utils/constants';
import { toUtcStartOfDayQueryParam } from '@/utils/timeFormat';
import type { SequenceRunStatusEnum } from '../api/sequence.api';

export type SequenceStatus = SequenceRunStatusEnum;

const PARAM_STATUS = 'seqStatus';
const PARAM_FROM = 'seqFrom';
const PARAM_TO = 'seqTo';

export const SEQUENCE_FILTER_KEYS = [PARAM_STATUS, PARAM_FROM, PARAM_TO] as const;

export type SequenceFilterKey = (typeof SEQUENCE_FILTER_KEYS)[number];

const DEFAULT_FILTER_VALUES: Record<SequenceFilterKey, string> = {
  [PARAM_STATUS]: '',
  [PARAM_FROM]: '',
  [PARAM_TO]: '',
};

export type SequenceFilterPatch = Partial<{
  seqStatus: string | string[];
  seqFrom: string | string[];
  seqTo: string | string[];
}>;

function toFirstString(value: string | string[] | undefined): string {
  if (value == null) return '';
  return Array.isArray(value) ? (value[0] ?? '') : value;
}

/**
 * Sequence list page state driven by URL query params.
 * Filter params: seqStatus, seqFrom, seqTo. Shared: search, orderBy, pagination.
 */
export function useSequenceQueryParams() {
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
      [PARAM_STATUS]: toFirstString(params[PARAM_STATUS] as string | string[] | undefined),
      [PARAM_FROM]: toFirstString(params[PARAM_FROM] as string | string[] | undefined),
      [PARAM_TO]: toFirstString(params[PARAM_TO] as string | string[] | undefined),
    }),
    [params]
  );

  const setFilterValues = useCallback(
    (patch: SequenceFilterPatch) => {
      const str = (v: string | string[] | undefined): string =>
        v == null ? '' : Array.isArray(v) ? (v[0] ?? '') : v;

      const nextStatus =
        patch.seqStatus !== undefined ? str(patch.seqStatus) : filterValues[PARAM_STATUS];
      const nextFrom = patch.seqFrom !== undefined ? str(patch.seqFrom) : filterValues[PARAM_FROM];
      const nextTo = patch.seqTo !== undefined ? str(patch.seqTo) : filterValues[PARAM_TO];

      setParams({
        [PARAM_STATUS]: nextStatus || undefined,
        [PARAM_FROM]: nextFrom || undefined,
        [PARAM_TO]: nextTo || undefined,
      });
    },
    [setParams, filterValues]
  );

  const sequenceListQueryParams = useMemo(() => {
    const statusRaw = filterValues[PARAM_STATUS];
    const statusForApi =
      !statusRaw || statusRaw === 'all' ? undefined : (statusRaw as SequenceStatus);

    return {
      page: pagination.page,
      rowsPerPage: pagination.rowsPerPage,
      search: search || undefined,
      status: statusForApi,
      start_time: toUtcStartOfDayQueryParam(filterValues[PARAM_FROM]),
      end_time: toUtcStartOfDayQueryParam(filterValues[PARAM_TO]),
      ordering: orderBy || '-start_time',
    };
  }, [filterValues, pagination.page, pagination.rowsPerPage, search, orderBy]);

  const clearAllFilters = useCallback(() => {
    setParams({
      [PARAM_SEARCH]: undefined,
      [PARAM_ORDER_BY]: undefined,
      ...Object.fromEntries(SEQUENCE_FILTER_KEYS.map((k) => [k, undefined])),
    });
  }, [setParams]);

  const status = (
    !filterValues[PARAM_STATUS] || filterValues[PARAM_STATUS] === 'all'
      ? 'all'
      : filterValues[PARAM_STATUS]
  ) as SequenceStatus | 'all';

  const setStatus = useCallback(
    (v: SequenceStatus | 'all') => setFilterValues({ seqStatus: v === 'all' ? '' : v }),
    [setFilterValues]
  );

  const setDateFrom = useCallback(
    (v: string) => setFilterValues({ seqFrom: v }),
    [setFilterValues]
  );

  const setDateTo = useCallback((v: string) => setFilterValues({ seqTo: v }), [setFilterValues]);

  return {
    search,
    orderBy,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
    filterValues,
    setFilterValues,
    sequenceListQueryParams,
    pagination,
    page: pagination.page,
    rowsPerPage: pagination.rowsPerPage,
    setPage,
    setRowsPerPage,
    clearAllFilters,
    status,
    setStatus,
    dateFrom: filterValues[PARAM_FROM],
    setDateFrom,
    dateTo: filterValues[PARAM_TO],
    setDateTo,
  };
}
