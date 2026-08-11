import { describe, expect, it, vi } from 'vitest';
import {
  dispatchWorkflowRunStateTransition,
  formatWorkflowRunStateLabel,
  getAvailableWorkflowRunStateTransitions,
  getWorkflowRunStateTransitionFeedback,
  isWorkflowRunStateTransitionAvailable,
  normalizeWorkflowRunState,
} from '../workflowRunStateTransitions';

const validationMap = {
  RESOLVED: ['FAILED'],
  DEPRECATED: { allowedStates: ['SUCCEEDED'] },
  CANCELLED: { excluded_states: ['SUCCEEDED', 'FAILED'] },
  ARCHIVED: null,
};

describe('workflow-run state transition validation', () => {
  it('normalizes state values and formats state labels', () => {
    expect(normalizeWorkflowRunState(' in-progress ')).toBe('IN_PROGRESS');
    expect(formatWorkflowRunStateLabel('IN_PROGRESS')).toBe('In Progress');
  });

  it('returns only supported transitions allowed for every current state', () => {
    expect(getAvailableWorkflowRunStateTransitions(validationMap, ['FAILED'])).toEqual([
      { value: 'RESOLVED', label: 'Resolved' },
    ]);

    expect(getAvailableWorkflowRunStateTransitions(validationMap, ['RUNNING'])).toEqual([
      { value: 'CANCELLED', label: 'Cancelled' },
    ]);
  });

  it('supports snake-case and camel-case allowed and excluded rules', () => {
    expect(
      isWorkflowRunStateTransitionAvailable(
        { RESOLVED: { allowed_states: ['FAILED'] } },
        'RESOLVED',
        'FAILED'
      )
    ).toBe(true);
    expect(
      isWorkflowRunStateTransitionAvailable(
        { RESOLVED: { allowedStates: ['FAILED'] } },
        'RESOLVED',
        'RUNNING'
      )
    ).toBe(false);
    expect(
      isWorkflowRunStateTransitionAvailable(
        { CANCELLED: { excludedStates: ['SUCCEEDED'] } },
        'CANCELLED',
        'SUCCEEDED'
      )
    ).toBe(false);
  });

  it('treats missing validation data as unavailable', () => {
    expect(isWorkflowRunStateTransitionAvailable(undefined, 'DEPRECATED', 'SUCCEEDED')).toBe(false);
    expect(isWorkflowRunStateTransitionAvailable({}, 'DEPRECATED', 'SUCCEEDED')).toBe(false);
  });

  it('only allows deprecation when a workflow run has no current state', () => {
    expect(getAvailableWorkflowRunStateTransitions(validationMap, [null])).toEqual([
      { value: 'DEPRECATED', label: 'Deprecated' },
    ]);
  });
});

describe('workflow-run state transition dispatch', () => {
  it.each([
    ['CANCELLED', 'cancelled'],
    ['deprecated', 'deprecated'],
    ['Resolved', 'resolved'],
  ] as const)('dispatches %s to only its matching handler', async (state, expectedResult) => {
    const request = {
      workflowrunOrcabusIds: ['wfr.001', 'wfr.002'],
      comment: 'Transition requested',
    };
    const handlers = {
      CANCELLED: vi.fn(() => Promise.resolve('cancelled')),
      DEPRECATED: vi.fn(() => Promise.resolve('deprecated')),
      RESOLVED: vi.fn(() => Promise.resolve('resolved')),
    };

    await expect(dispatchWorkflowRunStateTransition(state, request, handlers)).resolves.toBe(
      expectedResult
    );

    const normalizedState = normalizeWorkflowRunState(state) as keyof typeof handlers;
    expect(handlers[normalizedState]).toHaveBeenCalledWith(request);
    expect(Object.values(handlers).filter((handler) => handler.mock.calls.length > 0)).toHaveLength(
      1
    );
  });

  it('rejects unsupported states without invoking an endpoint', async () => {
    const handlers = {
      CANCELLED: vi.fn(() => Promise.resolve('cancelled')),
      DEPRECATED: vi.fn(() => Promise.resolve('deprecated')),
      RESOLVED: vi.fn(() => Promise.resolve('resolved')),
    };

    await expect(
      dispatchWorkflowRunStateTransition(
        'ARCHIVED',
        { workflowrunOrcabusIds: ['wfr.001'], comment: 'Unsupported' },
        handlers
      )
    ).rejects.toThrow('Unsupported workflow-run state transition: ARCHIVED');
    expect(Object.values(handlers).every((handler) => handler.mock.calls.length === 0)).toBe(true);
  });
});

describe('workflow-run state transition feedback', () => {
  it('returns success feedback when every transition succeeds', () => {
    expect(
      getWorkflowRunStateTransitionFeedback({
        createdCount: 2,
        failedCount: 0,
        workflowrunOrcabusIds: ['wfr.001', 'wfr.002'],
      })
    ).toEqual({
      type: 'success',
      message: 'Created 2 state transitions successfully',
    });
  });

  it('returns warning feedback with counts for partial success', () => {
    expect(
      getWorkflowRunStateTransitionFeedback({
        createdCount: 2,
        failedCount: 1,
        workflowrunOrcabusIds: ['wfr.001', 'wfr.002', 'wfr.003'],
      })
    ).toEqual({
      type: 'warning',
      message: 'Created 2 state transitions; 1 failed',
    });
  });
});
