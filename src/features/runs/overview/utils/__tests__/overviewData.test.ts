import { describe, expect, it } from 'vitest';
import {
  calculateOverviewStats,
  mapOverviewSequenceRuns,
  mapOverviewWorkflowRuns,
} from '../overviewData';

describe('calculateOverviewStats', () => {
  it('calculates active counts and all-run success and failure rates', () => {
    const stats = calculateOverviewStats({
      sequenceCounts: {
        all: 10,
        started: 2,
        succeeded: 7,
        failed: 1,
      },
      workflowCounts: {
        all: 5,
        ongoing: 1,
        succeeded: 2,
        failed: 2,
      },
    });

    expect(stats).toEqual({
      activeSequenceRuns: 2,
      activeWorkflowRuns: 1,
      sequenceTotal: 10,
      workflowTotal: 5,
      totalRuns: 15,
      sequenceSucceeded: 7,
      workflowSucceeded: 2,
      totalSucceeded: 9,
      sequenceFailed: 1,
      workflowFailed: 2,
      totalFailed: 3,
      successRate: 60,
      failedRate: 20,
    });
  });

  it('returns zero rates when there are no runs', () => {
    const stats = calculateOverviewStats({
      sequenceCounts: undefined,
      workflowCounts: undefined,
    });

    expect(stats.successRate).toBe(0);
    expect(stats.failedRate).toBe(0);
    expect(stats.totalRuns).toBe(0);
    expect(stats.totalSucceeded).toBe(0);
    expect(stats.totalFailed).toBe(0);
  });
});

describe('mapOverviewSequenceRuns', () => {
  it('maps sequence API rows into overview rows', () => {
    expect(
      mapOverviewSequenceRuns([
        {
          orcabusId: 'seq.001',
          sequenceRunId: 'SR-001',
          instrumentRunId: 'INST-001',
          status: 'STARTED',
          startTime: '2026-06-01T00:00:00Z',
        },
      ])
    ).toEqual([
      {
        id: 'seq.001',
        sequenceRunId: 'SR-001',
        instrumentRunId: 'INST-001',
        status: 'STARTED',
        startTime: '2026-06-01T00:00:00Z',
      },
    ]);
  });
});

describe('mapOverviewWorkflowRuns', () => {
  it('maps workflow API rows into overview rows with portal run fallback names', () => {
    expect(
      mapOverviewWorkflowRuns([
        {
          orcabusId: 'wfr.001',
          workflowRunName: null,
          portalRunId: 'PRJ240001',
          currentState: {
            status: 'SUCCEEDED',
            timestamp: '2026-06-01T01:00:00Z',
          },
        },
      ])
    ).toEqual([
      {
        id: 'wfr.001',
        runName: 'PRJ240001',
        status: 'SUCCEEDED',
        startTime: '2026-06-01T01:00:00Z',
      },
    ]);
  });
});
