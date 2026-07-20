import { useSuspenseQuery } from '@tanstack/react-query';
import { useSuspenseFilePresignedURLModel } from '../../api/files.api';
import { getMimeType, getPresignedUrlData } from '@/utils/files';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { FileText, ExternalLink, AlertTriangle, Copy, Check } from 'lucide-react';

const MAX_PREVIEW_LINES = 1000;

type Props = { s3ObjectId: string; s3Key: string };

export const TextViewer = ({ s3ObjectId, s3Key }: Props) => {
  const url = useSuspenseFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'inline' } },
    headers: { 'Content-Type': getMimeType(s3Key) },
  }).data;
  if (!url) throw new Error('Unable to create presigned url');

  const rawData = useSuspenseQuery({
    queryKey: ['presignedUrlData', url],
    queryFn: () => getPresignedUrlData(url),
  }).data;
  if (!rawData) throw new Error('Unable to load data');

  const [copied, setCopied] = useState(false);

  const allLines = rawData.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const isTruncated = allLines.length > MAX_PREVIEW_LINES;
  const viewableLines = allLines.slice(0, MAX_PREVIEW_LINES);
  const filename = s3Key.split('/').pop() ?? s3Key;

  const handleCopy = () => {
    void navigator.clipboard.writeText(viewableLines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={cn('h-full w-full', 'overflow-hidden', 'bg-white dark:bg-gray-900')}>
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
            <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>Text Preview</h3>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleCopy}
              className='flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            >
              {copied ? (
                <>
                  <Check className='h-3 w-3' />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className='h-3 w-3' />
                  <span>Copy</span>
                </>
              )}
            </button>
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
      </div>

      {/* Content */}
      <div className='h-[calc(100%-2.5rem)] overflow-auto'>
        {isTruncated && (
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'border-b border-amber-200 dark:border-amber-700',
              'bg-amber-50 dark:bg-amber-900/30',
              'text-amber-800 dark:text-amber-200'
            )}
          >
            <AlertTriangle className='h-4 w-4 shrink-0' />
            <p className='text-xs font-medium'>
              Showing first {MAX_PREVIEW_LINES.toLocaleString()} lines only. Download the file to
              view all content.
            </p>
          </div>
        )}
        <pre
          className={cn(
            'm-0 p-4',
            'font-mono text-xs leading-relaxed',
            'text-gray-800 dark:text-gray-200',
            'bg-white dark:bg-gray-900'
          )}
        >
          {viewableLines.join('\n')}
        </pre>
      </div>
    </div>
  );
};
