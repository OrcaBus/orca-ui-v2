import { useMemo } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockFiles, File } from '@/data/mockData';
import { formatTableDate } from '@/utils/timeFormat';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useBamsQueryParams, type BamsSizeFilter } from '../hooks/useBamsQueryParams';
import { Hash, AlertTriangle, HardDrive, FileCheck } from 'lucide-react';

const BAM_FILES = mockFiles.filter((f) => f.type === 'BAM');

const SIZE_OPTIONS = [
  { value: 'all', label: 'All Sizes' },
  { value: 'small', label: '< 10 GB' },
  { value: 'medium', label: '10 - 50 GB' },
  { value: 'large', label: '> 50 GB' },
];

const statusMap = {
  available: 'completed' as const,
  processing: 'running' as const,
  archived: 'queued' as const,
};

export function BamsPage() {
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    sizeFilter,
    setSizeFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredBams,
  } = useBamsQueryParams({ bamFiles: BAM_FILES });

  const columns: Column<File>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'File Name',
        sortable: true,
        render: (file) => (
          <div>
            <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
              {file.name}
            </div>
            <div className='max-w-xs truncate font-mono text-xs text-neutral-500 dark:text-neutral-400'>
              {file.s3Key}
            </div>
          </div>
        ),
      },
      {
        key: 'size',
        header: 'Size',
        sortable: true,
        render: (file) => (
          <span className='text-sm text-neutral-900 dark:text-neutral-100'>{file.size}</span>
        ),
      },
      {
        key: 'portalRunId',
        header: 'Portal Run ID',
        sortable: true,
        render: (file) =>
          file.portalRunId ? (
            <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
              {file.portalRunId}
            </span>
          ) : (
            <span className='text-xs text-neutral-400'>-</span>
          ),
      },
      {
        key: 'dateModified',
        header: 'Last Modified',
        sortable: true,
        render: (file) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(file.dateModified)}
          </div>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (file) => <StatusBadge status={statusMap[file.status]} size='sm' />,
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total BAM Files',
        value: BAM_FILES.length,
        variant: 'neutral' as const,
        icon: <Hash className='h-5 w-5 text-neutral-400' />,
      },
      {
        label: 'Large (>50GB)',
        value: BAM_FILES.filter((f) => f.sizeBytes >= 50_000_000_000).length,
        variant: 'warning' as const,
        icon: <AlertTriangle className='h-5 w-5 text-amber-500' />,
      },
      {
        label: 'Medium (10-50GB)',
        value: BAM_FILES.filter(
          (f) => f.sizeBytes >= 10_000_000_000 && f.sizeBytes < 50_000_000_000
        ).length,
        variant: 'info' as const,
        icon: <HardDrive className='h-5 w-5 text-blue-500' />,
      },
      {
        label: 'Available',
        value: BAM_FILES.filter((f) => f.status === 'available').length,
        variant: 'success' as const,
        icon: (
          <FileCheck
            className='h-5 w-5 text-green-500'
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
        placeholder='Search BAM files by name, S3 key, Portal Run ID…'
        searchId='bams-search'
        filters={
          <Select
            value={sizeFilter}
            onChange={(v) => setSizeFilter(v as BamsSizeFilter)}
            options={SIZE_OPTIONS}
          />
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <div className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
        Showing {filteredBams.length} of {BAM_FILES.length} BAM files
      </div>

      {filteredBams.length > 0 ? (
        <DataTable
          data={filteredBams}
          columns={columns}
          paginationProps={{
            page: pagination.page,
            pageSize: pagination.rowsPerPage,
            onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
            onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
            totalItems: filteredBams.length,
          }}
        />
      ) : (
        <EmptyState
          icon={HardDrive}
          title='No BAM Files Found'
          description='No BAM alignment files match your search criteria.'
        />
      )}
    </div>
  );
}
