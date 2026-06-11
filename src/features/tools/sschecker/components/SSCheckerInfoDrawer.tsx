import { FileCheck } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';

interface SSCheckerInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
}

export function SSCheckerInfoDrawer({
  isOpen,
  onClose,
  title,
  description,
}: SSCheckerInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<FileCheck className='h-5 w-5' />}
      size='md'
    >
      <section>
        <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
          {description}
        </p>
      </section>
    </DrawerFrame>
  );
}
