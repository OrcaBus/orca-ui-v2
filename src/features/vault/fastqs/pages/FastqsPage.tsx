import { useMemo } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { PillTag } from '@/components/ui/PillTag';
import { EmptyState } from '@/components/ui/EmptyState';
import { mockFiles, File } from '@/data/mockData';
import { formatTableDate } from '@/utils/timeFormat';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useFastqsQueryParams, type FastqsFormatFilter } from '../hooks/useFastqsQueryParams';
import { Hash, FileArchive, FileText, FileCheck, Dna } from 'lucide-react';

const FASTQ_FILES = mockFiles.filter((f) => f.type === 'FASTQ' || f.name.includes('fastq'));

const FORMAT_OPTIONS = [
  { value: 'all', label: 'All Formats' },
  { value: 'gzip', label: 'Gzip Compressed' },
  { value: 'ora', label: 'ORA Format' },
];

export function FastqsPage() {
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    formatFilter,
    setFormatFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredFastqs,
  } = useFastqsQueryParams({ fastqFiles: FASTQ_FILES });

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
        key: 'format',
        header: 'Format',
        sortable: true,
        render: (file) => {
          const format = file.name.endsWith('.ora')
            ? 'ORA'
            : file.name.endsWith('.gz')
              ? 'Gzip'
              : 'Uncompressed';
          const variant = format === 'ORA' ? 'green' : format === 'Gzip' ? 'blue' : 'neutral';
          return (
            <PillTag variant={variant} size='sm'>
              {format}
            </PillTag>
          );
        },
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
    ],
    []
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total FASTQ Files',
        value: FASTQ_FILES.length,
        variant: 'neutral' as const,
        icon: <Hash className='h-5 w-5 text-neutral-400' />,
      },
      {
        label: 'Gzipped',
        value: FASTQ_FILES.filter((f) => f.name.endsWith('.gz')).length,
        variant: 'info' as const,
        icon: <FileArchive className='h-5 w-5 text-blue-500' />,
      },
      {
        label: 'ORA Format',
        value: FASTQ_FILES.filter((f) => f.name.endsWith('.ora')).length,
        variant: 'success' as const,
        icon: <FileText className='h-5 w-5 text-green-500' />,
      },
      {
        label: 'Available',
        value: FASTQ_FILES.filter((f) => f.status === 'available').length,
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
        searchPlaceholder='Search FASTQ files by name, S3 key, Portal Run ID…'
        searchId='fastqs-search'
        filters={
          <Select
            value={formatFilter}
            onChange={(v) => setFormatFilter(v as FastqsFormatFilter)}
            options={FORMAT_OPTIONS}
          />
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <div className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
        Showing {filteredFastqs.length} of {FASTQ_FILES.length} FASTQ files
      </div>

      {filteredFastqs.length > 0 ? (
        <DataTable
          data={filteredFastqs}
          columns={columns}
          paginationProps={{
            page: pagination.page,
            pageSize: pagination.rowsPerPage,
            onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
            onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
            totalItems: filteredFastqs.length,
          }}
        />
      ) : (
        <EmptyState
          icon={Dna}
          title='No FASTQ Files Found'
          description='No FASTQ sequencing files match your search criteria.'
        />
      )}
    </div>
  );
}
