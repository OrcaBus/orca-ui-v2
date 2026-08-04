import { useCallback, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatTableDate } from '@/utils/timeFormat';
import { useDeployStatusStacks, useDeployStatusStackSummaries } from '../api/deploy-status.api';
import { useDeploymentPulseQueryParams } from '../hooks/useDeploymentPulseQueryParams';
import { mergeDeployStatusStacks, type DeploymentPulseRow } from '../utils/deploy-status.rows';
import { DeploymentStatusBadge } from './DeploymentStatusBadge';
import { StackEventsDrawer } from './StackEventsDrawer';

function formatCommitId(commitId?: string): string {
  const value = commitId?.trim();
  if (!value) return '—';
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

export function DeploymentStacksTable() {
  const {
    page,
    rowsPerPage,
    stackListQueryParams,
    setPage,
    setRowsPerPage,
    selectedStackId,
    openStackDetails,
    closeStackDetails,
  } = useDeploymentPulseQueryParams();

  // Drawer pagination is ephemeral UI state (not in the URL). It is stored alongside the stack it
  // belongs to so that selecting another stack resets the page during render — no effect, so the
  // drawer never requests a stale page. Rows-per-page is a user preference and is kept.
  const [eventPagination, setEventPagination] = useState({
    stackId: selectedStackId,
    page: 1,
    rowsPerPage: DEFAULT_PAGE_SIZE,
  });
  if (eventPagination.stackId !== selectedStackId) {
    setEventPagination((current) => ({ ...current, stackId: selectedStackId, page: 1 }));
  }

  const {
    data: stackData,
    isLoading: isLoadingStacks,
    isError: isStacksError,
    error: stacksError,
    refetch: refetchStacks,
  } = useDeployStatusStacks({
    params: { query: stackListQueryParams },
  });
  const {
    data: summaries,
    isError: isSummariesError,
    refetch: refetchSummaries,
  } = useDeployStatusStackSummaries();

  const rows = useMemo(
    () => mergeDeployStatusStacks(stackData?.results ?? [], summaries ?? []),
    [stackData?.results, summaries]
  );

  const columns = useMemo<Column<DeploymentPulseRow>[]>(
    () => [
      {
        key: 'stackName',
        header: 'Stack Name',
        render: (row) => (
          <button
            type='button'
            onClick={() => openStackDetails(row.stackId)}
            className='text-left text-sm font-semibold text-blue-700 hover:underline focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:text-blue-400 dark:focus:ring-offset-[#111418]'
          >
            {row.stackName}
          </button>
        ),
      },
      {
        key: 'status',
        header: 'Latest Status',
        render: (row) =>
          row.summary ? <DeploymentStatusBadge status={row.summary.status} /> : <span>—</span>,
      },
      {
        key: 'gitCommitId',
        header: 'Version',
        render: (row) => {
          const commitId = row.summary?.gitCommitId;
          return (
            <code
              className='font-mono text-xs text-neutral-700 dark:text-neutral-300'
              title={commitId}
            >
              {formatCommitId(commitId)}
            </code>
          );
        },
      },
      {
        key: 'modificationTimestamp',
        header: 'Last Modified',
        render: (row) => (
          <span className='text-sm whitespace-nowrap text-neutral-700 dark:text-neutral-300'>
            {row.summary?.modificationTimestamp
              ? formatTableDate(row.summary.modificationTimestamp)
              : '—'}
          </span>
        ),
      },
    ],
    [openStackDetails]
  );

  const handleEventPageChange = useCallback(
    (nextPage: number) =>
      setEventPagination((current) => ({ ...current, page: Math.max(1, nextPage) })),
    []
  );
  const handleEventRowsPerPageChange = useCallback(
    (nextRowsPerPage: number) =>
      setEventPagination((current) => ({
        ...current,
        page: 1,
        rowsPerPage: Math.max(1, nextRowsPerPage),
      })),
    []
  );

  if (isStacksError) {
    return (
      <ApiErrorState
        title='Unable to load deployment stacks'
        error={stacksError}
        onRetry={() => void refetchStacks()}
      />
    );
  }

  const refreshAll = async () => {
    await Promise.all([refetchStacks(), refetchSummaries()]);
  };

  return (
    <>
      <div className='space-y-4'>
        {isSummariesError ? (
          <div
            className='flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 sm:flex-row sm:items-center sm:justify-between dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200'
            role='alert'
          >
            <div className='flex items-start gap-3'>
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0' aria-hidden='true' />
              <div>
                <p className='text-sm font-semibold'>Latest deployment details are unavailable</p>
                <p className='mt-0.5 text-xs opacity-80'>
                  Stack names and identifiers are still available from the registry.
                </p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => void refetchSummaries()}
              className='inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white/70 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none dark:border-amber-500/30 dark:bg-amber-950/30 dark:hover:bg-amber-950/50'
            >
              <RefreshCw className='h-3.5 w-3.5' aria-hidden='true' />
              Retry details
            </button>
          </div>
        ) : null}

        <DataTable
          data={rows}
          columns={columns}
          isLoading={isLoadingStacks}
          loadingRows={rowsPerPage > 10 ? 10 : rowsPerPage}
          onRefresh={refreshAll}
          emptyMessage='No deployment stacks found.'
          paginationProps={{
            page: stackData?.pagination.page ?? page,
            pageSize: stackData?.pagination.rowsPerPage ?? rowsPerPage,
            totalItems: stackData?.pagination.count ?? 0,
            onPageChange: setPage,
            onPageSizeChange: setRowsPerPage,
          }}
          persistSettings={{ key: 'tools.deployment-pulse.stacks' }}
        />
      </div>
      <StackEventsDrawer
        stackId={selectedStackId}
        page={eventPagination.page}
        rowsPerPage={eventPagination.rowsPerPage}
        onPageChange={handleEventPageChange}
        onRowsPerPageChange={handleEventRowsPerPageChange}
        onClose={closeStackDetails}
      />
    </>
  );
}
