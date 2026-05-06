import { Suspense } from 'react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { Spinner } from '@/components/ui/Spinner';
import { getFilename } from '@/utils/files';
import type { S3Record } from '../api/files.api';
import { FileViewer } from './FileViewer';

interface FilePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  s3Record: S3Record;
}

export function FilePreviewDrawer({ isOpen, onClose, s3Record }: FilePreviewDrawerProps) {
  const { key: s3Key, bucket, s3ObjectId } = s3Record;

  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title={getFilename(s3Key)}
      subtitle={<span className='font-mono text-xs'>{s3ObjectId}</span>}
      size='full'
      bodyClassName='overflow-auto p-0'
      closeLabel='Close file preview'
    >
      <DetailedErrorBoundary errorTitle='Unable to open file viewer'>
        <Suspense
          fallback={
            <div className='flex h-full min-h-64 items-center justify-center'>
              <Spinner className='h-8 w-8 text-neutral-400' />
            </div>
          }
        >
          <FileViewer bucket={bucket} s3Key={s3Key} s3ObjectId={s3ObjectId} />
        </Suspense>
      </DetailedErrorBoundary>
    </DrawerFrame>
  );
}
