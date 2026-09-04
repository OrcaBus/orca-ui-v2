import { useMemo } from 'react';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

/**
 * A single count tile in the Case_Stats_Strip. Each metric carries its own
 * loading/error state because `samples` still resolves from an independent
 * data source today. When a backend `GET /case/{orcabusId}/stats/` endpoint
 * lands, these collapse to the single request's state — see {@link useCaseStats}.
 */
export interface CaseStatMetric {
  /** Resolved count, or `null` when the value could not be resolved (error). */
  value: number | null;
  loading: boolean;
  error: boolean;
}

/**
 * The four counts the Case_Stats_Strip renders. This is the contract a future
 * backend stats endpoint should return, so the UI depends on the shape rather
 * than on how each number is computed.
 */
export interface CaseStats {
  sequenceRuns: CaseStatMetric;
  workflowRuns: CaseStatMetric;
  libraries: CaseStatMetric;
  samples: CaseStatMetric;
}

export interface UseCaseStatsResult {
  stats: CaseStats;
}

/** Counts external-entity links on the case by service + type. */
function countLinks(
  externalEntitySet: NonNullable<
    ReturnType<typeof useCaseDetailsContext>['caseDetail']
  >['externalEntitySet'],
  serviceName: string,
  type: string
): string[] {
  const ids: string[] = [];
  externalEntitySet.forEach((link) => {
    if (link.externalEntity.serviceName === serviceName && link.externalEntity.type === type) {
      ids.push(link.externalEntity.orcabusId);
    }
  });
  return ids;
}

/**
 * Computes the {@link CaseStats} for the case currently in
 * `CaseDetailsContext`.
 *
 * This is the single seam to swap for a real backend endpoint: replace this
 * body with one `useCaseStatsModel({ params: { path: { orcabusId } } })` call
 * that returns {@link CaseStats}, and `CaseStatsStrip` stays unchanged.
 *

 * All four metrics — `sequenceRuns`, `workflowRuns`, `libraries`, and
 * `samples` — are plain counts of the case's linked external entities.
 * `caseDetail` already holds these, so no extra request is needed and the
 * metrics resolve instantly, error-free.
 */
export function useCaseStats(): UseCaseStatsResult {
  const { caseDetail } = useCaseDetailsContext();
  const externalEntitySet = useMemo(
    () => caseDetail?.externalEntitySet ?? [],
    [caseDetail?.externalEntitySet]
  );

  const libraryOrcabusIds = useMemo(
    () => countLinks(externalEntitySet, 'metadata', 'library'),
    [externalEntitySet]
  );
  const sampleOrcabusIds = useMemo(
    () => countLinks(externalEntitySet, 'metadata', 'sample'),
    [externalEntitySet]
  );
  const workflowRunOrcabusIds = useMemo(
    () => countLinks(externalEntitySet, 'workflow', 'workflow_run'),
    [externalEntitySet]
  );
  const sequenceRunOrcabusIds = useMemo(
    () => countLinks(externalEntitySet, 'sequence', 'sequence_run'),
    [externalEntitySet]
  );

  return {
    stats: {
      sequenceRuns: { value: sequenceRunOrcabusIds.length, loading: false, error: false },
      workflowRuns: { value: workflowRunOrcabusIds.length, loading: false, error: false },
      libraries: { value: libraryOrcabusIds.length, loading: false, error: false },
      samples: {
        value: sampleOrcabusIds.length,
        loading: false,
        error: false,
      },
    },
  };
}
