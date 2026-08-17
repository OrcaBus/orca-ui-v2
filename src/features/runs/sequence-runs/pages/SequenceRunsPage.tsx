import { useMemo } from 'react';
import { Dna } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Input } from '@/components/ui/Input';
import { useAppShellHeader } from '@/context/app-shell-context';
import { RunsInfoDrawer } from '../../shared/components/RunsInfoDrawer';
import { useSequenceRunsPageQueryParams } from '../hooks/useSequenceRunsPageQueryParams';
import type { InstrumentRunStatus } from '../utils/groupByInstrumentRun';
import { buildSequenceRunsFilterBadges } from '../utils/buildSequenceRunsFilterBadges';
import { SequenceRunsStatusCards } from '../components/SequenceRunsStatusCards';
import SequenceRunsTable from '../components/SequenceRunsTable';

const SEQUENCE_RUN_MANAGER_SCHEMA_SVG_URL =
  'https://raw.githubusercontent.com/OrcaBus/service-sequence-run-manager/refs/heads/main/docs/diagram/sequence-run-manager-entity-diagram.drawio.svg';

export function SequenceRunsPage() {
  const title = 'Sequence Runs';
  const description = 'Monitor instrument runs and sequencing run status.';
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
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useSequenceRunsPageQueryParams();

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title,
      icon: <Dna className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer, title]
  );

  useAppShellHeader(headerConfig);

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
    <>
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
                <Input
                  id='sequence-start-from'
                  type='date'
                  value={startTimeFrom}
                  onChange={(e) => setStartTimeFrom(e.target.value)}
                  className='h-auto w-auto py-1.5 text-sm'
                />
              </div>
              <div className='flex items-center gap-2'>
                <label
                  htmlFor='sequence-start-to'
                  className='text-sm whitespace-nowrap text-neutral-600 dark:text-[#9dabb9]'
                >
                  To:
                </label>
                <Input
                  id='sequence-start-to'
                  type='date'
                  value={startTimeTo}
                  onChange={(e) => setStartTimeTo(e.target.value)}
                  className='h-auto w-auto py-1.5 text-sm'
                />
              </div>
            </>
          }
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
        />

        <SequenceRunsTable />
      </div>

      <RunsInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={closeInfoDrawer}
        title={title}
        description={description}
        modelSchema={{
          url: SEQUENCE_RUN_MANAGER_SCHEMA_SVG_URL,
          title: 'Sequence Run Manager Entity Schema',
          description:
            'Sequence Run Manager model entity diagram from service-sequence-run-manager.',
          previewSummary: 'SVG preview of the current Sequence Run Manager model schema.',
        }}
      />
    </>
  );
}
