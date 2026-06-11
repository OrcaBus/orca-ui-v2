import { useState } from 'react';
import dayjs from 'dayjs';
import { Briefcase, FolderSync, Plus } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
import { InfoDrawerActionCard } from '@/components/modals/InfoDrawerActionCard';
import { useCaseSyncFromRedcapAutoHistoryModel } from '../api/cases.api';
import { AddCaseModal } from './AddCaseModal';
import { AutoImportFromRedcapModal } from './AutoImportFromRedcapModal';
import { SyncHistoryDialog } from './SyncHistoryDialog';

interface CasesInfoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CasesInfoDrawer({ isOpen, onClose }: CasesInfoDrawerProps) {
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const [showSyncHistoryModal, setShowSyncHistoryModal] = useState(false);

  const {
    data: syncHistoryData,
    isLoading: isSyncHistoryLoading,
    isError: isSyncHistoryError,
  } = useCaseSyncFromRedcapAutoHistoryModel({
    params: { query: { page: 1, rowsPerPage: 1 } },
    reactQuery: { enabled: isOpen },
  });
  const lastSynced = syncHistoryData?.results?.[0]?.importedAt;
  const lastSyncedLabel =
    lastSynced && !isSyncHistoryLoading && !isSyncHistoryError
      ? dayjs(lastSynced).format('YYYY-MM-DD HH:mm Z')
      : undefined;

  return (
    <DrawerFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Cases'
      icon={<Briefcase className='h-5 w-5' />}
      size='md'
    >
      <div className='space-y-6'>
        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Description</h3>
          <p className='mt-2 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            Cases collect linked libraries, workflow activity, users, and timeline history into one
            clinical or research work area.
          </p>
          {lastSyncedLabel && (
            <p className='mt-3 text-sm text-slate-600 dark:text-[#9dabb9]'>
              Last synced at{' '}
              <button
                type='button'
                onClick={() => setShowSyncHistoryModal(true)}
                className='font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400'
              >
                {lastSyncedLabel}
              </button>
            </p>
          )}
        </section>

        <section>
          <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>Actions</h3>
          <div className='mt-3 space-y-3'>
            <InfoDrawerActionCard
              title='Import from REDCap'
              description='Pull case records from REDCap and review the import flow before adding them to the portal.'
              buttonLabel='Auto Import from REDCap'
              onClick={() => setShowAutoImportModal(true)}
              icon={<FolderSync className='h-4 w-4' />}
              buttonIcon={<FolderSync className='h-4 w-4' />}
              variant='secondary'
            />
            <InfoDrawerActionCard
              title='Create a case'
              description='Create a single case record manually when it is not available through the REDCap import flow.'
              buttonLabel='Add New Case'
              onClick={() => setShowAddCaseModal(true)}
              icon={<Briefcase className='h-4 w-4' />}
              buttonIcon={<Plus className='h-4 w-4' />}
            />
          </div>
        </section>
      </div>

      <AddCaseModal isOpen={showAddCaseModal} onClose={() => setShowAddCaseModal(false)} />

      <SyncHistoryDialog
        isOpen={showSyncHistoryModal}
        onClose={() => setShowSyncHistoryModal(false)}
      />

      <AutoImportFromRedcapModal
        isOpen={showAutoImportModal}
        onClose={() => setShowAutoImportModal(false)}
      />
    </DrawerFrame>
  );
}
