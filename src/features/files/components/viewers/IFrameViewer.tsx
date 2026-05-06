import { useSuspenseFilePresignedURLModel } from '../../api/files.api';
import { getMimeType } from '@/utils/files';
import { cn } from '@/utils/cn';
import { FileText, ExternalLink } from 'lucide-react';

type Props = { s3ObjectId: string; s3Key: string };

export const IFrameViewer = ({ s3ObjectId, s3Key }: Props) => {
  const url = useSuspenseFilePresignedURLModel({
    params: {
      path: { id: s3ObjectId },
      query: { responseContentDisposition: 'inline' },
    },
    headers: { 'Content-Type': getMimeType(s3Key) },
  }).data;

  if (!url) throw new Error('Unable to create presigned url');

  const filename = s3Key.split('/').pop() ?? s3Key;

  return (
    <div
      className={cn(
        'h-full w-full',
        'overflow-hidden rounded-lg',
        'border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900',
        'shadow-sm'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'border-b px-4 py-2',
          'border-gray-200 dark:border-gray-700',
          'bg-gray-50 dark:bg-gray-800'
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
            <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
              Document Preview
            </h3>
          </div>
          <a
            href={url}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          >
            <span>{filename}</span>
            <ExternalLink className='h-3 w-3' />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className='relative h-[calc(100%-2.5rem)] w-full'>
        <iframe
          className={cn('absolute inset-0 h-full w-full', 'bg-white dark:bg-gray-900', 'border-0')}
          src={url}
          title={`Preview of ${filename}`}
        />
      </div>
    </div>
  );
};
