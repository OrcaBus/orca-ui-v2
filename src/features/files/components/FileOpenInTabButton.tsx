import { useCallback } from 'react';
import { ExternalLink } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { type S3Record, useFilePresignedURLModel } from '../api/files.api';
import { toast } from 'sonner';

export const FileOpenInTabButton = ({ s3Record }: { s3Record: S3Record }) => {
  const { s3ObjectId } = s3Record;

  const {
    data: url,
    isLoading,
    isFetching,
    refetch,
  } = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'inline' } },
    reactQuery: { enabled: false },
  });

  const handleOpenInTab = useCallback(async () => {
    if (url) {
      window.open(url, '_blank');
      return;
    }
    const result = await refetch();
    if (result.data) {
      window.open(result.data, '_blank');
    } else if (result.error) {
      toast.error('Unable to open file in tab', {
        description: result.error instanceof Error ? result.error.message : undefined,
      });
    }
  }, [url, refetch]);

  const isPending = isLoading || isFetching;

  return (
    <button
      type='button'
      disabled={isPending}
      onClick={() => void handleOpenInTab()}
      className='rounded p-1.5 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2d3540]'
      title='Open file in new tab'
    >
      {isPending ? (
        <Spinner className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      ) : (
        <ExternalLink className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      )}
    </button>
  );
};
