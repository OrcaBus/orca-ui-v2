import { useCallback } from 'react';
import { mockAnalysisTypes } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { StatusCard } from '@/components/ui/StatusCard';
import { getAnalysisTypeIcon } from '../../shared/utils/statusIcons';
import {
  useAnalysisTypesQueryParams,
  type AnalysisTypeStatus,
} from '../hooks/useAnalysisTypesQueryParams';
import AnalysisTypesTable from '../components/AnalysisTypesTable';

const AT_STATUS_CARDS: Array<{
  label: string;
  status: AnalysisTypeStatus;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Active', status: 'ACTIVE', variant: 'success' },
  { label: 'Inactive', status: 'INACTIVE', variant: 'neutral' },
];

export function AnalysisTypesPage() {
  const { search, setSearchQuery, status, setStatus, clearAllFilters, activeFilterBadges } =
    useAnalysisTypesQueryParams({ analysisTypes: mockAnalysisTypes });

  const handleAtStatusCardClick = useCallback(
    (s: AnalysisTypeStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-4 gap-4'>
        {AT_STATUS_CARDS.map((card) => (
          <StatusCard
            key={card.status}
            label={card.label}
            value={mockAnalysisTypes.filter((at) => at.status === card.status).length}
            percentage={
              mockAnalysisTypes.length > 0
                ? Math.round(
                    (mockAnalysisTypes.filter((at) => at.status === card.status).length /
                      mockAnalysisTypes.length) *
                      100
                  )
                : 0
            }
            icon={getAnalysisTypeIcon(card.status)}
            variant={card.variant}
            selected={status === card.status}
            onClick={() => handleAtStatusCardClick(card.status)}
          />
        ))}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        placeholder='Search by analysis name, analysis ID, version, description…'
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
