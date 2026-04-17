import { FilterBar } from '@/components/tables/FilterBar';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { Suspense } from 'react';
import { useWorkflowTypesQueryParams } from '../hooks/useWorkflowTypesQueryParams';
import WorkflowTypesTable from '../components/WorkflowTypesTable';
import { WorkflowTypesStatusCards } from '../components/WorkflowTypesStatusCards';

export function WorkflowTypesPage() {
  const {
    search,
    setSearch: setSearchQuery,
    activeFilterBadges,
    validationState,
    setValidationState,
    clearAllFilters,
  } = useWorkflowTypesQueryParams();

  return (
    <div>
      <DetailedErrorBoundary errorTitle='Unable to load workflow type status'>
        <Suspense fallback={<SpinnerWithText text='Loading workflow type status...' />}>
          <WorkflowTypesStatusCards
            status={validationState}
            onStatusCardClick={(state) =>
              setValidationState(validationState === state ? 'all' : state)
            }
          />
        </Suspense>
      </DetailedErrorBoundary>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by workflow name, ID, version…'
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <DetailedErrorBoundary errorTitle='Unable to load workflow types'>
        <Suspense fallback={<SpinnerWithText text='Loading workflow types...' />}>
          <WorkflowTypesTable />
        </Suspense>
      </DetailedErrorBoundary>
    </div>
  );
}
