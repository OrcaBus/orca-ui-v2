import { useCallback, useMemo } from 'react';
import { CirclePlay } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Input } from '@/components/ui/Input';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../shared/components/RunsInfoDrawer';
import type { WorkflowRunStatus } from '../hooks/useWorkflowRunListQueryParams';
import { useWorkflowRunsPageQueryParams } from '../hooks/useWorkflowRunsPageQueryParams';
import WorkflowRunsTable from '../components/WorkflowRunsTable';
import { buildWorkflowRunsFilterBadges } from '../utils/buildWorkflowRunsFilterBadges';
import { WorkflowRunsStatsCards } from '../components/WorkflowRunsStatsCards';

const WORKFLOW_MANAGER_SCHEMA_SVG_URL =
  'https://raw.githubusercontent.com/OrcaBus/service-workflow-manager/refs/heads/main/docs/diagrams/workflow-manager-entity-diagram.drawio.svg';

export function WorkflowRunsPage() {
  const title = 'Workflow Runs';
  const description = 'Monitor workflow executions, run states, and related operational metadata.';
  const {
    search,
    setSearchQuery,
    filterValues,
    setFilterValues,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearAllFilters,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useWorkflowRunsPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <CirclePlay className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  const activeFilterBadges = useMemo(
    () =>
      buildWorkflowRunsFilterBadges({
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  const handleStatusCardClick = useCallback(
    (s: WorkflowRunStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <>
      <div>
        <WorkflowRunsStatsCards status={status} onStatusCardClick={handleStatusCardClick} />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search by workflow run name, portal run ID, execution ID…'
          filters={
            <>
              <div className='flex items-center gap-2'>
                <label
                  htmlFor='workflow-start-from'
                  className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'
                >
                  From:
                </label>
                <Input
                  id='workflow-start-from'
                  type='date'
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className='h-auto w-auto py-1.5 text-sm'
                />
              </div>
              <div className='flex items-center gap-2'>
                <label
                  htmlFor='workflow-start-to'
                  className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'
                >
                  To:
                </label>
                <Input
                  id='workflow-start-to'
                  type='date'
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className='h-auto w-auto py-1.5 text-sm'
                />
              </div>
            </>
          }
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
        />

        <WorkflowRunsTable />
      </div>

      <RunsInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        title={title}
        description={description}
        modelSchema={{
          url: WORKFLOW_MANAGER_SCHEMA_SVG_URL,
          title: 'Workflow Manager Entity Schema',
          description: 'Workflow model entity diagram from service-workflow-manager.',
          previewSummary: 'SVG preview of the current Workflow Manager model schema.',
        }}
      />
    </>
  );
}
