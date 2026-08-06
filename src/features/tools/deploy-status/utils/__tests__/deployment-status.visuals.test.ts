import { describe, expect, it } from 'vitest';
import { getDeploymentStatusVisual } from '../deployment-status.visuals';

describe('getDeploymentStatusVisual', () => {
  it.each([
    ['CREATE_COMPLETE', 'stable', 'green'],
    ['UPDATE_COMPLETE', 'stable', 'green'],
    ['IMPORT_COMPLETE', 'stable', 'green'],
    ['CREATE_IN_PROGRESS', 'in-progress', 'blue'],
    ['DELETE_IN_PROGRESS', 'in-progress', 'blue'],
    ['REVIEW_IN_PROGRESS', 'in-progress', 'blue'],
    ['ROLLBACK_IN_PROGRESS', 'in-progress', 'blue'],
    ['UPDATE_COMPLETE_CLEANUP_IN_PROGRESS', 'in-progress', 'blue'],
    ['UPDATE_IN_PROGRESS', 'in-progress', 'blue'],
    ['UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS', 'in-progress', 'blue'],
    ['UPDATE_ROLLBACK_IN_PROGRESS', 'in-progress', 'blue'],
    ['IMPORT_IN_PROGRESS', 'in-progress', 'blue'],
    ['IMPORT_ROLLBACK_IN_PROGRESS', 'in-progress', 'blue'],
    ['ROLLBACK_COMPLETE', 'rollback', 'amber'],
    ['UPDATE_ROLLBACK_COMPLETE', 'rollback', 'amber'],
    ['IMPORT_ROLLBACK_COMPLETE', 'rollback', 'amber'],
    ['CREATE_FAILED', 'failed', 'red'],
    ['DELETE_FAILED', 'failed', 'red'],
    ['ROLLBACK_FAILED', 'failed', 'red'],
    ['UPDATE_FAILED', 'failed', 'red'],
    ['UPDATE_ROLLBACK_FAILED', 'failed', 'red'],
    ['IMPORT_ROLLBACK_FAILED', 'failed', 'red'],
    ['DELETE_COMPLETE', 'removed', 'neutral'],
  ] as const)('maps %s to %s', (status, category, variant) => {
    expect(getDeploymentStatusVisual(status)).toEqual({ label: status, category, variant });
  });

  it('falls back safely for missing and future statuses', () => {
    expect(getDeploymentStatusVisual('FUTURE_STATUS')).toEqual({
      label: 'FUTURE_STATUS',
      category: 'unknown',
      variant: 'neutral',
    });
    expect(getDeploymentStatusVisual(undefined)).toEqual({
      label: 'Unknown',
      category: 'unknown',
      variant: 'neutral',
    });
  });
});
