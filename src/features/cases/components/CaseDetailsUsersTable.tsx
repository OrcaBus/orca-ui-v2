import { Trash2, UserPlus } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatTableDate } from '@/utils/timeFormat';
import { type CaseUserLinkModel } from '../api/cases.api';

export interface CaseDetailsUsersTableProps {
  users: CaseUserLinkModel[];
  onRemoveUser: (userOrcabusId: string, userEmail: string) => void;
}

export function CaseDetailsUsersTable({ users, onRemoveUser }: CaseDetailsUsersTableProps) {
  const pagination = useTablePagination(1, DEFAULT_PAGE_SIZE, users.length);

  const columns: Column<CaseUserLinkModel>[] = [
    {
      key: 'email',
      header: 'Email',
      render: (link) => (
        <span className='text-sm font-medium text-neutral-900 dark:text-white'>
          {link.user.email}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (link) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {link.user.name ?? <span className='text-neutral-400'>—</span>}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Role / Description',
      render: (link) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {link.description ?? <span className='text-neutral-400'>—</span>}
        </span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Added',
      render: (link) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {formatTableDate(link.timestamp)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (link) => (
        <button
          type='button'
          onClick={() => onRemoveUser(link.user.orcabusId, link.user.email)}
          title={`Remove ${link.user.email}`}
          className='rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      ),
    },
  ];

  if (users.length === 0) {
    return (
      <div className='flex min-h-60 items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
        <EmptyState
          icon={UserPlus}
          title='No users assigned'
          description='Add users to this case to grant them access and visibility.'
        />
      </div>
    );
  }

  return (
    <DataTable
      data={users}
      columns={columns}
      emptyMessage='No users found.'
      paginationProps={users.length > DEFAULT_PAGE_SIZE ? pagination : undefined}
    />
  );
}
