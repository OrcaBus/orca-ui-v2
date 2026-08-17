import { useState } from 'react';
import { Database, LibraryBig, RefreshCw } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';
import { ModelViewDialog } from '@/components/modals/ModelViewDialog';
import { SyncMetadataModal } from './SyncMetadataModal';

interface LabInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const METADATA_MANAGER_SCHEMA_SVG_URL =
  'https://github.com/OrcaBus/service-metadata-manager/raw/refs/heads/main/metadata-manager/docs/schema.drawio.svg';

export function LabInfoDrawer({ isOpen, onClose }: LabInfoDrawerProps) {
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showModelViewModal, setShowModelViewModal] = useState(false);

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
            <div className='mt-3 space-y-3'>
              <InfoDrawerActionCard
                title='Sync metadata'
                description='Refresh lab metadata from upstream sources so library fields, phenotypes, and workflow links stay current.'
                buttonLabel='Sync Metadata'
                onClick={() => {
                  setShowSyncModal(true);
                }}
                icon={<LibraryBig className='h-4 w-4' />}
                buttonIcon={<RefreshCw className='h-4 w-4' />}
                variant='secondary'
              />

              <InfoDrawerActionCard
                title='Lab Model View'
                description='Preview the Metadata Manager backend entity relationship diagram for lab metadata.'
                buttonLabel='Lab Model View'
                onClick={() => setShowModelViewModal(true)}
                icon={<Database className='h-4 w-4' />}
                buttonIcon={<Database className='h-4 w-4' />}
                variant='secondary'
              />
            </div>
          </section>
        </div>
      </DrawerFrame>

      <SyncMetadataModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />

      <ModelViewDialog
        isOpen={showModelViewModal}
        onClose={() => setShowModelViewModal(false)}
        schemaUrl={METADATA_MANAGER_SCHEMA_SVG_URL}
        title='Metadata Manager Entity Schema'
        description='Metadata Manager model entity diagram from service-metadata-manager.'
        icon={<Database className='h-5 w-5' />}
        previewSummary='SVG preview of the current Metadata Manager model schema.'
        backgroundNotice='This source is theme-aware, so dark mode can render a dark canvas background.'
      />
    </>
  );
}
