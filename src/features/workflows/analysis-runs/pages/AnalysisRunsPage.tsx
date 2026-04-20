import { Suspense, useCallback, useMemo } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
// import { MultiSelect } from '@/components/ui/MultiSelect';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useAnalysisRunsQueryParams,
  type AnalysisRunStatus,
} from '../hooks/useAnalysisRunsQueryParams';
import { buildAnalysisRunsFilterBadges } from '../utils/buildAnalysisRunsFilterBadges';
import AnalysisRunsTable from '../components/AnalysisRunsTable';
import { AnalysisRunsStatusCards } from '../components/AnalysisRunsStatusCards';

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
      <DetailedErrorBoundary errorTitle='Unable to load analysis run status'>
        <Suspense fallback={<SpinnerWithText text='Loading analysis run status...' />}>
          <AnalysisRunsStatusCards status={status} onStatusCardClick={handleStatusCardClick} />
        </Suspense>
      </DetailedErrorBoundary>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by analysis run name, analysis run ID, attributes…'
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

      <DetailedErrorBoundary errorTitle='Unable to load analysis runs'>
        <Suspense fallback={<SpinnerWithText text='Loading analysis runs...' />}>
          <AnalysisRunsTable />
        </Suspense>
      </DetailedErrorBoundary>
    </div>
  );
}
