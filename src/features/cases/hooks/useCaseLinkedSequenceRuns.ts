import { useMemo } from 'react';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import {
  useSequenceRunListModel,
  type SequenceRunListModel,
} from '@/features/runs/shared/api/sequence.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export interface UseCaseLinkedSequenceRunsResult {
  /** OrcaBus IDs of every sequence run linked to the case via its external entity set. */
  sequenceRunOrcabusIdArray: string[];
  /** The resolved sequence runs for the linked OrcaBus IDs (empty until loaded). */
  linkedSequenceRuns: SequenceRunListModel[];
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Shared data source for a case's linked sequence runs.
 *
 * Mirrors `useCaseLinkedWorkflowRuns`: derives the linked orcabusId array from
 * `externalEntitySet` (service `sequence`, type `sequence_run`) and resolves it
 * via `useSequenceRunListModel`, so consumers share a single React Query cache
 * entry. Reads `caseDetail` from `CaseDetailsContext`.
 */
export function useCaseLinkedSequenceRuns(): UseCaseLinkedSequenceRunsResult {
  const { caseDetail } = useCaseDetailsContext();

  const sequenceRunOrcabusIdArray = useMemo(() => {
    const ids: string[] = [];
    caseDetail?.externalEntitySet.forEach((link) => {
      if (
        link.externalEntity.serviceName === 'sequence' &&
        link.externalEntity.type === 'sequence_run'
      ) {
        ids.push(link.externalEntity.orcabusId);
      }
    });
    return ids;
  }, [caseDetail]);

  const {
    data: sequenceRunsData,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useSequenceRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: sequenceRunOrcabusIdArray,
      },
    },
    reactQuery: {
      enabled: sequenceRunOrcabusIdArray.length > 0,
    },
  });

  const linkedSequenceRuns = useMemo(
    () => sequenceRunsData?.results ?? [],
    [sequenceRunsData?.results]
  );

  return {
    sequenceRunOrcabusIdArray,
    linkedSequenceRuns,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch: () => void refetch(),
  };
}
