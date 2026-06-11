import { useState } from 'react';
import { LibraryBig, RefreshCw } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';
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
              Lab metadata brings library identifiers, projects, assays, phenotypes, quality fields,
              and workflow linkage into a searchable operational view.
            </p>
          </section>

          <section>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
            <div className='mt-3'>
              <InfoDrawerActionCard
                title='Sync metadata'
                description='Refresh lab metadata from upstream sources so library fields, phenotypes, and workflow links stay current.'
                buttonLabel='Sync Metadata'
                onClick={() => {
                  setShowSyncModal(true);
                }}
                icon={<LibraryBig className='h-4 w-4' />}
                buttonIcon={<RefreshCw className='h-4 w-4' />}
              />
            </div>
          </section>
        </div>
      </DrawerFrame>

      <SyncMetadataModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />
    </>
  );
}
