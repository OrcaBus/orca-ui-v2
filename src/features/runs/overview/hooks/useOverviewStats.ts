import { useMemo } from 'react';
import { mockSequenceRuns, mockWorkflowRuns } from '@/data/mockData';
import type { SequenceRun, WorkflowRun } from '@/data/mockData';

const RECENT_LIMIT = 5;

export function useOverviewStats() {
  return useMemo(() => {
    const activeSequenceRuns = mockSequenceRuns.filter((run) => run.status === 'pending').length;
    const activeWorkflowRuns = mockWorkflowRuns.filter((wf) => wf.status === 'ongoing').length;

    const completedSequenceRuns = mockSequenceRuns.filter(
      (run) => run.status === 'completed' || run.status === 'failed'
    );
    const completedWorkflowRuns = mockWorkflowRuns.filter(
      (wf) => wf.status === 'succeeded' || wf.status === 'failed'
    );

    const totalCompleted = completedSequenceRuns.length + completedWorkflowRuns.length;
    const totalSucceeded =
      completedSequenceRuns.filter((r) => r.status === 'completed').length +
      completedWorkflowRuns.filter((w) => w.status === 'succeeded').length;
    const successRate =
      totalCompleted > 0 ? Math.round((totalSucceeded / totalCompleted) * 100) : 0;

    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const failedLast24h = [
      ...mockSequenceRuns.filter(
        (run) =>
          run.status === 'failed' && run.completedDate && new Date(run.completedDate) > last24h
      ),
      ...mockWorkflowRuns.filter(
        (wf) => wf.status === 'failed' && wf.endTime && new Date(wf.endTime) > last24h
      ),
    ].length;

    const recentSequenceRuns: SequenceRun[] = mockSequenceRuns
      .toSorted((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
      .slice(0, RECENT_LIMIT);

    const recentWorkflowRuns: WorkflowRun[] = mockWorkflowRuns
      .toSorted((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, RECENT_LIMIT);

    return {
      activeSequenceRuns,
      activeWorkflowRuns,
      successRate,
      failedLast24h,
      recentSequenceRuns,
      recentWorkflowRuns,
    };
  }, []);
}
