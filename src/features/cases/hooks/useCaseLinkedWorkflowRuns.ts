import { useMemo } from 'react';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import {
  useWorkflowRunListModel,
  type WorkflowRunListModel,
} from '@/features/runs/shared/api/workflows.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export interface UseCaseLinkedWorkflowRunsResult {
  /** OrcaBus IDs of every workflow run linked to the case via its external entity set. */
  wfrOrcabusIdArray: string[];
  /** The resolved workflow runs for the linked OrcaBus IDs (empty until loaded). */
  linkedWorkflowRuns: WorkflowRunListModel[];
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Shared data source for a case's linked workflow runs.
 *
 * Factors out the `wfrOrcabusIdArray`-from-`externalEntitySet` derivation and the
 * `useWorkflowRunListModel` call that `CaseDetailsLinkedWorkflowRunsTab` previously did inline,
 * so `CaseStatsStrip`, the Runs tab, the Files tab, and the Overview tab all derive the same
 * linked-run list from one place and share a single React Query cache entry (no new network
 * request per consumer). Reads `caseDetail` from `CaseDetailsContext`.
 */
export function useCaseLinkedWorkflowRuns(): UseCaseLinkedWorkflowRunsResult {
  const { caseDetail } = useCaseDetailsContext();

  // Collect all linked workflow run orcabusIds from case external entities.
  const wfrOrcabusIdArray = useMemo(() => {
    const ids: string[] = [];
    caseDetail?.externalEntitySet.forEach((link) => {
      if (
        link.externalEntity.serviceName === 'workflow' &&
        link.externalEntity.type === 'workflow_run'
      ) {
        ids.push(link.externalEntity.orcabusId);
      }
    });
    return ids;
  }, [caseDetail]);

  const {
    data: workflowRunsData,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useWorkflowRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: wfrOrcabusIdArray,
      },
    },
    reactQuery: {
      enabled: wfrOrcabusIdArray.length > 0,
    },
  });

  const linkedWorkflowRuns = useMemo(() => {
    const runs = workflowRunsData?.results ?? [];
    return [...runs].sort((a, b) => {
      const aTimestamp = a.currentState?.timestamp
        ? new Date(a.currentState.timestamp).getTime()
        : 0;
      const bTimestamp = b.currentState?.timestamp
        ? new Date(b.currentState.timestamp).getTime()
        : 0;
      return bTimestamp - aTimestamp;
    });
  }, [workflowRunsData?.results]);

  return {
    wfrOrcabusIdArray,
    linkedWorkflowRuns,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch: () => void refetch(),
  };
}
