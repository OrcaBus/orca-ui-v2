import { Link } from 'react-router';
import { Check, Copy, Download, Eye, Link as LinkIcon, ExternalLink } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import type { File } from '@/data/mockData';
import type { WorkflowRun } from '@/data/mockData';
import type { Library } from '@/data/mockData';

const PREVIEWABLE_TYPES = ['HTML', 'PDF', 'PNG', 'JPG', 'JPEG', 'SVG', 'TXT', 'CSV'];

function isPreviewable(fileType: string): boolean {
  return PREVIEWABLE_TYPES.includes(fileType.toUpperCase());
}

export interface FileDetailsDrawerProps {
  file: File;
  onCopyPath: (file: File) => void;
  onCopyPresignUrl: (file: File) => void;
  copiedPathId: string | null;
  copiedPresignId: string | null;
  workflowRun?: Pick<WorkflowRun, 'id' | 'workflowType'> | null;
  library?: Pick<Library, 'id' | 'name'> | null;
}

export function FileDetailsDrawer({
  file,
  onCopyPath,
  onCopyPresignUrl,
  copiedPathId,
  copiedPresignId,
  workflowRun,
  library,
}: FileDetailsDrawerProps) {
  const statusMap = {
    available: 'completed' as const,
    processing: 'running' as const,
    archived: 'queued' as const,
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
          File Name
        </h3>
        <p className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{file.name}</p>
      </div>

      <div>
        <div className='mb-1 flex items-center justify-between'>
          <h3 className='text-sm font-medium text-neutral-500 dark:text-neutral-400'>S3 Path</h3>
          <button
            type='button'
            onClick={() => onCopyPath(file)}
            className='flex items-center gap-1 text-xs text-blue-600 hover:underline dark:text-blue-400'
          >
            {copiedPathId === file.id ? (
              <>
                <Check className='h-3 w-3' />
                Copied!
              </>
            ) : (
              <>
                <Copy className='h-3 w-3' />
                Copy
              </>
            )}
          </button>
        </div>
        <p className='rounded bg-neutral-50 p-2 font-mono text-xs break-all text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'>
          s3://{file.bucket}/{file.s3Key}
        </p>
      </div>

      <div>
        <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>Type</h3>
        <PillTag variant='blue' size='sm'>
          {file.type}
        </PillTag>
      </div>

      {file.reportType && (
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Report Type
          </h3>
          <p className='text-sm text-neutral-900 dark:text-neutral-100'>{file.reportType}</p>
        </div>
      )}

      <div>
        <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>Size</h3>
        <p className='text-sm text-neutral-900 dark:text-neutral-100'>{file.size}</p>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Created
          </h3>
          <p className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(file.dateCreated)}
          </p>
        </div>
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Modified
          </h3>
          <p className='text-sm text-neutral-900 dark:text-neutral-100'>
            {formatTableDate(file.dateModified)}
          </p>
        </div>
      </div>

      {file.portalRunId && (
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Portal Run ID
          </h3>
          <p className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {file.portalRunId}
          </p>
        </div>
      )}

      {file.sourceWorkflowId && (
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Source Workflow
          </h3>
          {workflowRun ? (
            <Link
              to={`/workflows/${workflowRun.id}`}
              className='flex items-center gap-1 text-sm text-blue-600 hover:underline dark:text-blue-400'
            >
              {workflowRun.workflowType}
              <ExternalLink className='h-3 w-3' />
            </Link>
          ) : (
            <span className='text-xs text-neutral-400'>-</span>
          )}
        </div>
      )}

      {file.relatedLibraryId && (
        <div>
          <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
            Related Library
          </h3>
          {library ? (
            <Link
              to={`/lab/${library.id}`}
              className='flex items-center gap-1 font-mono text-sm text-blue-600 hover:underline dark:text-blue-400'
            >
              {library.name}
              <ExternalLink className='h-3 w-3' />
            </Link>
          ) : (
            <span className='text-xs text-neutral-400'>-</span>
          )}
        </div>
      )}

      <div>
        <h3 className='mb-1 text-sm font-medium text-neutral-500 dark:text-neutral-400'>Status</h3>
        <StatusBadge status={statusMap[file.status]} size='sm' />
      </div>

      <div className='space-y-3 border-t border-neutral-200 pt-6 dark:border-neutral-700'>
        <button
          type='button'
          onClick={() => console.log('Download file:', file.id)}
          className='flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
        >
          <Download className='h-4 w-4' />
          Download
        </button>

        {isPreviewable(file.type) && (
          <button
            type='button'
            onClick={() => console.log('Preview file:', file.id)}
            className='flex w-full items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
          >
            <Eye className='h-4 w-4' />
            Preview
          </button>
        )}

        <button
          type='button'
          onClick={() => onCopyPresignUrl(file)}
          className='flex w-full items-center justify-center gap-2 rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
        >
          {copiedPresignId === file.id ? (
            <>
              <Check className='h-4 w-4 text-green-600' />
              Presigned URL Copied!
            </>
          ) : (
            <>
              <LinkIcon className='h-4 w-4' />
              Get Presigned Download Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
