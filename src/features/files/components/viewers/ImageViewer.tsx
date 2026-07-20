import { useSuspenseFilePresignedURLModel } from '../../api/files.api';
import { getMimeType } from '@/utils/files';
import { cn } from '@/utils/cn';
import { Image, ExternalLink } from 'lucide-react';
import { ImageWithFallback } from '@/components/ui/ImageWithFallback';

type Props = { s3ObjectId: string; s3Key: string };

export const ImageViewer = ({ s3ObjectId, s3Key }: Props) => {
  const url = useSuspenseFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'inline' } },
    headers: { 'Content-Type': getMimeType(s3Key) },
  }).data;

  if (!url) throw new Error('Unable to create presigned url');

  const filename = s3Key.split('/').pop() ?? s3Key;

  return (
    <div
      className={cn('flex h-full w-full flex-col', 'overflow-hidden', 'bg-white dark:bg-gray-900')}
    >
      {/* Header */}
      <div
        className={cn(
          'shrink-0 border-b px-4 py-2',
          'border-gray-200 dark:border-gray-700',
          'bg-gray-50 dark:bg-gray-800'
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Image className='h-4 w-4 text-gray-500 dark:text-gray-400' />
            <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>Image Preview</h3>
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
      <div
        className={cn(
          'flex min-h-0 flex-1 items-center justify-center',
          'p-4',
          'bg-gray-50 dark:bg-gray-800/50',
          'overflow-hidden'
        )}
      >
        <a
          href={url}
          target='_blank'
          rel='noopener noreferrer'
          className='flex h-full w-full items-center justify-center'
        >
          <ImageWithFallback
            className={cn(
              'max-h-full max-w-full',
              'object-contain',
              'rounded shadow-sm',
              'bg-white dark:bg-gray-900',
              'transition-transform duration-200 hover:scale-[1.02]',
              'cursor-pointer'
            )}
            src={url}
            alt={filename}
          />
        </a>
      </div>
    </div>
  );
};
