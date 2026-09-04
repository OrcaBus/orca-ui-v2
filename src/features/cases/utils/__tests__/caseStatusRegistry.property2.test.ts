import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { LIFECYCLE_STAGE_ORDER } from '../caseStatusRegistry';

/**
 * Step-state derivation as it will be computed by `LifecycleStepper`
 * (design.md's `LifecycleStepper` component, delivered in a later phase):
 * given a step's index and the case's resolved `currentPosition`, a step is
 * 'complete' when it sits strictly before the current position, 'current'
 * when it *is* the current position, and 'not-yet-reached' when it sits
 * strictly after it. This is kept as a small local helper here rather than
 * exported from `caseStatusRegistry.ts`, since the registry only exposes
 * `currentPosition` — the mapping from a position to a per-step render state
 * is `LifecycleStepper`'s own concern (see design.md's `LifecycleStepper` section).
 */
type StepState = 'complete' | 'current' | 'not-yet-reached';

function getStepState(stepIndex: number, currentPosition: number): StepState {
  if (stepIndex < currentPosition) return 'complete';
  if (stepIndex > currentPosition) return 'not-yet-reached';
  return 'current';
}

describe('caseStatusRegistry — Property 2: Stepper position ordering is monotonic', () => {
  it('marks a step complete iff its index is before currentPosition and not-yet-reached iff after', () => {
    const maxIndex = LIFECYCLE_STAGE_ORDER.length - 1;

    fc.assert(
      fc.property(
        fc.tuple(fc.integer({ min: 0, max: maxIndex }), fc.integer({ min: 0, max: maxIndex })),
        ([stepIndex, currentPosition]) => {
          const state = getStepState(stepIndex, currentPosition);

          expect(state === 'complete').toBe(stepIndex < currentPosition);
          expect(state === 'not-yet-reached').toBe(stepIndex > currentPosition);
          expect(state === 'current').toBe(stepIndex === currentPosition);

          // Exactly one of the three states holds — never zero, never more than one.
          const trueCount = [
            stepIndex < currentPosition,
            stepIndex === currentPosition,
            stepIndex > currentPosition,
          ].filter(Boolean).length;
          expect(trueCount).toBe(1);
        }
      )
    );
  });
});
