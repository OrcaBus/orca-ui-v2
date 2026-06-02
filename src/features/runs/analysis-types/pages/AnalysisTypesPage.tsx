import { useCallback, useMemo } from 'react';
import { Combine } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../components/RunsInfoDrawer';
import type { AnalysisTypeStatus } from '../hooks/useAnalysisTypesListQueryParams';
import { useAnalysisTypesPageQueryParams } from '../hooks/useAnalysisTypesPageQueryParams';
import AnalysisTypesTable from '../components/AnalysisTypesTable';
import { AnalysisTypesStatusCards } from '../components/AnalysisTypesStatusCards';

export function AnalysisTypesPage() {
  const title = 'Analysis Types';
  const description = 'Browse analysis definitions, versions, descriptions, and active states.';
  const {
    search,
    setSearchQuery,
    status,
    setStatus,
    clearAllFilters,
    activeFilterBadges,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useAnalysisTypesPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <Combine className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  const handleAtStatusCardClick = useCallback(
    (s: AnalysisTypeStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <>
      <div>
        <AnalysisTypesStatusCards status={status} onStatusCardClick={handleAtStatusCardClick} />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search by analysis name, analysis ID, version, description…'
          filters={
            <Select
              value={status}
              onChange={(value) => setStatus((value as AnalysisTypeStatus | 'all') || 'all')}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
              ]}
            />
          }
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
        />

        <AnalysisTypesTable />
      </div>

      <RunsInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        title={title}
        description={description}
      />
    </>
  );
}
