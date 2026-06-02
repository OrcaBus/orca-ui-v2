import { useMemo } from 'react';
import { LayoutDashboard } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../components/RunsInfoDrawer';
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
        <OverviewStatsStrip stats={stats} />

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <OverviewSequenceRunsCard runs={recentSequenceRuns} />
          <OverviewWorkflowRunsCard runs={recentWorkflowRuns} />
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
