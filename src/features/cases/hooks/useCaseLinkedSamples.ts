import { useMemo } from 'react';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import {
  useQueryMetadataSampleModel,
  type SampleDetailType,
} from '@/features/lab/shared/api/lab.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

export interface UseCaseLinkedSamplesResult {
  /** OrcaBus IDs of every sample linked to the case via its external entity set. */
  sampleOrcabusIdArray: string[];
  /** The resolved samples for the linked OrcaBus IDs (empty until loaded). */
  linkedSamples: SampleDetailType[];
  isLoading: boolean;
  isRefetching: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Shared data source for a case's linked samples.
 *
 * Mirrors `useCaseLinkedSequenceRuns`: derives the linked orcabusId array from
 * `externalEntitySet` (service `metadata`, type `sample`) and resolves it via
 * `useQueryMetadataSampleModel`, so consumers share a single React Query cache
 * entry. Reads `caseDetail` from `CaseDetailsContext`.
 */
export function useCaseLinkedSamples(): UseCaseLinkedSamplesResult {
  const { caseDetail } = useCaseDetailsContext();

  const sampleOrcabusIdArray = useMemo(() => {
    const ids: string[] = [];
    caseDetail?.externalEntitySet.forEach((link) => {
      if (link.externalEntity.serviceName === 'metadata' && link.externalEntity.type === 'sample') {
        ids.push(link.externalEntity.orcabusId);
      }
    });
    return ids;
  }, [caseDetail]);

  const {
    data: sampleData,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useQueryMetadataSampleModel({
    params: {
      query: {
        orcabusId: sampleOrcabusIdArray,
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
      },
    },
    reactQuery: {
      enabled: sampleOrcabusIdArray.length > 0,
    },
  });

  const linkedSamples = useMemo(() => sampleData?.results ?? [], [sampleData?.results]);

  return {
    sampleOrcabusIdArray,
    linkedSamples,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch: () => void refetch(),
  };
}
