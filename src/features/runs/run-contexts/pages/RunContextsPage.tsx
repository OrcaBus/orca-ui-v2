import { useCallback, useMemo } from 'react';
import { Braces } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../components/RunsInfoDrawer';
import RunContextsTable from '../components/RunContextsTable';
import { RunContextsStatusCards } from '../components/RunContextsStatusCards';
import type { RunContextStatus } from '../hooks/useRunContextsListQueryParams';
import { useRunContextsPageQueryParams } from '../hooks/useRunContextsPageQueryParams';

export function RunContextsPage() {
  const title = 'Run Contexts';
  const description = 'Browse reusable run contexts, use cases, descriptions, and active states.';
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
  } = useRunContextsPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <Braces className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  const handleStatusCardClick = useCallback(
    (nextStatus: RunContextStatus) => setStatus(status === nextStatus ? 'all' : nextStatus),
    [setStatus, status]
  );

  return (
    <>
      <div>
        <RunContextsStatusCards status={status} onStatusCardClick={handleStatusCardClick} />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search by context name, context ID, description...'
          filters={
            <Select
              value={status}
              onChange={(value) => setStatus((value as RunContextStatus | 'all') || 'all')}
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

        <RunContextsTable />
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
