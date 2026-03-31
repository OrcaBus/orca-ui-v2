import { useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Eye } from 'lucide-react';
import { mockAnalysisTypes, AnalysisType } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { PillTag } from '@/components/ui/PillTag';
import { AnalysisTypeDetailsDrawer } from '../components/AnalysisTypeDetailsDrawer';
import { useQueryParams } from '@/hooks/useQueryParams';
import { getAnalysisTypeIcon } from '../../shared/utils/statusIcons';
import { useAnalysisTypeDetailDrawer } from '../hooks/useAnalysisTypeDetailDrawer';
import {
  useAnalysisTypesQueryParams,
  type AnalysisTypeStatus,
} from '../hooks/useAnalysisTypesQueryParams';

export function AnalysisTypesPage() {
  const navigate = useNavigate();
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const { detailId, openDetail, closeDetail } = useAnalysisTypeDetailDrawer();
  const {
    search,
    setSearch,
    status,
    setStatus,
    clearAllFilters,
    activeFilterBadges,
    filteredAnalysisTypes,
  } = useAnalysisTypesQueryParams({ analysisTypes: mockAnalysisTypes });

  const handleAtStatusCardClick = useCallback(
    (s: AnalysisTypeStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  const selectedAnalysisType = useMemo(
    () => (detailId ? (mockAnalysisTypes.find((at) => at.id === detailId) ?? null) : null),
    [detailId]
  );

  /** Navigate to Analysis Runs tab with filter for this analysis type */
  const navigateToAnalysisRunsWithType = useCallback(
    (at: AnalysisType) => {
      const arType = encodeURIComponent(`${at.name} ${at.version}`);
      void navigate(`/workflows/analysisRuns?arType=${arType}`);
    },
    [navigate]
  );

  const columns: Column<AnalysisType>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Name',
        sortable: true,
        render: (at) => (
          <button
            onClick={() => navigateToAnalysisRunsWithType(at)}
            className='text-left text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
          >
            {at.name}
          </button>
        ),
      },
      {
        key: 'version',
        header: 'Version',
        sortable: true,
        render: (at) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{at.version}</div>
        ),
      },
      {
        key: 'linkage',
        header: 'Linkage',
        sortable: false,
        render: (at) => (
          <div className='flex flex-wrap items-center gap-2'>
            <PillTag variant='blue'>
              {at.linkedWorkflows.length}{' '}
              {at.linkedWorkflows.length === 1 ? 'workflow' : 'workflows'}
            </PillTag>
            <PillTag variant='purple'>
              {at.contexts.length} {at.contexts.length === 1 ? 'context' : 'contexts'}
            </PillTag>
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (at) => {
          const variantMap = {
            ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            INACTIVE: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
          };
          return (
            <span className={`rounded px-2 py-1 text-xs font-medium ${variantMap[at.status]}`}>
              {at.status}
            </span>
          );
        },
      },
      {
        key: 'description',
        header: 'Description',
        sortable: false,
        render: (at) => (
          <div
            className='max-w-md truncate text-sm text-neutral-700 dark:text-neutral-300'
            title={at.description}
          >
            {at.description}
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (at) => (
          <button
            onClick={() => openDetail(at.id)}
            className='rounded p-1.5 text-neutral-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-neutral-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
            title='View Details'
          >
            <Eye className='h-4 w-4' />
          </button>
        ),
      },
    ],
    [navigateToAnalysisRunsWithType, openDetail]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-3 gap-4'>
        <StatusCard
          label='Active'
          value={mockAnalysisTypes.filter((at) => at.status === 'ACTIVE').length}
          percentage={
            mockAnalysisTypes.length > 0
              ? Math.round(
                  (mockAnalysisTypes.filter((at) => at.status === 'ACTIVE').length /
                    mockAnalysisTypes.length) *
                    100
                )
              : 0
          }
          icon={getAnalysisTypeIcon('ACTIVE')}
          variant='success'
          selected={status === 'ACTIVE'}
          onClick={() => handleAtStatusCardClick('ACTIVE')}
        />
        <StatusCard
          label='Inactive'
          value={mockAnalysisTypes.filter((at) => at.status === 'INACTIVE').length}
          percentage={
            mockAnalysisTypes.length > 0
              ? Math.round(
                  (mockAnalysisTypes.filter((at) => at.status === 'INACTIVE').length /
                    mockAnalysisTypes.length) *
                    100
                )
              : 0
          }
          icon={getAnalysisTypeIcon('INACTIVE')}
          variant='neutral'
          selected={status === 'INACTIVE'}
          onClick={() => handleAtStatusCardClick('INACTIVE')}
        />
        <StatusCard
          label='Total'
          value={mockAnalysisTypes.length}
          icon={getAnalysisTypeIcon('total')}
          variant='info'
          selected={false}
        />
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder='Search by analysis name, analysis ID, version, description…'
        filters={
          <Select
            value={status}
            onChange={(value) => setStatus((value as AnalysisTypeStatus | 'all') || 'all')}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
            ]}
          />
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <DataTable
        data={filteredAnalysisTypes}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredAnalysisTypes.length,
        }}
      />

      {selectedAnalysisType && (
        <AnalysisTypeDetailsDrawer analysisType={selectedAnalysisType} onClose={closeDetail} />
      )}
    </div>
  );
}
