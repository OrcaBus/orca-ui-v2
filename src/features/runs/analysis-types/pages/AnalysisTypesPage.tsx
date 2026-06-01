import { useCallback } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import {
  useAnalysisTypesListQueryParams,
  type AnalysisTypeStatus,
} from '../hooks/useAnalysisTypesListQueryParams';
import AnalysisTypesTable from '../components/AnalysisTypesTable';
import { AnalysisTypesStatusCards } from '../components/AnalysisTypesStatusCards';

export function AnalysisTypesPage() {
  const { search, setSearchQuery, status, setStatus, clearAllFilters, activeFilterBadges } =
    useAnalysisTypesListQueryParams();

  const handleAtStatusCardClick = useCallback(
    (s: AnalysisTypeStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
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
  );
}
