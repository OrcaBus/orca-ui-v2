import { Button } from '@/components/ui/Button';
import { useCallback, useState } from 'react';
import { Check, Link } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { type S3Record, useFilePresignedURLModel } from '../api/files.api';
import { toast } from 'sonner';

export const FileCopyPresignUrlButton = ({ s3Record }: { s3Record: S3Record }) => {
  const { s3ObjectId } = s3Record;
  const [copied, setCopied] = useState(false);

  const {
    data: url,
    isLoading: isLoadingUrl,
    refetch,
  } = useFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'attachment' } },
    reactQuery: { enabled: false },
  });

  const handleCopyPresignUrl = useCallback(async () => {
    const target = url ?? (await refetch()).data;
    if (!target) {
      toast.error('Unable to generate presigned URL');
      return;
    }
    void navigator.clipboard.writeText(target).then(() => {
      toast.success('Presigned URL copied to clipboard');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [url, refetch]);

  return (
    <Button
      variant='ghost'
      type='button'
      disabled={isLoadingUrl}
      onClick={() => void handleCopyPresignUrl()}
      className='rounded p-1.5 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2d3540]'
      title='Copy presigned download link'
    >
      {isLoadingUrl ? (
        <Spinner className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      ) : copied ? (
        <Check className='h-4 w-4 text-green-600' />
      ) : (
        <Link className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
      )}
    </Button>
  );
};
