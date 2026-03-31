import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { mockWorkflowRuns, WorkflowRun } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusCard } from '@/components/ui/StatusCard';
import { PillTag } from '@/components/ui/PillTag';
import { formatTableDate } from '@/utils/timeFormat';
import { getStatusIcon } from '../../shared/utils/statusIcons';
import { useQueryParams } from '@/hooks/useQueryParams';
import {
  useWorkflowRunsQueryParams,
  type WorkflowRunStatus,
} from '../hooks/useWorkflowRunsQueryParams';

const WF_STATUS_CARDS: Array<{
  label: string;
  status: WorkflowRunStatus;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Succeeded', status: 'succeeded', variant: 'success' },
  { label: 'Failed', status: 'failed', variant: 'error' },
  { label: 'Aborted', status: 'aborted', variant: 'neutral' },
  { label: 'Resolved', status: 'resolved', variant: 'info' },
  { label: 'Deprecated', status: 'deprecated', variant: 'neutral' },
  { label: 'Ongoing', status: 'ongoing', variant: 'warning' },
];

export function WorkflowRunsPage() {
  const navigate = useNavigate();
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    status,
    setStatus,
    typeValues,
    setTypeValues,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflowRuns,
    workflowTypeOptions,
  } = useWorkflowRunsQueryParams({ workflowRuns: mockWorkflowRuns });

  const handleStatusCardClick = useCallback(
    (s: WorkflowRunStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  const columns: Column<WorkflowRun>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Run Name',
        sortable: true,
        render: (wf) => (
          <button
            onClick={() => {
              void navigate(`/workflows/workflowrun/${wf.id}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {wf.name}
          </button>
        ),
      },
      {
        key: 'portalRunId',
        header: 'Portal Run ID',
        sortable: true,
        render: (wf) => (
          <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {wf.portalRunId}
          </div>
        ),
      },
      {
        key: 'executionId',
        header: 'Execution ID',
        sortable: true,
        render: (wf) => <div className='font-mono text-sm text-neutral-500'>{wf.executionId}</div>,
      },
      {
        key: 'workflowType',
        header: 'Workflow Type',
        sortable: true,
        render: (wf) => <PillTag variant='blue'>{wf.workflowType}</PillTag>,
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (wf) => <StatusBadge status={wf.status} />,
      },
      {
        key: 'lastModified',
        header: 'Last Modified',
        sortable: true,
        render: (wf) => <div className='text-sm'>{formatTableDate(wf.lastModified)}</div>,
      },
    ],
    [navigate]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-6 gap-4'>
        {WF_STATUS_CARDS.map((card) => {
          const count = mockWorkflowRuns.filter((wf) => wf.status === card.status).length;
          const percentage =
            mockWorkflowRuns.length > 0 ? Math.round((count / mockWorkflowRuns.length) * 100) : 0;
          return (
            <StatusCard
              key={card.status}
              label={card.label}
              value={count}
              percentage={percentage}
              icon={getStatusIcon(card.status)}
              variant={card.variant}
              selected={status === card.status}
              onClick={() => handleStatusCardClick(card.status)}
            />
          );
        })}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder='Search by workflow run name, portal run ID, execution ID…'
        filters={
          <>
            <div className='flex items-center gap-2'>
              <label className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'>
                From:
              </label>
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'>
                To:
              </label>
              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              />
            </div>
            <MultiSelect
              values={typeValues}
              onChange={setTypeValues}
              options={workflowTypeOptions.map((type) => ({ value: type, label: type }))}
              placeholder='All Workflow Types'
            />
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <DataTable
        data={filteredWorkflowRuns}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredWorkflowRuns.length,
        }}
      />
    </div>
  );
}
