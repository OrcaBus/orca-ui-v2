import { useCallback, useMemo } from 'react';
import { FileBraces } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../components/RunsInfoDrawer';
import AnalysisContextsTable from '../components/AnalysisContextsTable';
import { AnalysisContextsStatusCards } from '../components/AnalysisContextsStatusCards';
import type { AnalysisContextStatus } from '../hooks/useAnalysisContextsListQueryParams';
import { useAnalysisContextsPageQueryParams } from '../hooks/useAnalysisContextsPageQueryParams';

export function AnalysisContextsPage() {
  const title = 'Analysis Contexts';
  const description =
    'Browse reusable analysis contexts, use cases, descriptions, and active states.';
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
  } = useAnalysisContextsPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <FileBraces className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  const handleStatusCardClick = useCallback(
    (nextStatus: AnalysisContextStatus) => setStatus(status === nextStatus ? 'all' : nextStatus),
    [setStatus, status]
  );

  return (
    <>
      <div>
        <AnalysisContextsStatusCards status={status} onStatusCardClick={handleStatusCardClick} />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search by analysis context name, context ID, description...'
          filters={
            <Select
              value={status}
              onChange={(value) => setStatus((value as AnalysisContextStatus | 'all') || 'all')}
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

        <AnalysisContextsTable />
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
