import { useState } from 'react';
import { LibraryBig, RefreshCw } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { SyncMetadataModal } from './SyncMetadataModal';

interface LabInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LabInfoDrawer({ isOpen, onClose }: LabInfoDrawerProps) {
  const [showSyncModal, setShowSyncModal] = useState(false);

  return (
    <>
      <DrawerFrame
        isOpen={isOpen}
        onClose={onClose}
        title='Lab Metadata'
        icon={<LibraryBig className='h-5 w-5' />}
        size='md'
      >
        <div className='space-y-6'>
          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
            <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
              Lab metadata brings library, subject, individual, sample, project into a searchable
              operational view.
            </p>
          </section>

          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
            <button
              type='button'
              onClick={() => {
                setShowSyncModal(true);
              }}
              className='mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
            >
              <RefreshCw className='h-4 w-4' />
              Sync Metadata
            </button>
          </section>
        </div>
      </DrawerFrame>

      <SyncMetadataModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />
    </>
  );
}
