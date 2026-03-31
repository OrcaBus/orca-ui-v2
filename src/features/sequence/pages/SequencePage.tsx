import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import {
  ExpandableTable,
  ExpandableColumn,
  SubRowColumn,
} from '../../../components/tables/ExpandableTable';
import { mockSequenceRuns } from '../../../data/mockData';
import type { SequenceRun } from '../../../data/mockData';
import {
  ExternalLink,
  FileText,
  CheckCircle,
  XCircle,
  Ban,
  CheckCheck,
  Archive,
  PlayCircle,
} from 'lucide-react';
import { FilterBar, type FilterBadge } from '../../../components/tables/FilterBar';
import { Select } from '../../../components/ui/Select';
import { StatusCard } from '../../../components/ui/StatusCard';
import { formatTableDate } from '../../../utils/timeFormat';
import { useSequenceQueryParams, type InstrumentRunStatus } from '../hooks/useSequenceQueryParams';
import type { InstrumentRun } from '../utils/groupByInstrumentRun';

const filledIconProps = { fill: 'currentColor', stroke: 'white', strokeWidth: 1.5 } as const;

function getSequenceStatusIcon(status: string) {
  switch (status) {
    case 'succeeded':
      return (
        <CheckCircle className='h-5 w-5 text-green-500 dark:text-green-400' {...filledIconProps} />
      );
    case 'failed':
      return <XCircle className='h-5 w-5 text-red-500 dark:text-red-400' {...filledIconProps} />;
    case 'started':
      return (
        <PlayCircle className='h-5 w-5 text-amber-500 dark:text-amber-400' {...filledIconProps} />
      );
    case 'aborted':
      return <Ban className='h-5 w-5 text-neutral-500 dark:text-[#9dabb9]' {...filledIconProps} />;
    case 'resolved':
      return <CheckCheck className='h-5 w-5 text-blue-500 dark:text-[#137fec]' />;
    case 'deprecated':
      return (
        <Archive className='h-5 w-5 text-purple-500 dark:text-purple-400' {...filledIconProps} />
      );
    default:
      return null;
  }
}

const STATUS_ALL = 'all';
const STATUS_OPTIONS: { value: InstrumentRunStatus | typeof STATUS_ALL; label: string }[] = [
  { value: STATUS_ALL, label: 'All statuses' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'started', label: 'Started' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'deprecated', label: 'Deprecated' },
];

function getStatusBadgeStatus(
  status: InstrumentRunStatus
): 'running' | 'completed' | 'failed' | 'pending' {
  switch (status) {
    case 'succeeded':
      return 'completed';
    case 'failed':
    case 'aborted':
      return 'failed';
    case 'started':
      return 'running';
    case 'resolved':
    case 'deprecated':
    default:
      return 'pending';
  }
}

export function SequencePage() {
  const navigate = useNavigate();
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    startTimeFrom,
    setStartTimeFrom,
    startTimeTo,
    setStartTimeTo,
    clearAllFilters,
    allInstrumentRuns,
    filteredInstrumentRuns,
  } = useSequenceQueryParams({ sequenceRuns: mockSequenceRuns });

  const stats = useMemo(
    () => ({
      succeeded: allInstrumentRuns.filter((r) => r.status === 'succeeded').length,
      failed: allInstrumentRuns.filter((r) => r.status === 'failed').length,
      started: allInstrumentRuns.filter((r) => r.status === 'started').length,
      aborted: allInstrumentRuns.filter((r) => r.status === 'aborted').length,
      resolved: allInstrumentRuns.filter((r) => r.status === 'resolved').length,
      deprecated: allInstrumentRuns.filter((r) => r.status === 'deprecated').length,
    }),
    [allInstrumentRuns]
  );

  const totalRuns = allInstrumentRuns.length;

  const statusCards: Array<{
    status: InstrumentRunStatus;
    label: string;
    count: number;
    variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
  }> = [
    { status: 'succeeded', label: 'Succeeded', count: stats.succeeded, variant: 'success' },
    { status: 'failed', label: 'Failed', count: stats.failed, variant: 'error' },
    { status: 'started', label: 'Started', count: stats.started, variant: 'warning' },
    { status: 'aborted', label: 'Aborted', count: stats.aborted, variant: 'neutral' },
    { status: 'resolved', label: 'Resolved', count: stats.resolved, variant: 'info' },
    { status: 'deprecated', label: 'Deprecated', count: stats.deprecated, variant: 'neutral' },
  ];

  const handleStatusCardClick = (status: InstrumentRunStatus) => {
    if (statusFilter === status) {
      setStatusFilter(STATUS_ALL);
    } else {
      setStatusFilter(status);
    }
  };

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];
    if (searchQuery) {
      badges.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: searchQuery,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (statusFilter && statusFilter !== STATUS_ALL) {
      const label = STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? statusFilter;
      badges.push({
        id: 'status',
        type: 'filter',
        label: 'Status',
        value: label,
        onRemove: () => setStatusFilter(STATUS_ALL),
      });
    }
    if (startTimeFrom) {
      badges.push({
        id: 'startTimeFrom',
        type: 'range',
        label: 'From',
        value: startTimeFrom,
        onRemove: () => setStartTimeFrom(''),
      });
    }
    if (startTimeTo) {
      badges.push({
        id: 'startTimeTo',
        type: 'range',
        label: 'To',
        value: startTimeTo,
        onRemove: () => setStartTimeTo(''),
      });
    }
    return badges;
  }, [
    searchQuery,
    statusFilter,
    startTimeFrom,
    startTimeTo,
    setSearchQuery,
    setStatusFilter,
    setStartTimeFrom,
    setStartTimeTo,
  ]);

  const columns: ExpandableColumn<InstrumentRun>[] = [
    {
      key: 'instrumentRunId',
      header: 'Instrument Run ID',
      sortable: true,
      render: (instrumentRun) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/sequence/${instrumentRun.instrumentRunId}`);
          }}
          className='-mx-1 rounded px-1 font-mono text-sm font-medium text-blue-600 transition-colors hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:bg-[#137fec]/10 dark:hover:text-blue-300'
        >
          {instrumentRun.instrumentRunId}
        </button>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (instrumentRun) => (
        <StatusBadge status={getStatusBadgeStatus(instrumentRun.status)} />
      ),
    },
    {
      key: 'startTime',
      header: 'Start Time',
      sortable: true,
      render: (instrumentRun) => (
        <div className='text-sm text-neutral-900 dark:text-slate-200'>
          {formatTableDate(instrumentRun.startTime)}
        </div>
      ),
    },
    {
      key: 'endTime',
      header: 'End Time',
      sortable: true,
      render: (instrumentRun) => (
        <div className='text-sm text-neutral-900 dark:text-slate-200'>
          {instrumentRun.endTime ? formatTableDate(instrumentRun.endTime) : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (instrumentRun) => (
        <div className='flex items-center gap-2'>
          <button
            className='flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-[#137fec] dark:hover:border dark:hover:border-[#137fec]/30 dark:hover:bg-[#137fec]/10 dark:hover:text-blue-300'
            title='MultipleQC Report'
          >
            <FileText className='h-3.5 w-3.5' />
            MultiQC
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              void navigate(`/vault?instrumentRunId=${instrumentRun.instrumentRunId}`);
            }}
            className='flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-[#137fec] dark:hover:border dark:hover:border-[#137fec]/30 dark:hover:bg-[#137fec]/10 dark:hover:text-blue-300'
            title='View in Vault'
          >
            <ExternalLink className='h-3.5 w-3.5' />
            Vault
          </button>
        </div>
      ),
    },
  ];

  const subColumns: SubRowColumn<SequenceRun>[] = [
    {
      key: 'runId',
      header: 'Sequence Run ID',
      width: 'flex-[2]',
      render: (run) => (
        <div>
          <div className='font-mono text-sm text-neutral-900 dark:text-slate-200'>{run.runId}</div>
          <div className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
            Flowcell: {run.flowcellId}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 'w-32',
      render: (run) => <StatusBadge status={run.status} size='sm' />,
    },
    {
      key: 'startDate',
      header: 'Start Time',
      width: 'flex-1',
      render: (run) => (
        <div className='text-sm text-neutral-900 dark:text-slate-200'>
          {formatTableDate(run.startDate)}
        </div>
      ),
    },
    {
      key: 'completedDate',
      header: 'End Time',
      width: 'flex-1',
      render: (run) => (
        <div className='text-sm text-neutral-900 dark:text-slate-200'>
          {run.completedDate ? formatTableDate(run.completedDate) : '-'}
        </div>
      ),
    },
  ];

  return (
    <div className='min-h-screen p-6 text-neutral-900 dark:text-slate-100'>
      <PageHeader
        title='Sequence'
        description='Monitor instrument runs and sequencing run status.'
      />

      <div className='mb-6 grid grid-cols-6 gap-4'>
        {statusCards.map((card) => {
          const percentage = totalRuns > 0 ? Math.round((card.count / totalRuns) * 100) : 0;
          return (
            <StatusCard
              key={card.status}
              label={card.label}
              value={card.count}
              percentage={percentage}
              icon={getSequenceStatusIcon(card.status)}
              variant={card.variant}
              selected={statusFilter === card.status}
              onClick={() => handleStatusCardClick(card.status)}
            />
          );
        })}
      </div>

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder='Search by instrument run ID, sequence run ID, or attributes…'
        searchLabel='Search sequence runs'
        searchId='sequence-search'
        filters={
          <>
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as InstrumentRunStatus | typeof STATUS_ALL)}
              options={STATUS_OPTIONS}
            />
            <div className='flex items-center gap-2'>
              <label
                htmlFor='sequence-start-from'
                className='text-sm whitespace-nowrap text-neutral-600 dark:text-[#9dabb9]'
              >
                Start Time:
              </label>
              <input
                id='sequence-start-from'
                type='date'
                value={startTimeFrom}
                onChange={(e) => setStartTimeFrom(e.target.value)}
                className='rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              />
              <span className='text-neutral-400 dark:text-[#9dabb9]'>—</span>
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

      <ExpandableTable
        data={filteredInstrumentRuns}
        columns={columns}
        subColumns={subColumns}
        keyExtractor={(instrumentRun) => instrumentRun.instrumentRunId}
        subRowsExtractor={(instrumentRun) => instrumentRun.sequenceRuns}
        subKeyExtractor={(run) => run.id}
        defaultPageSize={10}
      />
    </div>
  );
}
