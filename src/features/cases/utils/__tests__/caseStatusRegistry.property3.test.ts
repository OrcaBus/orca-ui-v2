import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { resolveCaseLifecyclePosition, getLifecycleStagePosition } from '../caseStatusRegistry';
import type { CaseStatusEnum } from '../../api/cases.api';

/**
 * The 17 literal values of `CaseStatusEnum` (`case.openapi.d.ts`'s `StatusEnum`).
 * Duplicated here deliberately: the property must range over the *exact* enum
 * literal space, not over `resolveCaseLifecyclePosition`'s implementation details.
 */
const CASE_STATUS_ENUM_VALUES: CaseStatusEnum[] = [
  'request_received',
  'wgts_tumour_sample_received',
  'wgts_germline_sample_received',
  'cttso_sample_received',
  'all_sample_received',
  'library_partially_failed',
  'sequencing_started',
  'sequencing_completed',
  'bioinformatics_started',
  'bioinformatics_completed',
  'curation_started',
  'curation_completed',
  'locked',
  'unlocked',
  'failed',
  'completed',
  'archived',
];

/** The 5 Off_Stepper_Status values. */
const OFF_STEPPER_STATUSES: CaseStatusEnum[] = [
  'library_partially_failed',
  'failed',
  'locked',
  'unlocked',
  'archived',
];

/** Maps a stage-classified `CaseStatusEnum` to its `LIFECYCLE_STAGE_ORDER` index. */
const STAGE_STATUS_TO_STAGE: Record<string, Parameters<typeof getLifecycleStagePosition>[0]> = {
  wgts_tumour_sample_received: 'samples_received',
  wgts_germline_sample_received: 'samples_received',
  cttso_sample_received: 'samples_received',
  all_sample_received: 'samples_received',
  sequencing_started: 'sequencing_started',
  sequencing_completed: 'sequencing_completed',
  bioinformatics_started: 'bioinformatics_started',
  bioinformatics_completed: 'bioinformatics_completed',
  curation_started: 'curation_started',
  curation_completed: 'curation_completed',
  completed: 'completed',
};

/**
 * Reference implementation: scans a status history backward, independent of
 * `resolveCaseLifecyclePosition`, and returns the stage position of the most
 * recent stage-classified status, or `null` if none exists.
 */
function referenceBackwardScan(history: readonly CaseStatusEnum[]): number | null {
  for (let i = history.length - 1; i >= 0; i--) {
    const status = history[i];
    if (!OFF_STEPPER_STATUSES.includes(status)) {
      return getLifecycleStagePosition(STAGE_STATUS_TO_STAGE[status]);
    }
  }
  return null;
}

describe('caseStatusRegistry — Property 3: Off-stepper backward resolution finds the last-passed stage', () => {
  it('resolves isOffStepper: true and currentPosition equal to the last stage-classified status scanning backward', () => {
    fc.assert(
      fc.property(
        fc
          .tuple(
            fc.array(fc.constantFrom(...CASE_STATUS_ENUM_VALUES)),
            fc.constantFrom(...OFF_STEPPER_STATUSES)
          )
          .map(([prefix, last]): CaseStatusEnum[] => [...prefix, last]),
        (history) => {
          const result = resolveCaseLifecyclePosition(history);
          const expectedPosition = referenceBackwardScan(history);

          expect(result.isOffStepper).toBe(true);
          expect(result.currentPosition).toBe(expectedPosition);
        }
      )
    );
  });

  it('sanity check: stage-only prefix resolves to that stage, off-stepper-only history resolves to null', () => {
    expect(resolveCaseLifecyclePosition(['sequencing_started', 'failed'])).toEqual({
      currentPosition: getLifecycleStagePosition('sequencing_started'),
      isOffStepper: true,
      maxPosition: getLifecycleStagePosition('sequencing_started'),
      isReworking: false,
    });

    expect(resolveCaseLifecyclePosition(['locked', 'unlocked', 'archived'])).toEqual({
      currentPosition: null,
      isOffStepper: true,
      maxPosition: null,
      isReworking: false,
    });
  });
});
