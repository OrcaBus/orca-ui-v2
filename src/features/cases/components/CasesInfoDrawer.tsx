import { useState } from 'react';
import dayjs from 'dayjs';
import { Briefcase, FolderSync, Plus } from 'lucide-react';
import { DrawerFrame } from '@/components/modals/DrawerFrame';
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
          <div className='mt-3 space-y-2'>
            <button
              type='button'
              onClick={() => setShowAutoImportModal(true)}
              className='flex w-full items-center justify-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:hover:bg-[#2d3540]'
            >
              <FolderSync className='h-4 w-4' />
              Auto Import from REDCap
            </button>
            <button
              type='button'
              onClick={() => setShowAddCaseModal(true)}
              className='flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
            >
              <Plus className='h-4 w-4' />
              Add New Case
            </button>
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
