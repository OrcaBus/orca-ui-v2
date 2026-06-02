import { useState } from 'react';
import dayjs from 'dayjs';
import { History } from 'lucide-react';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { useCaseSyncFromRedcapAutoHistoryModel, type ExternalSyncLogModel } from '../api/cases.api';

interface SyncHistoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLUMNS: Column<ExternalSyncLogModel>[] = [
  {
    key: 'id',
    header: 'ID',
    render: (entry) => <span className='font-mono text-xs text-neutral-500'>{entry.id}</span>,
  },
  {
    key: 'externalService',
    header: 'Service',
    render: (entry) => (
      <span className='inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'>
        {entry.externalService}
      </span>
    ),
  },
  {
    key: 'importedAt',
    header: 'Imported At',
    render: (entry) => (
      <span className='font-mono text-sm text-neutral-700 dark:text-slate-300'>
        {dayjs(entry.importedAt).format('YYYY-MM-DD HH:mm Z')}
      </span>
    ),
  },
];

export function SyncHistoryDialog({ isOpen, onClose }: SyncHistoryDialogProps) {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const { data, isLoading, refetch } = useCaseSyncFromRedcapAutoHistoryModel({
    params: { query: { page, rowsPerPage } },
    reactQuery: { enabled: isOpen },
  });

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='REDCap Sync History'
      description='Past automatic imports from REDCap.'
      icon={<History className='h-5 w-5' />}
      size='md'
      bodyClassName='p-0'
    >
      <div className='p-4'>
        <DataTable<ExternalSyncLogModel>
          data={data?.results ?? []}
          columns={COLUMNS}
          isLoading={isLoading}
          inCard
          emptyMessage='No sync history found.'
          onRefresh={() => void refetch()}
          paginationProps={{
            page: data?.pagination.page ?? page,
            pageSize: data?.pagination.rowsPerPage ?? rowsPerPage,
            totalItems: data?.pagination.count ?? 0,
            onPageChange: (p) => setPage(p),
            onPageSizeChange: (size) => {
              setRowsPerPage(size);
              setPage(1);
            },
          }}
        />
      </div>
    </DialogFrame>
  );
}
