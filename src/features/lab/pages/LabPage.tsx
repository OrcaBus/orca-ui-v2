import { Suspense, useMemo, useState } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useLabQueryParams } from '../hooks/useLabQueryParams';
import { LibrariesTable, SyncMetadataModal } from '../components';
import { LAB_FILTER_FIELDS } from '../utils/labFilterFields';
import { buildLabActiveFilterBadges } from '../utils/buildLabFilterBadges';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';

export function LabPage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useLabQueryParams();

  const [showSyncModal, setShowSyncModal] = useState(false);

  const activeFilterBadges = useMemo(
    () =>
      buildLabActiveFilterBadges({
        filterFields: LAB_FILTER_FIELDS,
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  const handleOpenSyncModal = () => {
    setShowSyncModal(true);
  };

  return (
    <div className='p-6'>
      <PageHeader
        title='Lab Metadata'
        description='Browse and manage library metadata.'
        icon={<Database className='h-6 w-6' />}
        actions={
          <button
            type='button'
            onClick={handleOpenSyncModal}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            <RefreshCw className='h-4 w-4' />
            Sync Metadata
          </button>
        }
      />

      <AdvancedFilterBar
        searchValue={search}
        onSearchChange={(search) => setSearchQuery(search)}
        searchPlaceholder='Search by Library ID, project...'
        filterFields={LAB_FILTER_FIELDS}
        filterValues={filterValues}
        onFiltersChange={(values) => setFilterValues(values)}
        activeFilterBadges={activeFilterBadges}
        onClearAll={clearAllFilters}
      />

      <DetailedErrorBoundary errorTitle='Unable to load libraries'>
        <Suspense fallback={<SpinnerWithText text='Loading libraries...' />}>
          <LibrariesTable />
        </Suspense>
      </DetailedErrorBoundary>

      <SyncMetadataModal isOpen={showSyncModal} onClose={() => setShowSyncModal(false)} />
    </div>
  );
}
