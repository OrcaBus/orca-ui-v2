import { useMemo } from 'react';
import { Workflow } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../shared/components/RunsInfoDrawer';
import { useWorkflowTypesPageQueryParams } from '../hooks/useWorkflowTypesPageQueryParams';
import WorkflowTypesTable from '../components/WorkflowTypesTable';
import { WorkflowTypesStatusCards } from '../components/WorkflowTypesStatusCards';

export function WorkflowTypesPage() {
  const title = 'Workflow Types';
  const description = 'Browse workflow definitions, versions, engines, and validation states.';
  const {
    search,
    setSearch: setSearchQuery,
    activeFilterBadges,
    validationState,
    setValidationState,
    clearAllFilters,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useWorkflowTypesPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <Workflow className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div>
        <WorkflowTypesStatusCards
          status={validationState}
          onStatusCardClick={(state) =>
            setValidationState(validationState === state ? 'all' : state)
          }
        />

        <FilterBar
          searchValue={search}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search by workflow name, ID, version…'
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
        />

        <WorkflowTypesTable />
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
