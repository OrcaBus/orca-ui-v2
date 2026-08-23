import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { IGV_FILETYPE_LIST, isFileSizeAcceptable, isFileViewable } from '@/utils/files';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import type { S3Record } from '../api/files.api';
import { FilePreviewDrawer } from './FilePreviewDrawer';

export const FilePreviewButton = ({ s3Record }: { s3Record: S3Record }) => {
  const { key: s3Key, size } = s3Record;
  const [isOpen, setIsOpen] = useState(false);

  // IGV only requests byte ranges so size limit does not apply
  const isIGVFile = IGV_FILETYPE_LIST.some((f) => s3Key.endsWith(f));
  const isFileSizeAllowed = isIGVFile || (size != null && isFileSizeAcceptable(size));
  const isFileAllowed = isFileViewable(s3Key);
  const canPreview = isFileAllowed && isFileSizeAllowed;

  const disabledReason = !isFileAllowed
    ? 'File type is not supported'
    : !isFileSizeAllowed
      ? 'File size is too large to preview'
      : null;

  return (
    <>
      {canPreview ? (
        <Button
          variant='ghost'
          size='tableIcon'
          type='button'
          onClick={() => setIsOpen(true)}
          className='transition-colors hover:bg-neutral-100 dark:hover:bg-[#2d3540]'
          title='Preview file'
        >
          <Eye className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
        </Button>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className='inline-flex size-6 items-center justify-center rounded p-1 opacity-40'>
              <EyeOff className='h-4 w-4 text-neutral-600 dark:text-[#8892a2]' />
            </span>
          </TooltipTrigger>
          <TooltipContent side='top' variant='light' size='sm'>
            {disabledReason}
          </TooltipContent>
        </Tooltip>
      )}

      {canPreview && (
        <FilePreviewDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} s3Record={s3Record} />
      )}
    </>
  );
};
