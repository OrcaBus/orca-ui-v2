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
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      darkColor: 'dark:text-blue-400',
      darkBgColor: 'dark:bg-blue-500/10',
      accentColor: 'border-t-blue-500',
      summary: `${values.activeSequenceRuns} / ${values.sequenceTotal} total sequence runs`,
    },
    {
      label: 'Active Workflow Runs',
      value: values.activeWorkflowRuns,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkColor: 'dark:text-purple-400',
      darkBgColor: 'dark:bg-purple-500/10',
      accentColor: 'border-t-purple-500',
      summary: `${values.activeWorkflowRuns} / ${values.workflowTotal} total workflow runs`,
    },
    {
      label: 'Overall Success Rate',
      value: `${values.successRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      darkColor: 'dark:text-green-400',
      darkBgColor: 'dark:bg-green-500/10',
      accentColor: 'border-t-green-500',
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
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      darkColor: 'dark:text-red-400',
      darkBgColor: 'dark:bg-red-500/10',
      accentColor: 'border-t-red-500',
      summary: `${values.totalFailed} / ${values.totalRuns} failed`,
      detailRows: [
        { label: 'Sequence', value: `${values.sequenceFailed} / ${values.sequenceTotal}` },
        { label: 'Workflow', value: `${values.workflowFailed} / ${values.workflowTotal}` },
      ],
    },
  ];
}
