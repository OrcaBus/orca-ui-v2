import { useMemo, useState } from 'react';
import { Archive, Eye, EyeOff, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { CustomStateDialog, type AddCustomStateFormData } from '@/components/timeline';
import { useAuthContext } from '@/context/auth-context';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatBackendDate, formatTableDate } from '@/utils/timeFormat';
import {
  useCaseArchiveModel,
  useStateCreateModel,
  type CaseStateModel,
  type CaseStatusEnum,
} from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { CASE_STATUS_LABELS } from '../utils/caseStatus.visuals';
import { getCaseStateTimelineTimestamp } from '../utils/caseStateDate';

type ArchiveStateDialogProps = {
  state: CaseStateModel | null;
  onClose: () => void;
  onArchive: () => Promise<void>;
};

function ArchiveStateDialog({ state, onClose, onArchive }: ArchiveStateDialogProps) {
  const [isArchiving, setIsArchiving] = useState(false);

  if (!state) return null;

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onArchive();
      toast.success('State archived successfully');
      onClose();
    } catch (error) {
      toast.error('Failed to archive state');
      console.error('Error archiving state:', error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
      role='dialog'
      aria-modal='true'
    >
      <div className='w-full max-w-md rounded-lg border border-neutral-200 bg-white p-6 shadow-lg dark:border-neutral-800 dark:bg-neutral-900'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'>
            <Archive className='h-5 w-5' />
          </div>
          <div className='min-w-0'>
            <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
              Archive Case State
            </h3>
            <p className='mt-1 text-sm text-neutral-700 dark:text-neutral-300'>
              This state ({CASE_STATUS_LABELS[state.status]}) will be archived and hidden from the
              states table.
            </p>
          </div>
        </div>
        <div className='mt-6 flex justify-end gap-2'>
          <Button type='button' variant='outline' onClick={onClose} disabled={isArchiving}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={() => void handleArchive()}
            disabled={isArchiving}
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CaseDetailsStatesTable() {
  const { caseDetail, isLoadingCaseDetail, caseStatesData, isLoadingCaseStates, refresh } =
    useCaseDetailsContext();
  const { user } = useAuthContext();

  const [isCreateStateDialogOpen, setIsCreateStateDialogOpen] = useState(false);
  const [archivingState, setArchivingState] = useState<CaseStateModel | null>(null);
  const [showArchivedStates, setShowArchivedStates] = useState(false);

  const caseOrcabusId = caseDetail?.orcabusId ?? '';
  const currentUserEmail = user?.email ?? '';
  const dialogActorTimestamp = formatBackendDate(new Date());

  const availableStateOptions = useMemo(
    () =>
      Object.entries(CASE_STATUS_LABELS)
        .map(([status, label]) => ({
          value: status as CaseStatusEnum,
          label,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const createCaseState = useStateCreateModel();
  const archiveCaseState = useCaseArchiveModel();

  const caseStates = useMemo(() => caseStatesData?.results ?? [], [caseStatesData]);

  const visibleCaseStates = useMemo(
    () => caseStates.filter((state) => showArchivedStates || !state.isArchived),
    [caseStates, showArchivedStates]
  );

  const archivedStateCount = useMemo(
    () => caseStates.filter((state) => state.isArchived).length,
    [caseStates]
  );

  const archiveToggleLabel = showArchivedStates ? 'Hide Archived' : 'Show Archived';
  const archiveToggleIcon = showArchivedStates ? (
    <EyeOff className='h-4 w-4' />
  ) : (
    <Eye className='h-4 w-4' />
  );

  const pagination = useTablePagination(1, DEFAULT_PAGE_SIZE, visibleCaseStates.length);

  const handleAddCustomState = async (data: AddCustomStateFormData) => {
    if (!caseOrcabusId) throw new Error('Case identifier is required');

    await createCaseState.mutateAsync({
      body: {
        status: data.stateName as CaseStatusEnum,
        case: caseOrcabusId,
      },
    });

    refresh();
  };

  const handleArchiveState = async () => {
    if (!archivingState) throw new Error('Case state is not selected');

    await archiveCaseState.mutateAsync({
      params: { path: { orcabusId: archivingState.orcabusId } },
    });

    refresh();
  };

  const columns: Column<CaseStateModel>[] = useMemo(
    () => [
      {
        key: 'status',
        header: 'Status',
        render: (state) => <StatusBadge status={state.status} />,
      },
      {
        key: 'eventTimestamp',
        header: 'Event Date',
        render: (state) => {
          const { timestamp, timestampPrecision } = getCaseStateTimelineTimestamp(
            state.eventDate,
            state.eventTime,
            state.createdAt
          );
          return (
            <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
              {timestampPrecision === 'date' ? timestamp : formatTableDate(timestamp)}
            </span>
          );
        },
      },
      {
        key: 'createdBy',
        header: 'Created By',
        render: (state) => (
          <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {state.createdBy ?? <span className='text-neutral-400'>System</span>}
          </span>
        ),
      },
      {
        key: 'createdAt',
        header: 'Created At',
        render: (state) => (
          <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {formatTableDate(state.createdAt)}
          </span>
        ),
      },
      {
        key: 'isArchived',
        header: 'Archived',
        render: (state) =>
          state.isArchived ? (
            <span className='inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'>
              Archived
              {state.archivedBy ? ` by ${state.archivedBy}` : ''}
            </span>
          ) : (
            <span className='text-sm text-neutral-400'>—</span>
          ),
      },
      {
        key: 'archivedAt',
        header: 'Archived At',
        render: (state) => (
          <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {state.archivedAt ? formatTableDate(state.archivedAt) : '—'}
          </span>
        ),
      },
      {
        key: 'orcabusId',
        header: 'Orcabus ID',
        copyable: true,
        render: (state) => (
          <div
            className='max-w-xs truncate font-mono text-sm text-neutral-500 dark:text-neutral-400'
            title={state.orcabusId}
          >
            {state.orcabusId}
          </div>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (state) =>
          !state.isArchived && (
            <Button
              variant='ghost'
              size='inline'
              type='button'
              onClick={() => setArchivingState(state)}
              title='Archive state'
              className='rounded p-1.5 text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
            >
              <Archive className='h-4 w-4' />
            </Button>
          ),
      },
    ],
    []
  );

  if (!caseDetail) {
    return null;
  }

  const isInitialLoad = isLoadingCaseDetail || isLoadingCaseStates;

  return (
    <>
      <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
        <div className='mb-4 flex items-center justify-between gap-2'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Case States
          </h3>
          <div className='flex items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setShowArchivedStates((currentValue) => !currentValue)}
              disabled={!archivedStateCount}
            >
              {archiveToggleIcon}
              <span className='ml-1.5'>
                {archiveToggleLabel}
                {archivedStateCount > 0 ? ` (${archivedStateCount})` : ''}
              </span>
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={() => setIsCreateStateDialogOpen(true)}
              disabled={!caseOrcabusId || !availableStateOptions.length}
            >
              <Plus className='h-4 w-4' />
              <span className='ml-1.5'>Add State</span>
            </Button>
          </div>
        </div>

        {isInitialLoad ? (
          <div className='min-h-64'>
            <SpinnerWithText text='Loading case states...' />
          </div>
        ) : visibleCaseStates.length === 0 ? (
          <EmptyState
            icon={Plus}
            title='No states recorded'
            description='Add a state to start tracking this case lifecycle.'
          />
        ) : (
          <DataTable
            data={visibleCaseStates}
            columns={columns}
            emptyMessage='No states found.'
            paginationProps={visibleCaseStates.length > DEFAULT_PAGE_SIZE ? pagination : undefined}
          />
        )}
      </div>

      <CustomStateDialog
        isOpen={isCreateStateDialogOpen}
        onClose={() => setIsCreateStateDialogOpen(false)}
        onSubmit={handleAddCustomState}
        availableStates={availableStateOptions}
        hideTimestamp={true}
        hideComment={true}
        actorEmail={currentUserEmail}
        actorTimestamp={dialogActorTimestamp}
      />

      <ArchiveStateDialog
        state={archivingState}
        onClose={() => setArchivingState(null)}
        onArchive={handleArchiveState}
      />
    </>
  );
}
