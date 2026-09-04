import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { resolveCaseLifecyclePosition, getLifecyclePercentComplete } from '../caseStatusRegistry';
import type { CaseStatusEnum } from '../../api/cases.api';

/**
 * The 17 literal values of `CaseStatusEnum` (`case.openapi.d.ts`'s `StatusEnum`).
 * Duplicated here deliberately: the property must range over the *exact* enum
 * literal space, not over implementation details of the module under test.
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

const statusHistoryArbitrary = fc.array(fc.constantFrom(...CASE_STATUS_ENUM_VALUES));

describe('caseStatusRegistry — Property 5: Percent-complete is empty exactly when position is unresolved', () => {
  it('returns null iff currentPosition is null, and otherwise an integer in [0, 100]', () => {
    fc.assert(
      fc.property(statusHistoryArbitrary, (history) => {
        const { currentPosition } = resolveCaseLifecyclePosition(history);
        const percentComplete = getLifecyclePercentComplete(currentPosition);

        expect(percentComplete === null).toBe(currentPosition === null);

        if (percentComplete !== null) {
          expect(Number.isInteger(percentComplete)).toBe(true);
          expect(percentComplete).toBeGreaterThanOrEqual(0);
          expect(percentComplete).toBeLessThanOrEqual(100);
        }
      }),
      { numRuns: 100 }
    );
  });

  it('sanity check: empty history resolves to null percent complete', () => {
    const { currentPosition } = resolveCaseLifecyclePosition([]);
    expect(currentPosition).toBeNull();
    expect(getLifecyclePercentComplete(currentPosition)).toBeNull();
  });
});
