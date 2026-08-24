import { Button } from '@/components/ui/Button';
import { useCallback } from 'react';
import { Download } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { type S3Record, useFilePresignedURLModel } from '../api/files.api';
import { toast } from 'sonner';

export const FileDownloadButton = ({ s3Record }: { s3Record: S3Record }) => {
  const { s3ObjectId } = s3Record;

  const {
    data: url,
    isLoading,
    refetch,
  } = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'attachment' } },
    reactQuery: { enabled: false },
  });

  const handleDownload = useCallback(async () => {
    if (url) {
      window.open(url, '_blank');
      return;
    }
    const result = await refetch();
    if (result.data) {
      window.open(result.data, '_blank');
    } else if (result.error) {
      toast.error('Unable to generate download link', {
        description: result.error instanceof Error ? result.error.message : undefined,
      });
    }
  }, [url, refetch]);

  return (
    <Button
      variant='ghost'
      size='tableIcon'
      type='button'
      disabled={isLoading}
      onClick={() => void handleDownload()}
      className='transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2d3540]'
      title='Download file'
    >
      {isLoading ? (
        <Spinner className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      ) : (
        <Download className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      )}
    </Button>
  );
};
