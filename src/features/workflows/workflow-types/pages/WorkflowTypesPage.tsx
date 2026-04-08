import { FilterBar } from '@/components/tables/FilterBar';
import { StatusCard } from '@/components/ui/StatusCard';
import { getValidationStateIcon } from '../../shared/utils/statusIcons';
import {
  useWorkflowTypesQueryParams,
  type ValidationState,
} from '../hooks/useWorkflowTypesQueryParams';
import WorkflowTypesTable from '../components/WorkflowTypesTable';
import { mockWorkflowTypes } from '@/data/mockData';

const WT_VALIDATION_STATE_CARDS: Array<{
  label: string;
  state: ValidationState;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Validated', state: 'VALIDATED', variant: 'success' },
  { label: 'Unvalidated', state: 'UNVALIDATED', variant: 'warning' },
  { label: 'Deprecated', state: 'DEPRECATED', variant: 'neutral' },
  { label: 'Failed', state: 'FAILED', variant: 'error' },
];

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
      <div className='mb-6 grid grid-cols-4 gap-4'>
        {WT_VALIDATION_STATE_CARDS.map((card) => {
          const count = mockWorkflowTypes.filter(
            (wt) => wt.validationState.toLowerCase() === card.state.toLowerCase()
          ).length;
          const percentage =
            mockWorkflowTypes.length > 0 ? Math.round((count / mockWorkflowTypes.length) * 100) : 0;
          return (
            <StatusCard
              key={card.state}
              label={card.label}
              value={count}
              percentage={percentage}
              icon={getValidationStateIcon(card.state.toLowerCase())}
              variant={card.variant}
              selected={validationState === card.state}
              onClick={() =>
                setValidationState(validationState === card.state ? 'all' : card.state)
              }
            />
          );
        })}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        placeholder='Search by workflow name, ID, version…'
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <WorkflowTypesTable />
    </div>
  );
}
