import { useMemo } from 'react';
import { Link } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PillTag } from '@/components/ui/PillTag';
import { mockWorkflowRuns, mockLibraries, mockFiles, WorkflowRun } from '@/data/mockData';
import { formatTableDate } from '@/utils/timeFormat';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useVaultWorkflowsQueryParams } from '../hooks/useVaultWorkflowsQueryParams';
import { Hash, PlayCircle, CheckCircle, XCircle, FileText } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'deprecated', label: 'Deprecated' },
];

export function VaultWorkflowsPage() {
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflows,
    workflowTypes,
  } = useVaultWorkflowsQueryParams({ workflowRuns: mockWorkflowRuns });

  const columns: Column<WorkflowRun>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Name',
        sortable: true,
        render: (wf) => (
          <Link
            to={`/workflows/workflowrun/${wf.id}`}
            className='text-sm text-blue-600 hover:underline dark:text-blue-400'
          >
            {wf.name}
          </Link>
        ),
      },
      {
        key: 'workflowType',
        header: 'Type',
        sortable: true,
        render: (wf) => (
          <PillTag variant='purple' size='sm'>
            {wf.workflowType}
          </PillTag>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (wf) => <StatusBadge status={wf.status} size='sm' />,
      },
      {
        key: 'libraryId',
        header: 'Library',
        sortable: true,
        render: (wf) => {
          const library = mockLibraries.find((l) => l.id === wf.libraryId);
          return library ? (
            <Link
              to={`/lab/${library.id}`}
              className='flex items-center gap-1 font-mono text-sm text-blue-600 hover:underline dark:text-blue-400'
            >
              {library.name}
              <ExternalLink className='h-3 w-3' />
            </Link>
          ) : (
            <span className='text-xs text-neutral-400'>-</span>
          );
        },
      },
      {
        key: 'startTime',
        header: 'Started',
        sortable: true,
        render: (wf) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(wf.startTime)}
          </div>
        ),
      },
      {
        key: 'outputFiles',
        header: 'Output Files',
        sortable: false,
        render: (wf) => {
          const files = mockFiles.filter((f) => f.sourceWorkflowId === wf.id);
          return files.length > 0 ? (
            <div className='flex w-fit items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs dark:bg-amber-950'>
              <FileText className='h-3 w-3 text-amber-600 dark:text-amber-400' />
              <span className='font-medium text-amber-900 dark:text-amber-300'>{files.length}</span>
            </div>
          ) : (
            <span className='text-xs text-neutral-400'>-</span>
          );
        },
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total Workflows',
        value: mockWorkflowRuns.length,
        variant: 'neutral' as const,
        icon: <Hash className='h-5 w-5 text-neutral-400' />,
      },
      {
        label: 'Ongoing',
        value: mockWorkflowRuns.filter((w) => w.status === 'ongoing').length,
        variant: 'info' as const,
        icon: (
          <PlayCircle
            className='h-5 w-5 text-blue-500'
            fill='currentColor'
            stroke='white'
            strokeWidth={1.5}
          />
        ),
      },
      {
        label: 'Succeeded',
        value: mockWorkflowRuns.filter((w) => w.status === 'succeeded').length,
        variant: 'success' as const,
        icon: (
          <CheckCircle
            className='h-5 w-5 text-green-500'
            fill='currentColor'
            stroke='white'
            strokeWidth={1.5}
          />
        ),
      },
      {
        label: 'Failed',
        value: mockWorkflowRuns.filter((w) => w.status === 'failed').length,
        variant: 'error' as const,
        icon: (
          <XCircle
            className='h-5 w-5 text-red-500'
            fill='currentColor'
            stroke='white'
            strokeWidth={1.5}
          />
        ),
      },
    ],
    []
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-4'>
        {stats.map((stat, index) => (
          <StatusCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            variant={stat.variant}
          />
        ))}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder='Search workflows by name, type, ID…'
        searchId='vault-workflows-search'
        filters={
          <>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                ...workflowTypes.map((type) => ({ value: type, label: type })),
              ]}
            />
            <Select value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <div className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
        Showing {filteredWorkflows.length} of {mockWorkflowRuns.length} workflows
      </div>

      <DataTable
        data={filteredWorkflows}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredWorkflows.length,
        }}
      />
    </div>
  );
}
