import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { useAppShellHeader } from '@/context/app-shell-context';
import { DeployStatusInfoDrawer } from '../components/DeployStatusInfoDrawer';
import { DeploymentStacksTable } from '../components/DeploymentStacksTable';
import { useDeploymentPulseQueryParams } from '../hooks/useDeploymentPulseQueryParams';

export function DeploymentPulsePage() {
  const {
    search,
    setSearch,
    activeFilterBadges,
    clearAllFilters,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useDeploymentPulseQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Deployment Pulse',
      icon: <Activity className='h-6 w-6' aria-hidden='true' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='px-6 py-5'>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder='Search by stack name…'
          searchId='deployment-pulse-search'
          searchLabel='Search deployment stacks'
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
        />

        <DeploymentStacksTable />
      </div>

      <DeployStatusInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
