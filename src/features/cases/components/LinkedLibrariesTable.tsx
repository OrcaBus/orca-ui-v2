import { useNavigate } from 'react-router';
import { Link as LinkIcon, Unlink } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { formatTableDate } from '../../../utils/timeFormat';
import type { Library } from '../api/cases.api';

interface LinkedLibrariesTableProps {
  linkedLibraries: Library[];
  caseLastModified: string;
  onLinkLibraries: () => void;
  onUnlinkLibrary: (libraryId: string) => void;
}

export function LinkedLibrariesTable({
  linkedLibraries,
  caseLastModified,
  onLinkLibraries,
  onUnlinkLibrary,
}: LinkedLibrariesTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, linkedLibraries.length);

  const columns: Column<Library>[] = [
    {
      key: 'name',
      header: 'Library ID',
      sortable: true,
      render: (lib) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/lab/${lib.id}`);
          }}
          className='font-mono text-blue-600 hover:underline dark:text-blue-400'
        >
          {lib.name}
        </button>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (lib) => (
        <PillTag variant='purple' size='sm'>
          {lib.type}
        </PillTag>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (lib) => (
        <PillTag
          variant={
            lib.status === 'ready' ? 'green' : lib.status === 'processing' ? 'blue' : 'amber'
          }
          size='sm'
        >
          {lib.status}
        </PillTag>
      ),
    },
    {
      key: 'linkedDate',
      header: 'Linked Date',
      render: () => (
        <span className='text-neutral-600 dark:text-[#9dabb9]'>
          {formatTableDate(caseLastModified)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (lib) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onUnlinkLibrary(lib.id);
          }}
          className='rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
          title='Unlink library'
        >
          <Unlink className='h-4 w-4' />
        </button>
      ),
    },
  ];

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
          Linked Libraries
        </h3>
        <button
          onClick={onLinkLibraries}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
        >
          <LinkIcon className='h-4 w-4' />
          Link Libraries
        </button>
      </div>
      <DataTable
        data={linkedLibraries}
        columns={columns}
        emptyMessage='No libraries linked yet.'
        paginationProps={pagination}
      />
    </div>
  );
}
