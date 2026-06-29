import { Settings } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';

interface ToolsInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ToolsInfoDrawer({ isOpen, onClose }: ToolsInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Tools'
      icon={<Settings className='h-5 w-5' />}
      size='md'
    >
      <section>
        <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
          Tools contains operational utilities such as sample sheet validation and system catalog
          maps for architecture exploration.
        </p>
      </section>
    </DrawerFrame>
  );
}
