import { useMemo } from 'react';
import { Link } from 'react-router';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { PillTag } from '@/components/ui/PillTag';
import { mockLibraries, mockWorkflowRuns, mockFiles, Library } from '@/data/mockData';
import { formatTableDate } from '@/utils/timeFormat';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useLimsQueryParams } from '../hooks/useLimsQueryParams';
import { Hash, Dna, TestTubes, FlaskConical, Workflow, FileText } from 'lucide-react';

const LIBRARY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Library Types' },
  { value: 'WGS', label: 'WGS' },
  { value: 'WTS', label: 'WTS' },
  { value: 'ctDNA', label: 'ctDNA' },
];

export function LimsPage() {
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const {
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    clearAllFilters,
    activeFilterBadges,
    filteredLibraries,
  } = useLimsQueryParams({ libraries: mockLibraries });

  const columns: Column<Library>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Library ID',
        sortable: true,
        render: (lib) => (
          <Link
            to={`/lab/${lib.id}`}
            className='font-mono text-sm text-blue-600 hover:underline dark:text-blue-400'
          >
            {lib.name}
          </Link>
        ),
      },
      {
        key: 'sampleId',
        header: 'Sample ID',
        sortable: true,
        render: (lib) => (
          <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {lib.sampleId}
          </span>
        ),
      },
      {
        key: 'type',
        header: 'Type',
        sortable: true,
        render: (lib) => (
          <PillTag variant='blue' size='sm'>
            {lib.type}
          </PillTag>
        ),
      },
      {
        key: 'workflow',
        header: 'Workflow',
        sortable: true,
        render: (lib) => (
          <span className='text-sm text-neutral-900 dark:text-neutral-100'>{lib.workflow}</span>
        ),
      },
      {
        key: 'createdDate',
        header: 'Date Received',
        sortable: true,
        render: (lib) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(lib.createdDate)}
          </div>
        ),
      },
      {
        key: 'relationships',
        header: 'Relationships',
        sortable: false,
        render: (lib) => {
          const workflows = mockWorkflowRuns.filter((w) => w.libraryId === lib.id);
          const files = mockFiles.filter((f) => f.relatedLibraryId === lib.id);
          return (
            <div className='flex items-center gap-2'>
              {workflows.length > 0 && (
                <div className='flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs dark:bg-green-950'>
                  <Workflow className='h-3 w-3 text-green-600 dark:text-green-400' />
                  <span className='font-medium text-green-900 dark:text-green-300'>
                    {workflows.length}
                  </span>
                </div>
              )}
              {files.length > 0 && (
                <div className='flex items-center gap-1 rounded bg-amber-50 px-2 py-1 text-xs dark:bg-amber-950'>
                  <FileText className='h-3 w-3 text-amber-600 dark:text-amber-400' />
                  <span className='font-medium text-amber-900 dark:text-amber-300'>
                    {files.length}
                  </span>
                </div>
              )}
            </div>
          );
        },
      },
    ],
    []
  );

  const stats = useMemo(
    () => [
      {
        label: 'Total Libraries',
        value: mockLibraries.length,
        variant: 'neutral' as const,
        icon: <Hash className='h-5 w-5 text-neutral-400' />,
      },
      {
        label: 'WGS Libraries',
        value: mockLibraries.filter((l) => l.type === 'WGS').length,
        variant: 'info' as const,
        icon: <Dna className='h-5 w-5 text-blue-500' />,
      },
      {
        label: 'WTS Libraries',
        value: mockLibraries.filter((l) => l.type === 'WTS').length,
        variant: 'info' as const,
        icon: <TestTubes className='h-5 w-5 text-blue-500' />,
      },
      {
        label: 'ctDNA Libraries',
        value: mockLibraries.filter((l) => l.type === 'ctDNA').length,
        variant: 'info' as const,
        icon: <FlaskConical className='h-5 w-5 text-blue-500' />,
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
        placeholder='Search by Library ID, Sample ID…'
        searchId='lims-search'
        filters={
          <Select value={typeFilter} onChange={setTypeFilter} options={LIBRARY_TYPE_OPTIONS} />
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <div className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
        Showing {filteredLibraries.length} of {mockLibraries.length} libraries
      </div>

      <DataTable
        data={filteredLibraries}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredLibraries.length,
        }}
      />
    </div>
  );
}
