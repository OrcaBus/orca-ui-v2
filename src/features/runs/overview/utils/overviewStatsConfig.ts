import { Activity, GitBranch, TrendingUp, AlertTriangle } from 'lucide-react';
import type { OverviewStatItem } from '../components/OverviewStatsStrip';

export function buildOverviewStats(values: {
  activeSequenceRuns: number;
  activeWorkflowRuns: number;
  sequenceTotal: number;
  workflowTotal: number;
  totalRuns: number;
  sequenceSucceeded: number;
  workflowSucceeded: number;
  totalSucceeded: number;
  sequenceFailed: number;
  workflowFailed: number;
  totalFailed: number;
  successRate: number;
  failedRate: number;
}): OverviewStatItem[] {
  return [
    {
      label: 'Active Sequence Runs',
      value: values.activeSequenceRuns,
      icon: Activity,
      family: 'info',
      summary: `${values.activeSequenceRuns} / ${values.sequenceTotal} total sequence runs`,
    },
    {
      label: 'Active Workflow Runs',
      value: values.activeWorkflowRuns,
      icon: GitBranch,
      // Same family as "Active Sequence Runs" above — both are the same
      // "in progress" concept. This used to be its own qc-purple family,
      // since retired entirely (qc-pending now aliases info too); the two
      // active-run tiles are still told apart by icon and label.
      family: 'info',
      summary: `${values.activeWorkflowRuns} / ${values.workflowTotal} total workflow runs`,
    },
    {
      label: 'Overall Success Rate',
      value: `${values.successRate}%`,
      icon: TrendingUp,
      family: 'success',
      summary: `${values.totalSucceeded} / ${values.totalRuns} succeeded`,
      detailRows: [
        { label: 'Sequence', value: `${values.sequenceSucceeded} / ${values.sequenceTotal}` },
        { label: 'Workflow', value: `${values.workflowSucceeded} / ${values.workflowTotal}` },
      ],
    },
    {
      label: 'Overall Failed Rate',
      value: `${values.failedRate}%`,
      icon: AlertTriangle,
      family: 'error',
      summary: `${values.totalFailed} / ${values.totalRuns} failed`,
      detailRows: [
        { label: 'Sequence', value: `${values.sequenceFailed} / ${values.sequenceTotal}` },
        { label: 'Workflow', value: `${values.workflowFailed} / ${values.workflowTotal}` },
      ],
    },
  ];
}
