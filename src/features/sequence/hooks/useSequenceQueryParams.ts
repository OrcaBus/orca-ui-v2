import { useMemo, useCallback } from 'react';
import { useQueryParams } from '../../../hooks/useQueryParams';
import type { SequenceRun } from '../../../data/mockData';
import {
  groupByInstrumentRun,
  type InstrumentRun,
  type InstrumentRunStatus,
} from '../utils/groupByInstrumentRun';

const PARAM_SEARCH = 'search';
const PARAM_STATUS = 'status';
const PARAM_START_FROM = 'startTimeFrom';
const PARAM_START_TO = 'startTimeTo';

const STATUS_ALL = 'all';

interface UseSequenceQueryParamsOptions {
  sequenceRuns: SequenceRun[];
}

/**
 * Sequence list page state driven by URL query params.
 * Params: search, status (instrument run status), startTimeFrom, startTimeTo.
 */
export function useSequenceQueryParams({ sequenceRuns }: UseSequenceQueryParamsOptions) {
  const { getParam, setParams } = useQueryParams({ paginationKeys: [] });

  const searchQuery = getParam(PARAM_SEARCH) ?? '';
  const statusFilterRaw = getParam(PARAM_STATUS) ?? STATUS_ALL;
  const startTimeFrom = getParam(PARAM_START_FROM) ?? '';
  const startTimeTo = getParam(PARAM_START_TO) ?? '';

  const statusFilter: InstrumentRunStatus | typeof STATUS_ALL =
    statusFilterRaw === '' ? STATUS_ALL : (statusFilterRaw as InstrumentRunStatus);

  const setSearchQuery = useCallback(
    (value: string) => setParams({ [PARAM_SEARCH]: value || undefined }),
    [setParams]
  );
  const setStatusFilter = useCallback(
    (value: InstrumentRunStatus | typeof STATUS_ALL) =>
      setParams({ [PARAM_STATUS]: value === STATUS_ALL ? undefined : value }),
    [setParams]
  );
  const setStartTimeFrom = useCallback(
    (value: string) => setParams({ [PARAM_START_FROM]: value || undefined }),
    [setParams]
  );
  const setStartTimeTo = useCallback(
    (value: string) => setParams({ [PARAM_START_TO]: value || undefined }),
    [setParams]
  );

  const clearAllFilters = useCallback(
    () =>
      setParams({
        [PARAM_SEARCH]: undefined,
        [PARAM_STATUS]: undefined,
        [PARAM_START_FROM]: undefined,
        [PARAM_START_TO]: undefined,
      }),
    [setParams]
  );

  const allInstrumentRuns = useMemo(() => groupByInstrumentRun(sequenceRuns), [sequenceRuns]);

  const filteredInstrumentRuns = useMemo(() => {
    return allInstrumentRuns.filter((instrumentRun) => {
      const matchesSearch =
        !searchQuery ||
        instrumentRun.instrumentRunId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instrumentRun.sequenceRuns.some(
          (run) =>
            run.runId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            run.flowcellId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            run.instrument.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesStatus = statusFilter === STATUS_ALL || instrumentRun.status === statusFilter;

      let matchesTimeRange = true;
      if (startTimeFrom || startTimeTo) {
        const runDate = new Date(instrumentRun.startTime);
        if (startTimeFrom) {
          matchesTimeRange = matchesTimeRange && runDate >= new Date(startTimeFrom);
        }
        if (startTimeTo) {
          matchesTimeRange = matchesTimeRange && runDate <= new Date(startTimeTo);
        }
      }

      return matchesSearch && matchesStatus && matchesTimeRange;
    });
  }, [allInstrumentRuns, searchQuery, statusFilter, startTimeFrom, startTimeTo]);

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    startTimeFrom,
    setStartTimeFrom,
    startTimeTo,
    setStartTimeTo,
    clearAllFilters,
    allInstrumentRuns,
    filteredInstrumentRuns,
  };
}

export type { InstrumentRun, InstrumentRunStatus };
