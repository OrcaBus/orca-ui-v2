import { useMemo } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import {
  useSequenceRunListModel,
  useSequenceRunStatsStatusCountsModel,
} from '../../api/sequence.api';
import { useWorkflowRunStatusCountModel, workflowRunListModel } from '../../api/workflows.api';
import {
  calculateOverviewStats,
  mapOverviewSequenceRuns,
  mapOverviewWorkflowRuns,
} from '../utils/overviewData';

const RECENT_LIMIT = 5;

export function useOverviewStats() {
  const {
    data: sequenceStatusCounts,
    isLoading: isLoadingSequenceStatusCounts,
    isError: isSequenceStatusCountsError,
    error: sequenceStatusCountsError,
    refetch: refetchSequenceStatusCounts,
  } = useSequenceRunStatsStatusCountsModel({
    params: { query: {} },
    reactQuery: { placeholderData: keepPreviousData, throwOnError: false },
  });

  const {
    data: workflowStatusCounts,
    isLoading: isLoadingWorkflowStatusCounts,
    isError: isWorkflowStatusCountsError,
    error: workflowStatusCountsError,
    refetch: refetchWorkflowStatusCounts,
  } = useWorkflowRunStatusCountModel({
    params: { query: {} },
    reactQuery: { placeholderData: keepPreviousData, throwOnError: false },
  });

  const {
    data: sequenceRunsData,
    isLoading: isLoadingSequenceRuns,
    isError: isSequenceRunsError,
    error: sequenceRunsError,
    refetch: refetchSequenceRuns,
  } = useSequenceRunListModel({
    params: {
      query: {
        page: 1,
        rows_per_page: RECENT_LIMIT,
        ordering: '-start_time',
      },
    },
    reactQuery: { placeholderData: keepPreviousData, throwOnError: false },
  });

  const {
    data: workflowRunsData,
    isLoading: isLoadingWorkflowRuns,
    isError: isWorkflowRunsError,
    error: workflowRunsError,
    refetch: refetchWorkflowRuns,
  } = workflowRunListModel.useQuery({
    params: {
      query: {
        page: 1,
        rows_per_page: RECENT_LIMIT,
        ordering: '-timestamp',
      },
    },
    reactQuery: { placeholderData: keepPreviousData, throwOnError: false },
  });

  const stats = useMemo(
    () =>
      calculateOverviewStats({
        sequenceCounts: sequenceStatusCounts,
        workflowCounts: workflowStatusCounts,
      }),
    [sequenceStatusCounts, workflowStatusCounts]
  );

  const recentSequenceRuns = useMemo(
    () => mapOverviewSequenceRuns(sequenceRunsData?.results),
    [sequenceRunsData]
  );

  const recentWorkflowRuns = useMemo(
    () => mapOverviewWorkflowRuns(workflowRunsData?.results),
    [workflowRunsData]
  );

  const isStatsLoading =
    (isLoadingSequenceStatusCounts && !sequenceStatusCounts) ||
    (isLoadingWorkflowStatusCounts && !workflowStatusCounts);

  const statsError = sequenceStatusCountsError ?? workflowStatusCountsError;

  return {
    ...stats,
    recentSequenceRuns,
    recentWorkflowRuns,
    isStatsLoading,
    isStatsError: isSequenceStatusCountsError || isWorkflowStatusCountsError,
    statsError,
    refetchStats: () => {
      void Promise.all([refetchSequenceStatusCounts(), refetchWorkflowStatusCounts()]);
    },
    isSequenceRunsLoading: isLoadingSequenceRuns && !sequenceRunsData,
    isSequenceRunsError,
    sequenceRunsError,
    refetchSequenceRuns: () => {
      void refetchSequenceRuns();
    },
    isWorkflowRunsLoading: isLoadingWorkflowRuns && !workflowRunsData,
    isWorkflowRunsError,
    workflowRunsError,
    refetchWorkflowRuns: () => {
      void refetchWorkflowRuns();
    },
  };
}
