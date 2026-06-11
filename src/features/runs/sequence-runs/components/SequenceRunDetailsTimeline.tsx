import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { MessageCircle, Plus, SquarePen, Trash } from 'lucide-react';
import {
  CommentDialog,
  CustomStateDialog,
  DeleteCommentDialog,
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
import { useAuthContext } from '@/context/auth-context';
import { isEmail } from '@/utils/string';
import { formatBackendDate, formatDateTimeLocalInputValue } from '@/utils/timeFormat';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useSequenceRunStateCreateModel,
  useSequenceRunStateUpdateModel,
  useSequenceRunCommentCreateModel,
  useSequenceRunCommentUpdateModel,
  useSequenceRunCommentDeleteModel,
  type SequenceRunStateModel,
  type SequenceRunCommentModel,
} from '../../shared/api/sequence.api';
import { useSequenceRunDetailsContext } from '../context/SequenceRunDetailsContext';

// ---------------------------------------------------------------------------
// Helpers (mirrored from WorkflowRunDetailsTimeline)
// ---------------------------------------------------------------------------

type ValidationRule =
  | string[]
  | {
      allowed_states?: string[];
      allowedStates?: string[];
      excluded_states?: string[];
      excludedStates?: string[];
    }
  | null
  | undefined;

function normalizeStateValue(value?: string | null): string {
  return (value ?? '')
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

function formatStateLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function isStateTransitionAllowed(rule: ValidationRule, currentState?: string | null): boolean {
  if (!currentState) return true;
  const currentStateKey = normalizeStateValue(currentState);

  if (Array.isArray(rule)) {
    return rule.some((s) => normalizeStateValue(s) === currentStateKey);
  }
  if (rule && typeof rule === 'object') {
    const allowedStates = rule.allowed_states ?? rule.allowedStates;
    const excludedStates = rule.excluded_states ?? rule.excludedStates;
    if (Array.isArray(allowedStates)) {
      return allowedStates.some((s) => normalizeStateValue(s) === currentStateKey);
    }
    if (Array.isArray(excludedStates)) {
      return !excludedStates.some((s) => normalizeStateValue(s) === currentStateKey);
    }
  }
  return true;
}

function _isTimelineStateEvent(event: TimelineEvent | null | undefined): event is TimelineEvent {
  return event?.eventType === TimelineEventTypes.STATE;
}

function sortEventsByLatestTimestamp<T extends { timestamp: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const da = dayjs(a.timestamp);
    const db = dayjs(b.timestamp);
    if (da.isSame(db)) return 0;
    return da.isAfter(db) ? -1 : 1;
  });
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SequenceRunDetailsTimeline() {
  const { user } = useAuthContext();
  const {
    sequenceRunData,
    sequenceRunCommentsData,
    sequenceRunStatesData,
    sequenceRunStateValidMapData,
    isLoadingSequenceRunComments,
    isLoadingSequenceRunStates,
    refresh,
  } = useSequenceRunDetailsContext();

  const [isCreateStateDialogOpen, setIsCreateStateDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<SequenceRunStateModel | null>(null);
  const [isCreateCommentDialogOpen, setIsCreateCommentDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<SequenceRunCommentModel | null>(null);
  const [deletingComment, setDeletingComment] = useState<SequenceRunCommentModel | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const currentUserEmail = user?.email ?? '';
  const dialogActorTimestamp = formatBackendDate(new Date());

  // Use the latest sequence run's orcabusId for create mutations
  const latestSequenceRun = useMemo(() => {
    if (!sequenceRunData?.length) return null;
    return [...sequenceRunData].sort((a, b) =>
      dayjs(a.startTime ?? 0).isBefore(dayjs(b.startTime ?? 0)) ? 1 : -1
    )[0];
  }, [sequenceRunData]);

  const sequenceRunOrcabusId = latestSequenceRun?.orcabusId ?? '';

  // Current state for validation (from the latest state entry)
  const currentSequenceState = useMemo(() => {
    if (!sequenceRunStatesData?.length) return null;
    return sortEventsByLatestTimestamp(sequenceRunStatesData)[0]?.status ?? null;
  }, [sequenceRunStatesData]);

  const validationMapEntries = useMemo(
    () => Object.entries((sequenceRunStateValidMapData ?? {}) as Record<string, ValidationRule>),
    [sequenceRunStateValidMapData]
  );

  const editableStateKeys = useMemo(
    () => new Set(validationMapEntries.map(([status]) => normalizeStateValue(status))),
    [validationMapEntries]
  );

  const availableStateOptions = useMemo(
    () =>
      validationMapEntries
        .filter(([, rule]) => isStateTransitionAllowed(rule, currentSequenceState))
        .map(([status]) => ({
          value: status,
          label: formatStateLabel(status),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [currentSequenceState, validationMapEntries]
  );

  const createSequenceRunState = useSequenceRunStateCreateModel();
  const updateSequenceRunState = useSequenceRunStateUpdateModel();
  const createSequenceRunComment = useSequenceRunCommentCreateModel();
  const updateSequenceRunComment = useSequenceRunCommentUpdateModel();
  const deleteSequenceRunComment = useSequenceRunCommentDeleteModel();

  // ---------------------------------------------------------------------------
  // Build timeline events
  // ---------------------------------------------------------------------------

  const sequenceRunTimelineStateData = useMemo<TimelineEvent[]>(
    () =>
      (sequenceRunStatesData ?? []).map((state) => {
        const isEditableState = editableStateKeys.has(normalizeStateValue(state.status));
        return {
          eventId: state.orcabusId,
          eventType: TimelineEventTypes.STATE,
          timestamp: state.timestamp,
          sourceType: isEditableState
            ? TimelineEventSourceTypes.CUSTOM
            : TimelineEventSourceTypes.SYSTEM,
          state: state.status,
          comment: state.comment ?? undefined,
          actions: isEditableState
            ? [
                {
                  id: 'edit-state',
                  label: 'Edit',
                  icon: <SquarePen className='h-4 w-4' />,
                  onClick: () => setEditingState(state),
                },
              ]
            : undefined,
        } satisfies TimelineEvent;
      }),
    [editableStateKeys, sequenceRunStatesData]
  );

  const sequenceRunTimelineCommentData = useMemo<TimelineEvent[]>(
    () =>
      (sequenceRunCommentsData ?? []).map((comment) => {
        const isSampleSheet = comment.targetType === 'sample_sheet';
        const isUserComment = isEmail(comment.createdBy);

        const actions = isSampleSheet
          ? [
              // Only edit allowed for sample_sheet comments
              {
                id: 'edit-comment',
                label: 'Edit',
                icon: <SquarePen className='h-4 w-4' />,
                onClick: () => setEditingComment(comment),
              },
            ]
          : isUserComment
            ? [
                {
                  id: 'edit-comment',
                  label: 'Edit',
                  icon: <SquarePen className='h-4 w-4' />,
                  onClick: () => setEditingComment(comment),
                },
                {
                  id: 'delete-comment',
                  label: 'Delete',
                  icon: <Trash className='h-4 w-4' />,
                  onClick: () => setDeletingComment(comment),
                },
              ]
            : undefined;

        return {
          eventId: comment.orcabusId,
          eventType: TimelineEventTypes.COMMENT,
          timestamp: comment.updatedAt ?? comment.createdAt,
          createdBy: comment.createdBy,
          sourceType: isUserComment
            ? TimelineEventSourceTypes.USER
            : TimelineEventSourceTypes.SYSTEM,
          comment: comment.comment,
          severity: TimelineCommentSeverityEnum.INFO,
          commentType: isSampleSheet
            ? TimelineCommentTypes.SAMPLESHEET
            : TimelineCommentTypes.GENERAL,
          actions,
        } satisfies TimelineEvent;
      }),
    [sequenceRunCommentsData]
  );

  const timelineEvents = useMemo(
    () => [...sequenceRunTimelineStateData, ...sequenceRunTimelineCommentData],
    [sequenceRunTimelineCommentData, sequenceRunTimelineStateData]
  );

  const activeSelectedEventId = useMemo(
    () =>
      selectedEventId && timelineEvents.some((e) => e.eventId === selectedEventId)
        ? selectedEventId
        : null,
    [selectedEventId, timelineEvents]
  );

  // ---------------------------------------------------------------------------
  // Mutation handlers
  // ---------------------------------------------------------------------------

  const handleAddCustomState = async (data: AddCustomStateFormData) => {
    if (!sequenceRunOrcabusId) throw new Error('Sequence run identifier is required');

    await createSequenceRunState.mutateAsync({
      params: { path: { orcabusId: sequenceRunOrcabusId } },
      body: { status: data.stateName, comment: data.comment },
    });

    refresh();
  };

  const handleEditCustomState = async (data: AddCustomStateFormData) => {
    if (!editingState) throw new Error('Sequence run state is not selected');

    await updateSequenceRunState.mutateAsync({
      params: { path: { orcabusId: editingState.sequence, id: editingState.orcabusId } },
      body: { comment: data.comment },
    });

    refresh();
  };

  const handleAddComment = async (data: AddCommentFormData) => {
    if (!sequenceRunOrcabusId) throw new Error('Sequence run identifier is required');
    if (!currentUserEmail) throw new Error('Authenticated user email is unavailable');

    await createSequenceRunComment.mutateAsync({
      params: { path: { orcabusId: sequenceRunOrcabusId } },
      body: { comment: data.comment, createdBy: currentUserEmail },
    });

    refresh();
  };

  const handleEditComment = async (data: AddCommentFormData) => {
    if (!editingComment) throw new Error('Sequence run comment is not selected');

    await updateSequenceRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: editingComment.targetId ?? sequenceRunOrcabusId,
          id: editingComment.orcabusId,
        },
      },
      body: {
        comment: data.comment,
        ...(currentUserEmail ? { createdBy: currentUserEmail } : {}),
      },
    });

    refresh();
  };

  const handleDeleteComment = async () => {
    if (!deletingComment) throw new Error('Sequence run comment is not selected');

    await deleteSequenceRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: deletingComment.targetId ?? sequenceRunOrcabusId,
          id: deletingComment.orcabusId,
        },
      },
    });

    refresh();
  };

  const isInitialTimelineLoad = isLoadingSequenceRunStates || isLoadingSequenceRunComments;

  return (
    <>
      <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
        {isInitialTimelineLoad ? (
          <div className='min-h-64'>
            <SpinnerWithText text='Loading sequence run timeline…' />
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
                  disabled={!availableStateOptions.length}
                >
                  Add State
                </TimelineFunctionButton>
                <TimelineFunctionButton
                  icon={<MessageCircle className='h-4 w-4' />}
                  onClick={() => setIsCreateCommentDialogOpen(true)}
                  disabled={!currentUserEmail}
                >
                  Add Comment
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
        actorEmail={currentUserEmail}
        actorTimestamp={dialogActorTimestamp}
      />

      <CustomStateDialog
        isOpen={!!editingState}
        onClose={() => setEditingState(null)}
        onSubmit={handleEditCustomState}
        availableStates={
          editingState
            ? [{ value: editingState.status, label: formatStateLabel(editingState.status) }]
            : []
        }
        initialValues={
          editingState
            ? {
                stateName: editingState.status,
                timestamp: formatDateTimeLocalInputValue(editingState.timestamp) ?? '',
                comment: editingState.comment ?? '',
              }
            : undefined
        }
        mode='edit'
        title='Edit Sequence Run State'
        submitLabel='Save State'
        hideTimestamp={true}
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

      <CommentDialog
        isOpen={!!editingComment}
        onClose={() => setEditingComment(null)}
        onSubmit={handleEditComment}
        initialValues={
          editingComment
            ? {
                timestamp:
                  formatDateTimeLocalInputValue(
                    editingComment.updatedAt ?? editingComment.createdAt
                  ) ?? '',
                comment: editingComment.comment,
                severity: TimelineCommentSeverityEnum.INFO,
              }
            : undefined
        }
        mode='edit'
        title='Edit Comment'
        submitLabel='Save Comment'
        hideTimestamp={true}
        hideSeverity={true}
        actorEmail={currentUserEmail}
        actorTimestamp={dialogActorTimestamp}
      />

      <DeleteCommentDialog
        isOpen={!!deletingComment}
        onClose={() => setDeletingComment(null)}
        onDelete={handleDeleteComment}
        commentPreview={deletingComment?.comment}
      />
    </>
  );
}
