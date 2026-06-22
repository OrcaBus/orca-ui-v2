import { Warehouse } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';

interface VaultInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VaultInfoDrawer({ isOpen, onClose }: VaultInfoDrawerProps) {
  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Vault'
      icon={<Warehouse className='h-5 w-5' />}
      size='md'
    >
      <section>
        <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
          Vault connects LIMS data, FASTQs, BAMs, workflow outputs, and related identifiers so data
          relationships can be traced across the platform.
        </p>
      </section>
    </DrawerFrame>
  );
}
