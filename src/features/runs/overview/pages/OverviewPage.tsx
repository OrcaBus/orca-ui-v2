import { LayoutDashboard } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useOverviewStats } from '../hooks/useOverviewStats';
import { buildOverviewStats } from '../utils/overviewStatsConfig';
import {
  OverviewStatsStrip,
  OverviewSequenceRunsCard,
  OverviewWorkflowRunsCard,
} from '../components';

export function OverviewPage() {
  const {
    activeSequenceRuns,
    activeWorkflowRuns,
    successRate,
    failedLast24h,
    recentSequenceRuns,
    recentWorkflowRuns,
  } = useOverviewStats();

  const stats = buildOverviewStats({
    activeSequenceRuns,
    activeWorkflowRuns,
    successRate,
    failedLast24h,
  });

  return (
    <div className='p-6'>
      <PageHeader
        title='Overview'
        description='Monitor active runs and system-wide metrics'
        icon={<LayoutDashboard className='h-6 w-6' />}
      />

      <OverviewStatsStrip stats={stats} />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <OverviewSequenceRunsCard runs={recentSequenceRuns} />
        <OverviewWorkflowRunsCard runs={recentWorkflowRuns} />
      </div>
    </div>
  );
}
