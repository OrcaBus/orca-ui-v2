import { Activity, GitBranch, TrendingUp, AlertTriangle } from 'lucide-react';
import type { OverviewStatItem } from '../components/OverviewStatsStrip';

export function buildOverviewStats(values: {
  activeSequenceRuns: number;
  activeWorkflowRuns: number;
  successRate: number;
  failedLast24h: number;
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
    },
    {
      label: 'Active Workflow Runs',
      value: values.activeWorkflowRuns,
      icon: GitBranch,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      darkColor: 'dark:text-purple-400',
      darkBgColor: 'dark:bg-purple-500/10',
    },
    {
      label: 'Overall Success Rate',
      value: `${values.successRate}%`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      darkColor: 'dark:text-green-400',
      darkBgColor: 'dark:bg-green-500/10',
    },
    {
      label: 'Failed in Last 24h',
      value: values.failedLast24h,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      darkColor: 'dark:text-amber-400',
      darkBgColor: 'dark:bg-amber-500/10',
    },
  ];
}
