import { useCallback } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import RunContextsTable from '../components/RunContextsTable';
import { RunContextsStatusCards } from '../components/RunContextsStatusCards';
import {
  useRunContextsListQueryParams,
  type RunContextStatus,
} from '../hooks/useRunContextsListQueryParams';

export function RunContextsPage() {
  const { search, setSearchQuery, status, setStatus, clearAllFilters, activeFilterBadges } =
    useRunContextsListQueryParams();

  const handleStatusCardClick = useCallback(
    (nextStatus: RunContextStatus) => setStatus(status === nextStatus ? 'all' : nextStatus),
    [setStatus, status]
  );

  return (
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
  );
}
