import { useNavigate } from 'react-router';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import type { Library } from '../../../data/mockData';

interface SequenceRelatedLibrariesTabProps {
  libraries: Library[];
}

export function SequenceRelatedLibrariesTab({ libraries }: SequenceRelatedLibrariesTabProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, libraries.length);

  const columns: Column<Library>[] = [
    {
      key: 'name',
      header: 'Library ID',
      sortable: true,
      render: (library) => (
        <button
          onClick={() => void navigate(`/lab/${library.id}`)}
          className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
        >
          {library.name}
        </button>
      ),
    },
    {
      key: 'sampleId',
      header: 'Sample ID',
      sortable: true,
      render: (library) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
          {library.sampleId}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (library) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>{library.type}</span>
      ),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      render: (library) => (
        <span className='text-sm text-neutral-900 capitalize dark:text-neutral-100'>
          {library.phenotype}
        </span>
      ),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      render: (library) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>{library.workflow}</span>
      ),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      render: (library) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {library.quality.toFixed(1)}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={libraries}
      emptyMessage='No related libraries found for this instrument run'
      paginationProps={pagination}
    />
  );
}
