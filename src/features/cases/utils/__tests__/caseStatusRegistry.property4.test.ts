import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { resolveCaseLifecyclePosition } from '../caseStatusRegistry';
import type { CaseStatusEnum } from '../../api/cases.api';

const ALL_CASE_STATUSES: CaseStatusEnum[] = [
  'request_received',
  'wgts_tumour_sample_received',
  'wgts_germline_sample_received',
  'cttso_sample_received',
  'all_sample_received',
  'sequencing_started',
  'sequencing_completed',
  'bioinformatics_started',
  'bioinformatics_completed',
  'curation_started',
  'curation_completed',
  'completed',
  'library_partially_failed',
  'failed',
  'locked',
  'unlocked',
  'archived',
];

const statusHistoryArbitrary = fc.array(fc.constantFrom(...ALL_CASE_STATUSES));

describe('resolveCaseLifecyclePosition — Property 4: consumer agreement', () => {
  it('returns Object.is-equal currentPosition and identical isOffStepper across two independent call sites over the same history', () => {
    fc.assert(
      fc.property(statusHistoryArbitrary, (history) => {
        // Simulate two independent consumers deriving lifecycle position from the same
        // status history — e.g. a Header-like consumer and a Stepper-like consumer.
        const fromHeaderLikeConsumer = resolveCaseLifecyclePosition(history);
        const fromStepperLikeConsumer = resolveCaseLifecyclePosition(history);

        expect(
          Object.is(fromHeaderLikeConsumer.currentPosition, fromStepperLikeConsumer.currentPosition)
        ).toBe(true);
        expect(fromHeaderLikeConsumer.isOffStepper).toBe(fromStepperLikeConsumer.isOffStepper);
      }),
      { numRuns: 100 }
    );
  });
});
