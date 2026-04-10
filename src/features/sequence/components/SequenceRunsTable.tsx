import {
  ExpandableColumn,
  ExpandableTable,
  SubRowColumn,
} from '@/components/tables/ExpandableTable';
import {
  useSequenceRunListByInstrumentRunIdModel,
  type SequenceRunListByInstrumentRunIdModel,
  type SequenceRunItemListByInstrumentRunIdModel,
} from '../api/sequence.api';
import { useMemo } from 'react';
import { useNavigate } from 'react-router';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useSequenceQueryParams, SequenceStatus } from '../hooks/useSequenceQueryParams';
import { ExternalLink, FileText } from 'lucide-react';

const SequenceRunsTable = () => {
  const navigate = useNavigate();
  const { sequenceListQueryParams, setPage, setRowsPerPage } = useSequenceQueryParams();

  const {
    data: sequenceRunsData,
    isFetching: isFetchingSequenceRuns,
    isLoading: isLoadingSequenceRuns,
    isError: isSequenceError,
    error: sequenceError,
    refetch: refetchSequenceRuns,
  } = useSequenceRunListByInstrumentRunIdModel({
    params: {
      query: {
        ...sequenceListQueryParams,
        page: sequenceListQueryParams.page || 1,
        rowsPerPage: sequenceListQueryParams.rowsPerPage || DEFAULT_PAGE_SIZE,
      },
    },
  });

  const columns: ExpandableColumn<SequenceRunListByInstrumentRunIdModel>[] = useMemo(
    () => [
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
            {instrumentRun.instrumentRunId ?? '-'}
          </button>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (instrumentRun) => <StatusBadge status={instrumentRun.status as SequenceStatus} />,
      },
      {
        key: 'startTime',
        header: 'Start Time',
        sortable: true,
        render: (instrumentRun) => (
          <div className='text-sm text-neutral-900 dark:text-slate-200'>
            {instrumentRun.startTime ? formatTableDate(instrumentRun.startTime) : '-'}
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
    ],
    [navigate]
  );

  const subColumns: SubRowColumn<SequenceRunItemListByInstrumentRunIdModel>[] = useMemo(
    () => [
      {
        key: 'runId',
        header: 'Sequence Run ID',
        width: 'flex-[1]',
        render: (run) => (
          <div className='font-mono text-xs text-neutral-900 dark:text-slate-200'>
            {run.sequenceRunId}
          </div>
        ),
      },
      {
        key: 'experimentName',
        header: 'Experiment Name',
        width: 'flex-[1.5]',
        render: (run) => (
          <div className='text-xs text-neutral-900 dark:text-slate-200'>
            {run.experimentName ?? '-'}
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
          <div className='text-xs text-neutral-900 dark:text-slate-200'>
            {run.startTime ? formatTableDate(run.startTime) : '-'}
          </div>
        ),
      },
      {
        key: 'endTime',
        header: 'End Time',
        width: 'flex-1',
        render: (run) => (
          <div className='text-xs text-neutral-900 dark:text-slate-200'>
            {run.endTime ? formatTableDate(run.endTime) : '-'}
          </div>
        ),
      },
    ],
    [navigate]
  );

  if (isSequenceError) {
    return <ApiErrorState error={sequenceError} />;
  }

  return (
    <>
      <ExpandableTable
        data={sequenceRunsData?.results || []}
        columns={columns}
        subColumns={subColumns}
        keyExtractor={(sequenceRun) => sequenceRun.instrumentRunId ?? '-'}
        subRowsExtractor={(sequenceRun) => sequenceRun.items ?? []}
        subKeyExtractor={(run) => run.sequenceRunId ?? '-'}
        isLoading={isLoadingSequenceRuns || isFetchingSequenceRuns}
        onRefresh={() => void refetchSequenceRuns()}
        paginationProps={{
          page: sequenceRunsData?.pagination.page || 1,
          pageSize: sequenceRunsData?.pagination.rows_per_page || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: sequenceRunsData?.pagination.count || 0,
        }}
      />
    </>
  );
};

export default SequenceRunsTable;
