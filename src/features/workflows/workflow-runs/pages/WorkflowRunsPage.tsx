import { Suspense, useCallback, useMemo } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { DetailedErrorBoundary } from '@/components/ui/DetailedErrorBoundary';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useWorkflowRunsQueryParams,
  type WorkflowRunStatus,
} from '../hooks/useWorkflowRunsQueryParams';
import WorkflowRunsTable from '../components/WorkflowRunsTable';
import { buildWorkflowRunsFilterBadges } from '../utils/buildWorkflowRunsFilterBadges';
import { WorkflowRunsStatusCards } from '../components/WorkflowRunsStatusCards';

export function WorkflowRunsPage() {
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
  } = useWorkflowRunsQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildWorkflowRunsFilterBadges({
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  const handleStatusCardClick = useCallback(
    (s: WorkflowRunStatus) => setStatus(status === s ? 'all' : s),
    [status, setStatus]
  );

  return (
    <div>
      <WorkflowRunsStatusCards status={status} onStatusCardClick={handleStatusCardClick} />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by workflow run name, portal run ID, execution ID…'
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
              options={workflowTypeOptions.map((type) => ({ value: type, label: type }))}
              placeholder='All Workflow Types'
            /> */}
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />
      <DetailedErrorBoundary errorTitle='Unable to load workflow runs'>
        <Suspense fallback={<SpinnerWithText text='Loading workflow runs...' />}>
          <WorkflowRunsTable />
        </Suspense>
      </DetailedErrorBoundary>
    </div>
  );
}
