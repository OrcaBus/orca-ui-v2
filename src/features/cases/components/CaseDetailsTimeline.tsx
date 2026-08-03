import { useMemo, useState } from 'react';
import { Archive, Eye, EyeOff, MessageCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  CommentDialog,
  CustomStateDialog,
  Timeline,
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  TimelineFunctionButton,
  type AddCommentFormData,
  type AddCustomStateFormData,
  type TimelineEvent,
} from '@/components/timeline';
import { TimelineDialogFrame } from '@/components/timeline/TimelineDialogFrame';
import { useAuthContext } from '@/context/auth-context';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { isEmail } from '@/utils/string';
import { formatBackendDate } from '@/utils/timeFormat';
import {
  useCaseAddCommentModel,
  useCaseArchiveCommentModel,
  useCaseArchiveModel,
  useStateCreateModel,
  type CaseCommentModel,
  type CaseStateModel,
  type CaseStatusEnum,
} from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { CASE_STATUS_VISUALS } from '../utils/caseStatus.visuals';
import { getCaseStateTimelineTimestamp } from '../utils/caseStateDate';

type ArchiveTimelineRecordDialogProps = {
  isOpen: boolean;
  title: string;
  recordLabel: string;
  preview?: string | null;
  onClose: () => void;
  onArchive: () => Promise<void>;
};

function formatStateLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function ArchiveTimelineRecordDialog({
  isOpen,
  title,
  recordLabel,
  preview,
  onClose,
  onArchive,
}: ArchiveTimelineRecordDialogProps) {
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await onArchive();
      toast.success(`${recordLabel} archived successfully`);
      onClose();
    } catch (error) {
      toast.error(`Failed to archive ${recordLabel.toLowerCase()}`);
      console.error(`Error archiving ${recordLabel.toLowerCase()}:`, error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <TimelineDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={<Archive className='h-5 w-5' />}
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            disabled={isArchiving}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleArchive()}
            disabled={isArchiving}
            className='rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-red-600 dark:hover:bg-red-700'
          >
            {isArchiving ? 'Archiving...' : 'Archive'}
          </button>
        </>
      }
    >
      <div className='flex items-start gap-3'>
        <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'>
          <Archive className='h-5 w-5' />
        </div>
        <div className='min-w-0'>
          <p className='text-sm text-neutral-800 dark:text-neutral-200'>
            This {recordLabel.toLowerCase()} will be archived and hidden from the active timeline.
          </p>
          {preview && (
            <p className='mt-2 line-clamp-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300'>
              {preview}
            </p>
          )}
        </div>
      </div>
    </TimelineDialogFrame>
  );
}

export function CaseDetailsTimeline() {
  const { user } = useAuthContext();
  const { caseDetail, isLoadingCaseDetail, caseStatesData, isLoadingCaseStates, refresh } =
    useCaseDetailsContext();

  const [isCreateStateDialogOpen, setIsCreateStateDialogOpen] = useState(false);
  const [archivingState, setArchivingState] = useState<CaseStateModel | null>(null);
  const [isCreateCommentDialogOpen, setIsCreateCommentDialogOpen] = useState(false);
  const [archivingComment, setArchivingComment] = useState<CaseCommentModel | null>(null);
  const [showArchivedRecords, setShowArchivedRecords] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const caseOrcabusId = caseDetail?.orcabusId ?? '';
  const currentUserEmail = user?.email ?? '';
  const dialogActorTimestamp = formatBackendDate(new Date());

  const availableStateOptions = useMemo(
    () =>
      Object.entries(CASE_STATUS_VISUALS)
        .map(([status, visual]) => ({
          value: status as CaseStatusEnum,
          label: visual.label || formatStateLabel(status),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    []
  );

  const createCaseState = useStateCreateModel();
  const archiveCaseState = useCaseArchiveModel();
  const createCaseComment = useCaseAddCommentModel();
  const archiveCaseComment = useCaseArchiveCommentModel();

  const caseStates = useMemo(() => caseStatesData?.results ?? [], [caseStatesData]);

  const caseComments = useMemo(() => caseDetail?.commentSet ?? [], [caseDetail]);

  const visibleCaseStates = useMemo(
    () => caseStates.filter((state) => showArchivedRecords || !state.isArchived),
    [caseStates, showArchivedRecords]
  );

  const visibleCaseComments = useMemo(
    () => caseComments.filter((comment) => showArchivedRecords || !comment.isArchived),
    [caseComments, showArchivedRecords]
  );

  const archivedRecordCount = useMemo(
    () =>
      caseStates.filter((state) => state.isArchived).length +
      caseComments.filter((comment) => comment.isArchived).length,
    [caseComments, caseStates]
  );

  const archiveToggleLabel = showArchivedRecords ? 'Hide Archived' : 'Show Archived';
  const archiveToggleIcon = showArchivedRecords ? (
    <EyeOff className='h-4 w-4' />
  ) : (
    <Eye className='h-4 w-4' />
  );

  const caseTimelineStateData = useMemo<TimelineEvent[]>(
    () =>
      visibleCaseStates.map((state) => {
        const createdBy = state.createdBy ?? undefined;
        const archivedBy = state.archivedBy ?? undefined;
        const eventTimestamp = getCaseStateTimelineTimestamp(
          state.eventDate,
          state.eventTime,
          state.createdAt
        );

        return {
          eventId: state.orcabusId,
          title: 'Case State Update',
          eventType: TimelineEventTypes.STATE,
          ...eventTimestamp,
          createdBy,
          isArchived: state.isArchived,
          archivedAt: state.archivedAt,
          archivedBy,
          sourceType: isEmail(createdBy ?? '')
            ? TimelineEventSourceTypes.CUSTOM
            : TimelineEventSourceTypes.SYSTEM,
          state: state.status,
          actions: state.isArchived
            ? undefined
            : [
                {
                  id: 'archive-state',
                  label: 'Archive',
                  icon: <Archive className='h-4 w-4' />,
                  onClick: () => setArchivingState(state),
                },
              ],
        } satisfies TimelineEvent;
      }),
    [visibleCaseStates]
  );

  const caseTimelineCommentData = useMemo<TimelineEvent[]>(
    () =>
      visibleCaseComments.map((comment) => {
        const createdBy = comment.createdBy ?? undefined;
        const isUserComment = isEmail(createdBy ?? '');
        const archivedBy = comment.archivedBy ?? undefined;

        return {
          eventId: comment.orcabusId,
          eventType: TimelineEventTypes.COMMENT,
          timestamp: comment.createdAt,
          createdBy,
          isArchived: comment.isArchived,
          archivedAt: comment.archivedAt,
          archivedBy,
          sourceType: isUserComment
            ? TimelineEventSourceTypes.USER
            : TimelineEventSourceTypes.SYSTEM,
          comment: comment.text ?? '',
          severity: TimelineCommentSeverityEnum.INFO,
          commentType: TimelineCommentTypes.GENERAL,
          actions:
            isUserComment && !comment.isArchived
              ? [
                  {
                    id: 'archive-comment',
                    label: 'Archive',
                    icon: <Archive className='h-4 w-4' />,
                    onClick: () => setArchivingComment(comment),
                  },
                ]
              : undefined,
        } satisfies TimelineEvent;
      }),
    [visibleCaseComments]
  );

  const timelineEvents = useMemo(
    () => [...caseTimelineStateData, ...caseTimelineCommentData],
    [caseTimelineCommentData, caseTimelineStateData]
  );

  const activeSelectedEventId = useMemo(
    () =>
      selectedEventId && timelineEvents.some((event) => event.eventId === selectedEventId)
        ? selectedEventId
        : null,
    [selectedEventId, timelineEvents]
  );

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

  const handleAddComment = async (data: AddCommentFormData) => {
    if (!caseOrcabusId) throw new Error('Case identifier is required');
    if (!currentUserEmail) throw new Error('Authenticated user email is unavailable');

    await createCaseComment.mutateAsync({
      body: {
        text: data.comment,
        case: caseOrcabusId,
      },
    });

    refresh();
  };

  const handleArchiveComment = async () => {
    if (!archivingComment) throw new Error('Case comment is not selected');

    await archiveCaseComment.mutateAsync({
      params: { path: { orcabusId: archivingComment.orcabusId } },
      body: { isArchived: true },
    });

    refresh();
  };

  if (!caseDetail) {
    return null;
  }

  const isInitialTimelineLoad = isLoadingCaseDetail || isLoadingCaseStates;

  return (
    <>
      <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
        {isInitialTimelineLoad ? (
          <div className='min-h-64'>
            <SpinnerWithText text='Loading case timeline...' />
          </div>
        ) : (
          <Timeline
            events={timelineEvents}
            selectedEventId={activeSelectedEventId}
            onEventSelect={(event) => setSelectedEventId(event.eventId)}
            customActions={
              <>
                <TimelineFunctionButton
                  icon={<Plus className='h-4 w-4' />}
                  variant='primary'
                  onClick={() => setIsCreateStateDialogOpen(true)}
                  disabled={!caseOrcabusId || !availableStateOptions.length}
                >
                  Add State
                </TimelineFunctionButton>
                <TimelineFunctionButton
                  icon={<MessageCircle className='h-4 w-4' />}
                  onClick={() => setIsCreateCommentDialogOpen(true)}
                  disabled={!caseOrcabusId || !currentUserEmail}
                >
                  Add Comment
                </TimelineFunctionButton>
                <TimelineFunctionButton
                  icon={archiveToggleIcon}
                  onClick={() => setShowArchivedRecords((currentValue) => !currentValue)}
                  disabled={!archivedRecordCount}
                >
                  {archiveToggleLabel}
                  {archivedRecordCount > 0 ? ` (${archivedRecordCount})` : ''}
                </TimelineFunctionButton>
              </>
            }
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

      <CommentDialog
        isOpen={isCreateCommentDialogOpen}
        onClose={() => setIsCreateCommentDialogOpen(false)}
        onSubmit={handleAddComment}
        hideTimestamp={true}
        hideSeverity={true}
        actorEmail={currentUserEmail}
        actorTimestamp={dialogActorTimestamp}
      />

      <ArchiveTimelineRecordDialog
        isOpen={!!archivingState}
        onClose={() => setArchivingState(null)}
        onArchive={handleArchiveState}
        title='Archive Case State'
        recordLabel='State'
        preview={archivingState ? formatStateLabel(archivingState.status) : undefined}
      />

      <ArchiveTimelineRecordDialog
        isOpen={!!archivingComment}
        onClose={() => setArchivingComment(null)}
        onArchive={handleArchiveComment}
        title='Archive Comment'
        recordLabel='Comment'
        preview={archivingComment?.text}
      />
    </>
  );
}
