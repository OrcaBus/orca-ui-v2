import { useNavigate } from 'react-router';
import { Info } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { formatTableDate } from '../../../utils/timeFormat';
import type { File, WorkflowRun } from '../api/cases.api';

interface FilesTableProps {
  files: File[];
  workflowRuns: WorkflowRun[];
}

export function FilesTable({ files, workflowRuns }: FilesTableProps) {
  const navigate = useNavigate();
  const pagination = useTablePagination(1, 20, files.length);

  const columns: Column<File>[] = [
    {
      key: 's3Key',
      header: 'File Name/Key',
      sortable: true,
      render: (file) => (
        <div className='font-mono text-xs text-blue-600 hover:underline dark:text-blue-400'>
          {file.s3Key}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (file) => (
        <PillTag variant='blue' size='sm'>
          {file.type}
        </PillTag>
      ),
    },
    {
      key: 'reportType',
      header: 'Report Type',
      sortable: true,
      render: (file) => (
        <span className='text-neutral-600 dark:text-[#9dabb9]'>{file.reportType || '—'}</span>
      ),
    },
    {
      key: 'size',
      header: 'Size',
      sortable: true,
      render: (file) => <span className='text-neutral-600 dark:text-[#9dabb9]'>{file.size}</span>,
    },
    {
      key: 'dateModified',
      header: 'Modified',
      sortable: true,
      render: (file) => (
        <span className='text-neutral-600 dark:text-[#9dabb9]'>
          {formatTableDate(file.dateModified)}
        </span>
      ),
    },
    {
      key: 'sourceWorkflow',
      header: 'Source Workflow Run',
      render: (file) => {
        const wf = workflowRuns.find((r) => r.id === file.workflowRunId);
        return wf ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              void navigate(`/workflows/${wf.id}`);
            }}
            className='text-xs text-blue-600 hover:underline dark:text-blue-400'
          >
            {wf.name}
          </button>
        ) : (
          <span className='text-xs text-neutral-500 dark:text-[#9dabb9]'>—</span>
        );
      },
    },
  ];

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>Files</h3>
          <div className='mt-1 flex items-center gap-2'>
            <Info className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
              Derived from workflow runs (read-only)
            </p>
          </div>
        </div>
      </div>
      <DataTable
        data={files}
        columns={columns}
        emptyMessage='No files available. Files will appear when workflow runs are added.'
        paginationProps={pagination}
      />
    </div>
  );
}
