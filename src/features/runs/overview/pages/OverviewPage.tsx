import { useMemo } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../shared/components/RunsInfoDrawer';
import { useRunsOverviewPageQueryParams } from '../hooks/useRunsOverviewPageQueryParams';
import { useOverviewStats } from '../hooks/useOverviewStats';
import { buildOverviewStats } from '../utils/overviewStatsConfig';
import {
  OverviewStatsStrip,
  OverviewSequenceRunsCard,
  OverviewWorkflowRunsCard,
} from '../components';

export function OverviewPage() {
  const title = 'Runs Overview';
  const description = 'Monitor active runs and system-wide metrics';
  const { isInfoDrawerOpen, openInfoDrawer, closeInfoDrawer } = useRunsOverviewPageQueryParams();
  const {
    activeSequenceRuns,
    activeWorkflowRuns,
    sequenceTotal,
    workflowTotal,
    totalRuns,
    sequenceSucceeded,
    workflowSucceeded,
    totalSucceeded,
    sequenceFailed,
    workflowFailed,
    totalFailed,
    successRate,
    failedRate,
    recentSequenceRuns,
    recentWorkflowRuns,
    isStatsLoading,
    isStatsError,
    statsError,
    refetchStats,
    isSequenceRunsLoading,
    isSequenceRunsError,
    sequenceRunsError,
    refetchSequenceRuns,
    isWorkflowRunsLoading,
    isWorkflowRunsError,
    workflowRunsError,
    refetchWorkflowRuns,
  } = useOverviewStats();

  const stats = buildOverviewStats({
    activeSequenceRuns,
    activeWorkflowRuns,
    sequenceTotal,
    workflowTotal,
    totalRuns,
    sequenceSucceeded,
    workflowSucceeded,
    totalSucceeded,
    sequenceFailed,
    workflowFailed,
    totalFailed,
    successRate,
    failedRate,
  });
  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <LayoutDashboard className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='p-6'>
        <OverviewStatsStrip
          stats={stats}
          isLoading={isStatsLoading}
          error={isStatsError ? statsError : undefined}
          onRetry={refetchStats}
        />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <OverviewSequenceRunsCard
            runs={recentSequenceRuns}
            isLoading={isSequenceRunsLoading}
            error={isSequenceRunsError ? sequenceRunsError : undefined}
            onRetry={refetchSequenceRuns}
          />
          <OverviewWorkflowRunsCard
            runs={recentWorkflowRuns}
            isLoading={isWorkflowRunsLoading}
            error={isWorkflowRunsError ? workflowRunsError : undefined}
            onRetry={refetchWorkflowRuns}
          />
        </div>
      </div>

      <RunsInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        title={title}
        description={description}
      />
    </>
  );
}
