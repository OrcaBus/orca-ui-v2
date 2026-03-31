import { useState, useMemo } from 'react';
import { Download, Eye, FileText, Copy, ListFilter } from 'lucide-react';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DataTable, type Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { getRelativeTime } from '../../../utils/timeFormat';
import { copyToClipboard, formatBytes, getFileTypeBadgeStyle } from '../utils/copyPath';
import type { WorkflowRun, File } from '../../../data/mockData';

interface LibraryFilesTabProps {
  relatedWorkflows: WorkflowRun[];
  filesForWorkflow: (workflowRunId: string) => File[];
}

export function LibraryFilesTab({ relatedWorkflows, filesForWorkflow }: LibraryFilesTabProps) {
  const firstWorkflowId = relatedWorkflows[0]?.id ?? null;
  const [selectedWorkflowRunId, setSelectedWorkflowRunId] = useState<string | null>(
    firstWorkflowId
  );
  const selectedWorkflowRun = relatedWorkflows.find((wf) => wf.id === selectedWorkflowRunId);
  const selectedWorkflowFiles = selectedWorkflowRun ? filesForWorkflow(selectedWorkflowRun.id) : [];
  const filesPagination = useTablePagination(1, 20, selectedWorkflowFiles.length);

  const handleCopyPath = (path: string) => copyToClipboard(path);
  const handleCopyAllPaths = () => {
    const paths = selectedWorkflowFiles.map((f) => f.s3Key).join('\n');
    copyToClipboard(paths);
  };

  const fileColumns: Column<File>[] = useMemo(
    () => [
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
              <div className='text-sm font-medium text-neutral-900 dark:text-white'>
                {file.name}
              </div>
              <div className='font-mono text-xs text-neutral-500 dark:text-[#8892a2]'>
                {file.s3Key.substring(0, file.s3Key.lastIndexOf('/') + 1)}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (file) => (
          <div className='flex items-center gap-1'>
            <button
              className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
              title='View'
            >
              <Eye className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
            </button>
            <button
              onClick={() => handleCopyPath(file.s3Key)}
              className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
              title='Copy Path'
            >
              <Copy className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
            </button>
            <button
              className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
              title='Download'
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
          <div className='text-sm text-neutral-900 dark:text-[#9dabb9]'>
            {formatBytes(file.sizeBytes)}
          </div>
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
    ],
    []
  );

  if (relatedWorkflows.length === 0) {
    return (
      <div className='rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-[#2d3540] dark:bg-[#111418]'>
        <FileText className='mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
        <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>No workflow runs</h3>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          This library has not been processed by any workflows yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className='flex overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ minHeight: '480px' }}
    >
      {/* Left Panel: Workflow Runs List */}
      <div className='flex w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#0d1117]'>
        <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-white'>Workflow Runs</h3>
          <ListFilter className='h-4 w-4 text-neutral-400 dark:text-[#6b7a8d]' />
        </div>
        <div className='flex-1 overflow-y-auto'>
          {relatedWorkflows.map((wf) => {
            const isSelected = selectedWorkflowRunId === wf.id;
            return (
              <button
                key={wf.id}
                onClick={() => setSelectedWorkflowRunId(wf.id)}
                className={`w-full cursor-pointer px-4 py-3.5 text-left transition-colors ${
                  isSelected
                    ? 'border-l-2 border-l-blue-400! bg-white dark:bg-[#1e252e]'
                    : 'border-l-transparent hover:border-l-2 hover:border-l-gray-400! hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
                }`}
              >
                <div className='mb-0.5 flex items-start justify-between gap-2'>
                  <div
                    className={`truncate text-sm font-semibold ${isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'}`}
                  >
                    {wf.workflowType}
                  </div>
                  <span className='mt-0.5 text-[11px] whitespace-nowrap text-neutral-400 dark:text-[#6b7a8d]'>
                    {getRelativeTime(wf.lastModified ?? wf.startTime)}
                  </span>
                </div>
                <div className='mb-2 truncate text-xs text-neutral-500 dark:text-[#8892a2]'>
                  {wf.name}
                </div>
                <StatusBadge status={wf.status} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Panel: Workflow Outputs */}
      <div className='flex min-w-0 flex-1 flex-col'>
        {selectedWorkflowRun ? (
          <>
            <div className='flex items-start justify-between gap-4 border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
              <div>
                <div className='mb-1 flex items-baseline gap-2.5'>
                  <h3 className='text-base font-semibold text-neutral-900 dark:text-white'>
                    Workflow Outputs
                  </h3>
                  <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-sm text-neutral-500 dark:bg-[#1e252e] dark:text-[#8892a2]'>
                    {selectedWorkflowFiles.length}{' '}
                    {selectedWorkflowFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <p className='text-xs text-neutral-500 dark:text-[#8892a2]'>
                  Files generated by {selectedWorkflowRun.name}
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <button
                  onClick={handleCopyAllPaths}
                  className='inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
                >
                  <Copy className='h-3.5 w-3.5' />
                  Copy All Paths
                </button>
                <button className='inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700'>
                  <Download className='h-3.5 w-3.5' />
                  Download All
                </button>
              </div>
            </div>

            {selectedWorkflowFiles.length > 0 ? (
              <div className='flex-1 overflow-auto'>
                <DataTable
                  data={selectedWorkflowFiles}
                  columns={fileColumns}
                  inCard={true}
                  showToolbar={false}
                  paginationProps={filesPagination}
                />
              </div>
            ) : (
              <div className='flex flex-1 flex-col items-center justify-center p-12 text-center'>
                <FileText className='mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
                <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>
                  No files found
                </h3>
                <p className='text-sm text-neutral-500 dark:text-[#8892a2]'>
                  This workflow run has not generated any output files yet.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center p-12 text-center'>
            <FileText className='mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
            <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>
              Select a workflow run
            </h3>
            <p className='text-sm text-neutral-500 dark:text-[#8892a2]'>
              Choose a workflow run from the list to view its output files.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
