import { Check, Copy, Download, Eye } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { getFileTypeBadgeStyle } from '@/features/lab/utils/copyPath';
import type { File } from '@/data/mockData';

export interface FilesResultsTableProps {
  files: File[];
  paginationProps: {
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
    totalItems: number;
  };
  onCopyPath: (file: File) => void;
  onOpenDetails: (file: File) => void;
  copiedPathId: string | null;
}

export function FilesResultsTable({
  files,
  paginationProps,
  onCopyPath,
  onOpenDetails,
  copiedPathId,
}: FilesResultsTableProps) {
  const columns: Column<File>[] = [
    {
      key: 'name',
      header: 'File Name',
      sortable: true,
      render: (file) => (
        <div className='flex items-center gap-3'>
          <span
            className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getFileTypeBadgeStyle(file.type)}`}
          >
            {file.type}
          </span>
          <div>
            <div className='text-sm font-medium text-neutral-900 dark:text-white'>{file.name}</div>
            <div className='font-mono text-xs text-neutral-500 dark:text-[#8892a2]'>
              {file.s3Key.includes('/')
                ? file.s3Key.substring(0, file.s3Key.lastIndexOf('/') + 1)
                : ''}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (file) => (
        <div className='flex items-center gap-1'>
          <button
            type='button'
            onClick={() => onOpenDetails(file)}
            className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
            title='View'
          >
            <Eye className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
          </button>
          <button
            type='button'
            onClick={() => onCopyPath(file)}
            className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
            title='Copy path'
          >
            {copiedPathId === file.id ? (
              <Check className='h-4 w-4 text-green-600' />
            ) : (
              <Copy className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
            )}
          </button>
          <button
            type='button'
            className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
            title='Download'
            onClick={() => console.log('Download file:', file.id)}
          >
            <Download className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
          </button>
        </div>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      render: (file) => (
        <span className='text-sm text-neutral-900 dark:text-[#9dabb9]'>{file.size}</span>
      ),
    },
    {
      key: 'dateModified',
      header: 'Last Modified',
      sortable: true,
      render: (file) => (
        <div className='text-sm text-neutral-900 dark:text-[#9dabb9]'>
          {new Date(file.dateModified).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
          {', '}
          {new Date(file.dateModified).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })}
        </div>
      ),
    },
  ];

  return <DataTable data={files} columns={columns} paginationProps={paginationProps} />;
}
