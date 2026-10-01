import { describe, expect, it, vi } from 'vitest';
import {
  dispatchSequenceRunStateTransition,
  formatSequenceRunStateLabel,
  getAvailableSequenceRunStateTransitions,
  getSequenceRunStateTransitionFeedback,
  isSequenceRunStateTransitionAvailable,
  normalizeSequenceRunState,
} from '../sequenceRunStateTransitions';

// Mirrors the map served by
// GET /api/v1/sequence_run/state/get_states_transition_validation_map/
const validationMap = {
  RESOLVED: ['FAILED'],
  DEPRECATED: { allowedStates: ['SUCCEEDED'] },
};

describe('sequence-run state transition validation', () => {
  it('normalizes state values and formats state labels', () => {
    expect(normalizeSequenceRunState(' in-progress ')).toBe('IN_PROGRESS');
    expect(formatSequenceRunStateLabel('IN_PROGRESS')).toBe('In Progress');
  });

  it('returns only transitions allowed from the current state', () => {
    expect(getAvailableSequenceRunStateTransitions(validationMap, ['FAILED'])).toEqual([
      { value: 'RESOLVED', label: 'Resolved' },
    ]);
    expect(getAvailableSequenceRunStateTransitions(validationMap, ['SUCCEEDED'])).toEqual([
      { value: 'DEPRECATED', label: 'Deprecated' },
    ]);
    expect(getAvailableSequenceRunStateTransitions(validationMap, ['STARTED'])).toEqual([]);
  });

  it('ignores states without a dedicated transition endpoint', () => {
    expect(
      getAvailableSequenceRunStateTransitions({ ...validationMap, CANCELLED: [] }, ['FAILED'])
    ).toEqual([{ value: 'RESOLVED', label: 'Resolved' }]);
  });

  it('allows only DEPRECATED when the run has no current state', () => {
    expect(isSequenceRunStateTransitionAvailable(validationMap, 'DEPRECATED', null)).toBe(true);
    expect(isSequenceRunStateTransitionAvailable(validationMap, 'RESOLVED', null)).toBe(false);
  });

  it('supports snake-case and camel-case allowed and excluded rules', () => {
    expect(
      isSequenceRunStateTransitionAvailable(
        { RESOLVED: { allowed_states: ['FAILED'] } },
        'RESOLVED',
        'FAILED'
      )
    ).toBe(true);
    expect(
      isSequenceRunStateTransitionAvailable(
        { DEPRECATED: { excludedStates: ['FAILED'] } },
        'DEPRECATED',
        'FAILED'
      )
    ).toBe(false);
  });

  it('treats missing validation data as unavailable', () => {
    expect(isSequenceRunStateTransitionAvailable(undefined, 'DEPRECATED', 'SUCCEEDED')).toBe(false);
    expect(isSequenceRunStateTransitionAvailable({}, 'DEPRECATED', 'SUCCEEDED')).toBe(false);
  });
});

describe('sequence-run state transition dispatch', () => {
  const request = { sequenceRunOrcabusIds: ['seq.01ABC'], comment: 'handled' };

  it('routes each state to its dedicated endpoint handler', async () => {
    const handlers = {
      DEPRECATED: vi.fn(() => Promise.resolve('deprecated')),
      RESOLVED: vi.fn(() => Promise.resolve('resolved')),
    };

    await expect(dispatchSequenceRunStateTransition('DEPRECATED', request, handlers)).resolves.toBe(
      'deprecated'
    );
    await expect(dispatchSequenceRunStateTransition(' resolved ', request, handlers)).resolves.toBe(
      'resolved'
    );
    expect(handlers.DEPRECATED).toHaveBeenCalledWith(request);
    expect(handlers.RESOLVED).toHaveBeenCalledWith(request);
  });

  it('rejects unsupported transitions without calling a handler', async () => {
    const handlers = {
      DEPRECATED: vi.fn(() => Promise.resolve('deprecated')),
      RESOLVED: vi.fn(() => Promise.resolve('resolved')),
    };

    await expect(
      dispatchSequenceRunStateTransition('SUCCEEDED', request, handlers)
    ).rejects.toThrowError('Unsupported sequence-run state transition: SUCCEEDED');
    expect(handlers.DEPRECATED).not.toHaveBeenCalled();
    expect(handlers.RESOLVED).not.toHaveBeenCalled();
  });
});

describe('sequence-run state transition feedback', () => {
  it('warns when the response reports partial failures (207)', () => {
    expect(getSequenceRunStateTransitionFeedback({ createdCount: 1, failedCount: 1 })).toEqual({
      type: 'warning',
      message: 'Created 1 state transition; 1 failed',
    });
  });

  it('reports success when nothing failed', () => {
    expect(getSequenceRunStateTransitionFeedback({ createdCount: 2, failedCount: 0 })).toEqual({
      type: 'success',
      message: 'Created 2 state transitions successfully',
    });
  });
});
