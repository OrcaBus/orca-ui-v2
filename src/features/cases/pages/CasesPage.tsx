import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, Plus, FolderSync } from 'lucide-react';
import { FilterBar, type FilterBadge } from '../../../components/tables/FilterBar';
import { Select } from '../../../components/ui/Select';
import { PageHeader } from '../../../components/layout/PageHeader';
import { toast } from 'sonner';
import {
  useCaseCreateModel,
  CASE_LIST_PATH,
  useCaseSyncFromRedcapAutoHistoryModel,
  useCaseSyncFromRedcapAutoModel,
  type CaseTypeEnum,
} from '../api/cases.api';
import { useCasesListQueryParams } from '../hooks/useCasesListQueryParams';
import {
  CasesListTable,
  AddCaseModal,
  AutoImportFromRedcapDialog,
  SyncHistoryDialog,
} from '../components';
import type { AddCaseFormValues } from '../components/AddCaseModal';

const CASE_TYPE_LABELS: Record<CaseTypeEnum, string> = {
  wgts: 'WGTS',
  cttso: 'ctTSO',
  wgs_n: 'WGS-N',
};

const CASE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'wgts', label: 'WGTS' },
  { value: 'cttso', label: 'ctTSO' },
  { value: 'wgs_n', label: 'WGS-N' },
];

export function CasesPage() {
  const {
    search: searchQuery,
    setSearchQuery,
    caseTypeFilter,
    setCaseTypeFilter,
    clearAllFilters,
  } = useCasesListQueryParams();

  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAutoImportModal, setShowAutoImportModal] = useState(false);
  const [showSyncHistoryModal, setShowSyncHistoryModal] = useState(false);

  const queryClient = useQueryClient();
  const { mutateAsync: createCase } = useCaseCreateModel();
  const { mutate: syncFromRedcap, isPending: isSyncing } = useCaseSyncFromRedcapAutoModel();

  const handleCreateCase = async (values: AddCaseFormValues): Promise<void> => {
    await createCase({ body: values });
    await queryClient.invalidateQueries({ queryKey: ['get', CASE_LIST_PATH] });
  };

  const { data: casesSyncHistoryData, isLoading: isSyncHistoryLoading } =
    useCaseSyncFromRedcapAutoHistoryModel();
  const lastSynced = casesSyncHistoryData?.results?.[0]?.importedAt;

  const lastSyncedDescription =
    lastSynced && !isSyncHistoryLoading ? (
      <span>
        Manage lab cases and link libraries, workflow runs, and files. Last synced at{' '}
        <button
          onClick={() => setShowSyncHistoryModal(true)}
          className='font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400'
        >
          {dayjs(lastSynced).format('YYYY-MM-DD HH:mm Z')}
        </button>
      </span>
    ) : (
      'Manage lab cases and link libraries, workflow runs, and files.'
    );

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];
    if (searchQuery) {
      badges.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: searchQuery,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (caseTypeFilter && caseTypeFilter !== 'all') {
      const typeLabels = caseTypeFilter
        .split(',')
        .map((t) => t.trim())
        .map((t) => CASE_TYPE_LABELS[t as CaseTypeEnum] ?? t);
      badges.push({
        id: 'caseType',
        type: 'filter',
        label: 'Type',
        value: typeLabels.join(', '),
        onRemove: () => setCaseTypeFilter('all'),
      });
    }
    return badges;
  }, [searchQuery, caseTypeFilter, setSearchQuery, setCaseTypeFilter]);

  // const handleClearAllFilters = () => {
  //   clearAllFilters();
  //   console.log('clearAllFilters');
  // };

  const handleAutoImport = () => {
    syncFromRedcap(
      {},
      {
        onSuccess: () => {
          setShowAutoImportModal(false);
          toast.success('Cases imported from REDCap');
          void queryClient.invalidateQueries({ queryKey: ['get', CASE_LIST_PATH] });
        },
        onError: () => {
          toast.error('Failed to import cases from REDCap');
        },
      }
    );
  };

  return (
    <div className='min-h-screen bg-white p-6 dark:bg-[#101922]'>
      <PageHeader
        title='Cases'
        description={lastSyncedDescription}
        icon={<Briefcase className='h-6 w-6' />}
        actions={
          <div className='flex items-center gap-2'>
            <button
              className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:hover:bg-[#2d3540]'
              onClick={() => setShowAutoImportModal(true)}
            >
              <FolderSync className='h-4 w-4' />
              Auto Import from REDCap
            </button>
            <button
              className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
              onClick={() => setShowAddCaseModal(true)}
            >
              <Plus className='h-4 w-4' />
              Add New Case
            </button>
          </div>
        }
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by case title, alias, or library ID...'
        searchLabel='Search cases'
        searchId='cases-filter-search'
        filters={
          <>
            <Select
              value={caseTypeFilter}
              onChange={setCaseTypeFilter}
              options={CASE_TYPE_OPTIONS}
            />
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges?.length > 0 ? clearAllFilters : undefined}
      />

      <CasesListTable />

      <AddCaseModal
        key={showAddCaseModal ? 'open' : 'closed'}
        isOpen={showAddCaseModal}
        onClose={() => setShowAddCaseModal(false)}
        onSubmit={handleCreateCase}
      />

      <SyncHistoryDialog
        isOpen={showSyncHistoryModal}
        onClose={() => setShowSyncHistoryModal(false)}
      />

      <AutoImportFromRedcapDialog
        isOpen={showAutoImportModal}
        isLoading={isSyncing}
        onClose={() => setShowAutoImportModal(false)}
        onConfirm={handleAutoImport}
      />
    </div>
  );
}
