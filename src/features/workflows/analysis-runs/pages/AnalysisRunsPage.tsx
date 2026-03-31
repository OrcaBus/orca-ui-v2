import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { mockAnalysisRuns, AnalysisRun } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { StatusCard } from '@/components/ui/StatusCard';
import { getStatusIcon } from '../../shared/utils/statusIcons';
import { useQueryParams } from '@/hooks/useQueryParams';
import {
  useAnalysisRunsQueryParams,
  type AnalysisRunStatus,
} from '../hooks/useAnalysisRunsQueryParams';

const AR_STATUS_CARDS: Array<{
  label: string;
  status: AnalysisRunStatus;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Succeeded', status: 'succeeded', variant: 'success' },
  { label: 'Failed', status: 'failed', variant: 'error' },
  { label: 'Aborted', status: 'aborted', variant: 'neutral' },
  { label: 'Resolved', status: 'resolved', variant: 'info' },
  { label: 'Deprecated', status: 'deprecated', variant: 'neutral' },
  { label: 'Ongoing', status: 'ongoing', variant: 'warning' },
];

export function AnalysisRunsPage() {
  const navigate = useNavigate();
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    status,
    setStatus,
    typeValue,
    setTypeValue,
    clearAllFilters,
    activeFilterBadges,
    filteredAnalysisRuns,
    analysisTypeOptions,
  } = useAnalysisRunsQueryParams({ analysisRuns: mockAnalysisRuns });

  const handleStatusCardClick = useCallback(
    (s: AnalysisRunStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  const columns: Column<AnalysisRun>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Analysis Run Name',
        sortable: true,
        render: (ar) => (
          <button
            onClick={() => {
              void navigate(`/workflows/analysisrun/${ar.id}`);
            }}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {ar.name}
          </button>
        ),
      },
      {
        key: 'analysisType',
        header: 'Analysis Type',
        sortable: true,
        render: (ar) => (
          <div>
            <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
              {ar.analysisName}
            </div>
            <div className='font-mono text-xs text-neutral-500'>{ar.analysisVersion}</div>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'State',
        sortable: true,
        render: (ar) => <StatusBadge status={ar.status} />,
      },
      {
        key: 'libraryCount',
        header: 'Libraries',
        sortable: true,
        render: (ar) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{ar.libraryCount}</div>
        ),
      },
      {
        key: 'contextCount',
        header: 'Context',
        sortable: true,
        render: (ar) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{ar.contextCount}</div>
        ),
      },
      {
        key: 'readsetCount',
        header: 'Readsets',
        sortable: true,
        render: (ar) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{ar.readsetCount}</div>
        ),
      },
    ],
    [navigate]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-6 gap-4'>
        {AR_STATUS_CARDS.map((card) => {
          const count = filteredAnalysisRuns.filter((ar) => ar.status === card.status).length;
          const percentage =
            filteredAnalysisRuns.length > 0
              ? Math.round((count / filteredAnalysisRuns.length) * 100)
              : 0;
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
        placeholder='Search by analysis run name, analysis run ID, attributes…'
        filters={
          <Select
            value={typeValue}
            onChange={setTypeValue}
            options={[
              { value: 'all', label: 'All Analysis Types' },
              ...analysisTypeOptions.map((type) => ({ value: type, label: type })),
            ]}
          />
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <DataTable
        data={filteredAnalysisRuns}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredAnalysisRuns.length,
        }}
      />
    </div>
  );
}
