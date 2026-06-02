import { FileText } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';

interface FilesInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FilesInfoDrawer({ isOpen, onClose }: FilesInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Files'
      icon={<FileText className='h-5 w-5' />}
      size='md'
    >
      <section>
        <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
          Files provides a storage-focused view across current S3 objects, output artifacts, portal
          run attributes, buckets, key patterns, and availability state.
        </p>
      </section>
    </DrawerFrame>
  );
}
