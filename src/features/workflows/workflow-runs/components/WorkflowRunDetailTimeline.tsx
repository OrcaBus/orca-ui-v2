import { useMemo, useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { FileBracesCorner, MessageCircle, Plus, SquarePen, Trash } from 'lucide-react';
import {
  CommentDialog,
  CustomStateDialog,
  DeleteCommentDialog,
  PayloadViewerDialog,
  Timeline,
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEvent,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  TimelineFunctionButton,
  type AddCommentFormData,
  type AddCustomStateFormData,
  type PayloadViewerDialogState,
  type TimelineStateEvent,
} from '@/components/timeline';
import { useAuthContext } from '@/context/auth-context';
import { isEmail } from '@/utils/string';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useWorkflowRunCommentCreateModel,
  useWorkflowRunCommentDeleteModel,
  useWorkflowRunCommentUpdateModel,
  useWorkflowRunPayloadModel,
  useWorkflowRunStateCreateModel,
  useWorkflowRunStateUpdateModel,
  type WorkflowRunCommentModel,
  type WorkflowRunStateModel,
} from '../../api/workflows.api';
import { useWorkflowRunDetailContext } from '../context/WorkflowRunDetailContext';

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

function toDateTimeLocal(value?: string | null): string | undefined {
  if (!value) return undefined;

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DDTHH:mm') : undefined;
}

function isStateTransitionAllowed(rule: ValidationRule, currentState?: string | null): boolean {
  if (!currentState) return true;

  const currentStateKey = normalizeStateValue(currentState);

  if (Array.isArray(rule)) {
    return rule.some((state) => normalizeStateValue(state) === currentStateKey);
  }

  if (rule && typeof rule === 'object') {
    const allowedStates = rule.allowed_states ?? rule.allowedStates;
    const excludedStates = rule.excluded_states ?? rule.excludedStates;

    if (Array.isArray(allowedStates)) {
      return allowedStates.some((state) => normalizeStateValue(state) === currentStateKey);
    }

    if (Array.isArray(excludedStates)) {
      return !excludedStates.some((state) => normalizeStateValue(state) === currentStateKey);
    }
  }

  return true;
}

function isTimelineStateEvent(
  event: TimelineEvent | null | undefined
): event is TimelineStateEvent {
  return event?.eventType === TimelineEventTypes.STATE;
}

function sortEventsByLatestTimestamp<T extends { timestamp: string }>(events: T[]): T[] {
  return [...events].sort((a, b) => {
    const dateA = dayjs(a.timestamp);
    const dateB = dayjs(b.timestamp);

    if (dateA.isSame(dateB)) {
      return 0;
    }

    return dateA.isAfter(dateB) ? -1 : 1;
  });
}

export function WorkflowRunDetailTimeline() {
  const { user } = useAuthContext();
  const {
    workflowRunDetail,
    workflowRunCommentsData,
    workflowRunStatesData,
    workflowRunStateCreationValidMapData,
    isLoadingWorkflowRunComments,
    isLoadingWorkflowRunStates,
    refresh,
  } = useWorkflowRunDetailContext();

  const [isCreateStateDialogOpen, setIsCreateStateDialogOpen] = useState(false);
  const [editingState, setEditingState] = useState<WorkflowRunStateModel | null>(null);
  const [isCreateCommentDialogOpen, setIsCreateCommentDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<WorkflowRunCommentModel | null>(null);
  const [deletingComment, setDeletingComment] = useState<WorkflowRunCommentModel | null>(null);
  const [isPayloadViewerOpen, setIsPayloadViewerOpen] = useState(false);
  const [selectedPayloadStateEventId, setSelectedPayloadStateEventId] = useState<string | null>(
    null
  );
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const workflowRunOrcabusId = workflowRunDetail?.orcabusId ?? '';
  const currentUserEmail = user?.email ?? '';
  const currentWorkflowState = workflowRunDetail?.currentState?.status ?? null;
  const dialogActorTimestamp = dayjs().toISOString();

  const validationMapEntries = useMemo(
    () =>
      Object.entries(
        (workflowRunStateCreationValidMapData ?? {}) as Record<string, ValidationRule>
      ),
    [workflowRunStateCreationValidMapData]
  );

  const editableStateKeys = useMemo(
    () => new Set(validationMapEntries.map(([status]) => normalizeStateValue(status))),
    [validationMapEntries]
  );

  const availableStateOptions = useMemo(
    () =>
      validationMapEntries
        .filter(([, rule]) => isStateTransitionAllowed(rule, currentWorkflowState))
        .map(([status]) => ({
          value: status,
          label: formatStateLabel(status),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [currentWorkflowState, validationMapEntries]
  );

  const createWorkflowRunState = useWorkflowRunStateCreateModel();
  const updateWorkflowRunState = useWorkflowRunStateUpdateModel();
  const createWorkflowRunComment = useWorkflowRunCommentCreateModel();
  const updateWorkflowRunComment = useWorkflowRunCommentUpdateModel();
  const deleteWorkflowRunComment = useWorkflowRunCommentDeleteModel();

  const workflowRunTimelineStateData = useMemo<TimelineEvent[]>(
    () =>
      (workflowRunStatesData ?? []).map((state) => {
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
          payloadId: state.payload ?? undefined,
          actions: isEditableState
            ? [
                {
                  id: 'edit-state',
                  label: 'Edit',
                  icon: <SquarePen className='h-4 w-4' />,
                  onClick: () => {
                    setEditingState(state);
                  },
                },
              ]
            : undefined,
        } satisfies TimelineEvent;
      }),
    [editableStateKeys, workflowRunStatesData]
  );

  const workflowRunTimelineCommentData = useMemo<TimelineEvent[]>(
    () =>
      (workflowRunCommentsData ?? []).map((comment) => ({
        eventId: comment.orcabusId,
        eventType: TimelineEventTypes.COMMENT,
        timestamp: comment.updatedAt ?? comment.createdAt,
        createdBy: comment.createdBy,
        sourceType: isEmail(comment.createdBy)
          ? TimelineEventSourceTypes.USER
          : TimelineEventSourceTypes.SYSTEM,
        comment: comment.text,
        severity: comment.severity ?? TimelineCommentSeverityEnum.INFO,
        commentType: TimelineCommentTypes.GENERAL,
        actions: isEmail(comment.createdBy)
          ? [
              {
                id: 'edit-comment',
                label: 'Edit',
                icon: <SquarePen className='h-4 w-4' />,
                onClick: () => {
                  setEditingComment(comment);
                },
              },
              {
                id: 'delete-comment',
                label: 'Delete',
                icon: <Trash className='h-4 w-4' />,
                onClick: () => {
                  setDeletingComment(comment);
                },
              },
            ]
          : undefined,
      })),
    [workflowRunCommentsData]
  );

  const timelineEvents = useMemo(
    () => [...workflowRunTimelineStateData, ...workflowRunTimelineCommentData],
    [workflowRunTimelineCommentData, workflowRunTimelineStateData]
  );

  const sortedStateEvents = useMemo(
    () => sortEventsByLatestTimestamp(workflowRunTimelineStateData.filter(isTimelineStateEvent)),
    [workflowRunTimelineStateData]
  );

  const latestStateEvent = sortedStateEvents[0] ?? null;

  const payloadViewerStates = useMemo<PayloadViewerDialogState[]>(
    () =>
      [...sortedStateEvents].reverse().map((state) => ({
        eventId: state.eventId,
        state: state.state,
        timestamp: state.timestamp,
        payloadId: state.payloadId,
      })),
    [sortedStateEvents]
  );

  const activeSelectedEventId = useMemo(
    () =>
      selectedEventId && timelineEvents.some((event) => event.eventId === selectedEventId)
        ? selectedEventId
        : null,
    [selectedEventId, timelineEvents]
  );

  const selectedEvent = useMemo(
    () => timelineEvents.find((event) => event.eventId === activeSelectedEventId) ?? null,
    [activeSelectedEventId, timelineEvents]
  );

  const selectedStateEvent = isTimelineStateEvent(selectedEvent) ? selectedEvent : null;

  const activePayloadViewerState = useMemo(
    () =>
      payloadViewerStates.find((state) => state.eventId === selectedPayloadStateEventId) ??
      payloadViewerStates[payloadViewerStates.length - 1] ??
      null,
    [payloadViewerStates, selectedPayloadStateEventId]
  );

  const selectedPayloadId =
    isPayloadViewerOpen && activePayloadViewerState?.payloadId
      ? activePayloadViewerState.payloadId
      : null;

  const { data: selectedWorkflowPayloadData, isFetching: isFetchingSelectedWorkflowPayload } =
    useWorkflowRunPayloadModel({
      params: {
        path: {
          orcabusId: selectedPayloadId ?? '',
        },
      },
      reactQuery: {
        enabled: isPayloadViewerOpen && !!selectedPayloadId,
        placeholderData: keepPreviousData,
      },
    });

  const payloadViewerPayload = selectedPayloadId
    ? ((selectedWorkflowPayloadData as Record<string, unknown> | null | undefined) ?? null)
    : null;

  const handleAddCustomState = async (data: AddCustomStateFormData) => {
    if (!workflowRunOrcabusId) {
      throw new Error('Workflow run identifier is required');
    }

    await createWorkflowRunState.mutateAsync({
      params: {
        path: {
          orcabusId: workflowRunOrcabusId,
        },
      },
      body: {
        status: data.stateName,
        comment: data.comment,
      },
    });

    refresh();
  };

  const handleEditCustomState = async (data: AddCustomStateFormData) => {
    if (!workflowRunOrcabusId || !editingState) {
      throw new Error('Workflow state is not selected');
    }

    await updateWorkflowRunState.mutateAsync({
      params: {
        path: {
          orcabusId: workflowRunOrcabusId,
          id: editingState.orcabusId,
        },
      },
      body: {
        comment: data.comment,
      },
    });

    refresh();
  };

  const handleAddComment = async (data: AddCommentFormData) => {
    if (!workflowRunOrcabusId) {
      throw new Error('Workflow run identifier is required');
    }

    if (!currentUserEmail) {
      throw new Error('Authenticated user email is unavailable');
    }

    await createWorkflowRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: workflowRunOrcabusId,
        },
      },
      body: {
        text: data.comment,
        createdBy: currentUserEmail,
        severity: data.severity,
      },
    });

    refresh();
  };

  const handleEditComment = async (data: AddCommentFormData) => {
    if (!workflowRunOrcabusId || !editingComment) {
      throw new Error('Workflow comment is not selected');
    }

    await updateWorkflowRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: workflowRunOrcabusId,
          commentOrcabusId: editingComment.orcabusId,
        },
      },
      body: {
        text: data.comment,
        severity: data.severity,
        ...(currentUserEmail ? { createdBy: currentUserEmail } : {}),
      },
    });

    refresh();
  };

  const handleDeleteComment = async () => {
    if (!workflowRunOrcabusId || !deletingComment) {
      throw new Error('Workflow comment is not selected');
    }

    await deleteWorkflowRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: workflowRunOrcabusId,
          commentOrcabusId: deletingComment.orcabusId,
        },
      },
    });

    refresh();
  };

  if (!workflowRunDetail) {
    return null;
  }

  const isInitialTimelineLoad = isLoadingWorkflowRunStates || isLoadingWorkflowRunComments;

  return (
    <>
      <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
        {isInitialTimelineLoad ? (
          <div className='min-h-64'>
            <SpinnerWithText text='Loading workflow run timeline…' />
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
                <TimelineFunctionButton
                  icon={<FileBracesCorner className='h-4 w-4' />}
                  onClick={() => {
                    setSelectedPayloadStateEventId(
                      selectedStateEvent?.eventId ?? latestStateEvent?.eventId ?? null
                    );
                    setIsPayloadViewerOpen(true);
                  }}
                  disabled={!payloadViewerStates.length}
                >
                  View Payload
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
            ? [
                {
                  value: editingState.status,
                  label: formatStateLabel(editingState.status),
                },
              ]
            : []
        }
        initialValues={
          editingState
            ? {
                stateName: editingState.status,
                timestamp: toDateTimeLocal(editingState.timestamp),
                comment: editingState.comment ?? '',
              }
            : undefined
        }
        mode='edit'
        title='Edit Workflow State'
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
                timestamp: toDateTimeLocal(editingComment.updatedAt ?? editingComment.createdAt),
                comment: editingComment.text,
                severity: editingComment.severity ?? TimelineCommentSeverityEnum.INFO,
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
        commentPreview={deletingComment?.text}
      />

      <PayloadViewerDialog
        isOpen={isPayloadViewerOpen}
        onClose={() => {
          setIsPayloadViewerOpen(false);
          setSelectedPayloadStateEventId(null);
        }}
        states={payloadViewerStates}
        selectedStateEventId={selectedPayloadStateEventId}
        onSelectedStateEventIdChange={setSelectedPayloadStateEventId}
        payload={payloadViewerPayload}
        isLoading={isFetchingSelectedWorkflowPayload}
      />
    </>
  );
}
