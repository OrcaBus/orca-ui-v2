import { useCallback, useMemo } from 'react';
import { mockAnalysisRuns } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
// import { MultiSelect } from '@/components/ui/MultiSelect';
import { StatusCard } from '@/components/ui/StatusCard';
import { getRunsStatusIcon } from '../../shared/utils/statusIcons';
import {
  useAnalysisRunsQueryParams,
  type AnalysisRunStatus,
} from '../hooks/useAnalysisRunsQueryParams';
import { buildAnalysisRunsFilterBadges } from '../utils/buildAnalysisRunsFilterBadges';
import AnalysisRunsTable from '../components/AnalysisRunsTable';

const AR_STATUS_CARDS: Array<{
  label: string;
  status: AnalysisRunStatus;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Succeeded', status: 'succeeded', variant: 'success' },
  { label: 'Failed', status: 'failed', variant: 'error' },
  { label: 'Aborted', status: 'aborted', variant: 'neutral' },
  { label: 'Resolved', status: 'resolved', variant: 'info' },
  { label: 'Deprecated', status: 'deprecated', variant: 'neutral' },
  { label: 'Running', status: 'running', variant: 'warning' },
];

export function AnalysisRunsPage() {
  const {
    search,
    setSearchQuery,
    filterValues,
    setFilterValues,
    status,
    setStatus,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clearAllFilters,
  } = useAnalysisRunsQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildAnalysisRunsFilterBadges({
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  const handleStatusCardClick = useCallback(
    (s: AnalysisRunStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-6 gap-4'>
        {AR_STATUS_CARDS.map((card) => {
          const count = mockAnalysisRuns.filter((ar) => ar.status === card.status).length;
          const percentage =
            mockAnalysisRuns.length > 0 ? Math.round((count / mockAnalysisRuns.length) * 100) : 0;
          return (
            <StatusCard
              key={card.status}
              label={card.label}
              value={count}
              percentage={percentage}
              icon={getRunsStatusIcon(card.status)}
              variant={card.variant}
              selected={status === card.status}
              onClick={() => handleStatusCardClick(card.status)}
            />
          );
        })}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        placeholder='Search by analysis run name, analysis run ID, attributes…'
        filters={
          <>
            <div className='flex items-center gap-2'>
              <label className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'>
                From:
              </label>
              <input
                type='date'
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className='rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label className='text-sm whitespace-nowrap text-neutral-600 dark:text-neutral-400'>
                To:
              </label>
              <input
                type='date'
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className='rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              />
            </div>
            {/* <MultiSelect
              values={typeValues}
              onChange={setTypeValues}
              options={analysisTypeOptions}
              placeholder='All Analysis Types'
              className='min-w-[220px]'
            /> */}
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <AnalysisRunsTable />
    </div>
  );
}
