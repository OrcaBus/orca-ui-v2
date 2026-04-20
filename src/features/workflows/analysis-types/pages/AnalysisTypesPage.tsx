import { Suspense, useCallback } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useAnalysisTypesQueryParams,
  type AnalysisTypeStatus,
} from '../hooks/useAnalysisTypesQueryParams';
import AnalysisTypesTable from '../components/AnalysisTypesTable';
import { AnalysisTypesStatusCards } from '../components/AnalysisTypesStatusCards';

export function AnalysisTypesPage() {
  const { search, setSearchQuery, status, setStatus, clearAllFilters, activeFilterBadges } =
    useAnalysisTypesQueryParams();

  const handleAtStatusCardClick = useCallback(
    (s: AnalysisTypeStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <div>
      <DetailedErrorBoundary errorTitle='Unable to load analysis type status'>
        <Suspense fallback={<SpinnerWithText text='Loading analysis type status...' />}>
          <AnalysisTypesStatusCards status={status} onStatusCardClick={handleAtStatusCardClick} />
        </Suspense>
      </DetailedErrorBoundary>

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

      <DetailedErrorBoundary errorTitle='Unable to load analysis types'>
        <Suspense fallback={<SpinnerWithText text='Loading analysis types...' />}>
          <AnalysisTypesTable />
        </Suspense>
      </DetailedErrorBoundary>
    </div>
  );
}
