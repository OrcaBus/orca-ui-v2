import { useNavigate } from 'react-router';
import { FileText, Info } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import type { Library } from '../../../data/mockData';

interface LibraryRelatedLibrariesTabProps {
  relatedLibraries: Library[];
}

export function LibraryRelatedLibrariesTab({ relatedLibraries }: LibraryRelatedLibrariesTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, relatedLibraries.length);

  const relatedLibrariesColumns: Column<Library>[] = [
    {
      key: 'name',
      header: 'Library ID',
      sortable: true,
      render: (lib) => (
        <button
          onClick={() => void navigate(`/lab/${lib.id}`)}
          className='font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {lib.name}
        </button>
      ),
    },
    {
      key: 'subjectId',
      header: 'Individual ID',
      sortable: true,
      render: (lib) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{lib.subjectId}</span>
      ),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-900 capitalize dark:text-white'>{lib.phenotype}</span>
      ),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{lib.workflow}</span>
      ),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      render: (lib) => (
        <PillTag
          variant={lib.quality >= 8 ? 'green' : lib.quality >= 7 ? 'amber' : 'neutral'}
          size='sm'
        >
          {lib.quality.toFixed(1)}
        </PillTag>
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
      key: 'assay',
      header: 'Assay',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{lib.assay}</span>
      ),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      render: (lib) => (
        <span className='text-sm text-neutral-900 dark:text-white'>{lib.coverage}x</span>
      ),
    },
    {
      key: 'overrideCycles',
      header: 'Override Cycles',
      sortable: true,
      render: (lib) => (
        <span className='font-mono text-xs text-neutral-900 dark:text-white'>
          {lib.overrideCycles}
        </span>
      ),
    },
    {
      key: 'sampleId',
      header: 'Sample ID',
      sortable: true,
      render: (lib) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>{lib.sampleId}</span>
      ),
    },
    {
      key: 'externalSampleId',
      header: 'External Sample ID',
      sortable: true,
      render: (lib) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-white'>
          {lib.externalSampleId}
        </span>
      ),
    },
  ];

  if (relatedLibraries.length === 0) {
    return (
      <div className='rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-[#2d3540] dark:bg-[#111418]'>
        <FileText className='mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
        <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>No related libraries</h3>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          No other libraries share the same individual ID.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4 flex items-center gap-2 text-sm text-neutral-600 dark:text-[#9dabb9]'>
        <Info className='h-4 w-4' />
        <span>Related is determined based on the same individual ID</span>
      </div>
      <DataTable
        data={relatedLibraries}
        columns={relatedLibrariesColumns}
        paginationProps={pagination}
      />
    </div>
  );
}
