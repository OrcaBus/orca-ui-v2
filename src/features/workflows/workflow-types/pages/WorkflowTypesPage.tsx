import { FilterBar } from '@/components/tables/FilterBar';
import { useWorkflowTypesListQueryParams } from '../hooks/useWorkflowTypesListQueryParams';
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
  } = useWorkflowTypesListQueryParams();

  return (
    <div>
      <WorkflowTypesStatusCards
        status={validationState}
        onStatusCardClick={(state) => setValidationState(validationState === state ? 'all' : state)}
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
  );
}
