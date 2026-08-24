import { useState } from 'react';
import { constructIgvNameParameter, createIdxFileKey } from './viewers/igv/utils';
import { useFilePresignedURLListModel, useFilePresignedURLModel } from '../api/files.api';
import { Spinner } from '@/components/ui/Spinner';
import { Monitor } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';

type Props = {
  s3ObjectId: string;
  bucket: string;
  s3Key: string;
  className?: string;
  iconOnly?: boolean;
};

const toError = (error: unknown, fallbackMessage: string): Error => {
  return error instanceof Error ? error : new Error(fallbackMessage);
};

export const FileIgvDesktopButton = ({ s3ObjectId, bucket, s3Key, className, iconOnly }: Props) => {
  const [isOpening, setIsOpening] = useState(false);
  const idxKey = createIdxFileKey(s3Key);

  const baseUrlQuery = useFilePresignedURLModel({
    reactQuery: { enabled: false },
    params: { path: { id: s3ObjectId } },
  });
  const idxUrlQuery = useFilePresignedURLListModel({
    reactQuery: { enabled: false },
    params: { query: { bucket, key: idxKey } },
  });

  const handleOpenInDesktop = async () => {
    setIsOpening(true);

    try {
      const [baseFileResult, idxFileResult] = await Promise.all([
        baseUrlQuery.refetch(),
        idxUrlQuery.refetch(),
      ]);

      if (baseFileResult.error) {
        throw toError(baseFileResult.error, 'Unable to create a presigned URL.');
      }
      if (idxFileResult.error) {
        throw toError(idxFileResult.error, 'Unable to load the index presigned URL.');
      }

      const baseFileSignedUrl = baseFileResult.data;
      const idxFileSignedUrl =
        idxFileResult.data?.results.length === 1 ? idxFileResult.data.results[0] : null;

      if (!baseFileSignedUrl) throw new Error('S3 presigned URL is not available.');
      if (!idxFileSignedUrl) throw new Error(`No matching index file found for ${idxKey}.`);

      const igvName = constructIgvNameParameter({ key: s3Key });
      const params = new URLSearchParams({
        index: idxFileSignedUrl,
        file: baseFileSignedUrl,
        name: igvName,
      });
      const response = await fetch(`http://localhost:60151/load?${params.toString()}`, {
        method: 'GET',
      });

      if (!response.ok) throw new Error(`IGV desktop returned HTTP ${response.status}.`);

      toast.success('File successfully loaded to IGV desktop');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to connect to IGV desktop.';
      toast.error(message);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <div className={className}>
      {iconOnly ? (
        <Button
          variant='ghost'
          size='tableIcon'
          type='button'
          onClick={() => void handleOpenInDesktop()}
          disabled={isOpening}
          title='Add track to IGV desktop'
          className='transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-[#2d3540]'
        >
          {isOpening ? (
            <Spinner className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
          ) : (
            <Monitor className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
          )}
        </Button>
      ) : (
        <Button type='button' onClick={() => void handleOpenInDesktop()} disabled={isOpening}>
          {isOpening ? <Spinner className='size-4' /> : <Monitor className='size-4' />}
          Add track to IGV desktop
        </Button>
      )}
    </div>
  );
};
