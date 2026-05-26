import { useState } from 'react';
import dayjs from 'dayjs';
import { History, X } from 'lucide-react';
import { DataTable, type Column } from '../../../components/tables/DataTable';
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

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      <div className='relative w-full max-w-2xl rounded-lg border border-transparent bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <button
          onClick={onClose}
          className='absolute top-4 right-4 rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-[#2d3540] dark:hover:text-slate-200'
        >
          <X className='h-4 w-4' />
        </button>

        <div className='flex items-start gap-4 border-b border-neutral-200 p-6 dark:border-[#2d3540]'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-500/10'>
            <History className='h-5 w-5 text-blue-600 dark:text-blue-400' />
          </div>
          <div className='min-w-0 flex-1 pr-6'>
            <h2 className='text-base font-semibold text-neutral-900 dark:text-slate-100'>
              REDCap Sync History
            </h2>
            <p className='mt-1 text-sm text-neutral-500 dark:text-[#9dabb9]'>
              Past automatic imports from REDCap.
            </p>
          </div>
        </div>

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
      </div>
    </div>
  );
}
