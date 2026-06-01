import { useCallback } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import AnalysisContextsTable from '../components/AnalysisContextsTable';
import { AnalysisContextsStatusCards } from '../components/AnalysisContextsStatusCards';
import {
  useAnalysisContextsListQueryParams,
  type AnalysisContextStatus,
} from '../hooks/useAnalysisContextsListQueryParams';

export function AnalysisContextsPage() {
  const { search, setSearchQuery, status, setStatus, clearAllFilters, activeFilterBadges } =
    useAnalysisContextsListQueryParams();

  const handleStatusCardClick = useCallback(
    (nextStatus: AnalysisContextStatus) => setStatus(status === nextStatus ? 'all' : nextStatus),
    [setStatus, status]
  );

  return (
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
  );
}
