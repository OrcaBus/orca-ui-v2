import { useMemo } from 'react';
import { FilterBar } from '@/components/tables/FilterBar';
import { useSequenceListQueryParams } from '../hooks/useSequenceListQueryParams';
import type { InstrumentRunStatus } from '../utils/groupByInstrumentRun';
import { buildSequenceRunsFilterBadges } from '../utils/buildSequenceRunsFilterBadges';
import { SequenceRunsStatusCards } from '../components/SequenceRunsStatusCards';
import SequenceRunsTable from '../components/SequenceRunsTable';

export function SequenceRunsPage() {
  const {
    search,
    setSearchQuery,
    status: statusFilter,
    setStatus: setStatusFilter,
    dateFrom: startTimeFrom,
    setDateFrom: setStartTimeFrom,
    dateTo: startTimeTo,
    setDateTo: setStartTimeTo,
    clearAllFilters,
  } = useSequenceListQueryParams();

  const handleStatusCardClick = (clickedStatus: InstrumentRunStatus) => {
    const asSeqStatus = clickedStatus.toUpperCase() as InstrumentRunStatus;
    if (statusFilter === asSeqStatus) {
      setStatusFilter('all');
    } else {
      setStatusFilter(asSeqStatus);
    }
  };

  const activeFilterBadges = useMemo(
    () =>
      buildSequenceRunsFilterBadges({
        search,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        startTimeFrom,
        setStartTimeFrom,
        startTimeTo,
        setStartTimeTo,
      }),
    [
      search,
      setSearchQuery,
      statusFilter,
      setStatusFilter,
      startTimeFrom,
      setStartTimeFrom,
      startTimeTo,
      setStartTimeTo,
    ]
  );

  return (
    <div className='text-neutral-900 dark:text-slate-100'>
      <SequenceRunsStatusCards
        statusFilter={statusFilter}
        onStatusCardClick={handleStatusCardClick}
      />

      <FilterBar
        searchValue={search}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by instrument run ID, sequence run ID, or attributes…'
        searchLabel='Search sequence runs'
        searchId='sequence-search'
        filters={
          <>
            <div className='flex items-center gap-2'>
              <label
                htmlFor='sequence-start-from'
                className='text-sm whitespace-nowrap text-neutral-600 dark:text-[#9dabb9]'
              >
                From:
              </label>
              <input
                id='sequence-start-from'
                type='date'
                value={startTimeFrom}
                onChange={(e) => setStartTimeFrom(e.target.value)}
                className='rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label
                htmlFor='sequence-start-to'
                className='text-sm whitespace-nowrap text-neutral-600 dark:text-[#9dabb9]'
              >
                To:
              </label>
              <input
                id='sequence-start-to'
                type='date'
                value={startTimeTo}
                onChange={(e) => setStartTimeTo(e.target.value)}
                className='rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              />
            </div>
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <SequenceRunsTable />
    </div>
  );
}
