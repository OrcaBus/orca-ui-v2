import { Suspense, useEffect, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import { FileViewer } from './FileViewer';
import {
  IGV_FILETYPE_LIST,
  isFileSizeAcceptable,
  isFileViewable,
  getFilename,
} from '@/utils/files';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import type { S3Record } from '../api/files.api';

export const FilePreviewButton = ({ s3Record }: { s3Record: S3Record }) => {
  const { key: s3Key, bucket, s3ObjectId, size } = s3Record;
  const [isOpen, setIsOpen] = useState(false);

  // IGV only requests byte ranges so size limit does not apply
  const isIGVFile = IGV_FILETYPE_LIST.some((f) => s3Key.endsWith(f));
  const isFileSizeAllowed = isIGVFile || (size != null && isFileSizeAcceptable(size));
  const isFileAllowed = isFileViewable(s3Key);
  const canPreview = isFileAllowed && isFileSizeAllowed;

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const disabledReason = !isFileAllowed
    ? 'File type is not supported'
    : !isFileSizeAllowed
      ? 'File size is too large to preview'
      : null;

  return (
    <>
      {canPreview ? (
        <button
          type='button'
          onClick={() => setIsOpen(true)}
          className='rounded p-1.5 transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
          title='Preview file'
        >
          <Eye className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
        </button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex cursor-not-allowed rounded p-1.5 opacity-40'>
              <EyeOff className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
            </span>
          </TooltipTrigger>
          <TooltipContent side='top' variant='light' size='sm'>
            {disabledReason}
          </TooltipContent>
        </Tooltip>
      )}

      {isOpen && (
        <>
          <div
            className='fixed inset-0 z-40 bg-black/30 dark:bg-black/50'
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          <div className='fixed top-0 right-0 z-50 flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl dark:border-l dark:border-[#2d3540] dark:bg-[#111418]'>
            {/* Header */}
            <div className='flex shrink-0 items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
              <div>
                <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                  {getFilename(s3Key)}
                </h2>
                <p className='mt-1 font-mono text-xs text-neutral-500 dark:text-neutral-400'>
                  {s3ObjectId}
                </p>
              </div>
              <button
                type='button'
                onClick={() => setIsOpen(false)}
                className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-[#1e252e] dark:hover:text-neutral-200'
                aria-label='Close'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            {/* Content */}
            <div className='min-h-0 flex-1 overflow-auto'>
              <DetailedErrorBoundary errorTitle='Unable to open file viewer'>
                <Suspense
                  fallback={
                    <div className='flex h-full items-center justify-center'>
                      <Spinner className='h-8 w-8 text-neutral-400' />
                    </div>
                  }
                >
                  <FileViewer bucket={bucket} s3Key={s3Key} s3ObjectId={s3ObjectId} />
                </Suspense>
              </DetailedErrorBoundary>
            </div>
          </div>
        </>
      )}
    </>
  );
};
