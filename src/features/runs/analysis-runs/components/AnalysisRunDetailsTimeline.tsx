import { useMemo, useState } from 'react';
import { MessageCircle, SquarePen, Trash } from 'lucide-react';
import {
  CommentDialog,
  DeleteCommentDialog,
  Timeline,
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEvent,
  TimelineEventSourceTypes,
  TimelineEventTypes,
  TimelineFunctionButton,
  type AddCommentFormData,
} from '@/components/timeline';
import { useAuthContext } from '@/context/auth-context';
import { formatBackendDate, formatDateTimeLocalInputValue } from '@/utils/timeFormat';
import { SpinnerWithText } from '@/components/ui/Spinner';
import {
  useAnalysisRunCommentCreateModel,
  useAnalysisRunCommentUpdateModel,
  useAnalysisRunCommentDeleteModel,
  type AnalysisRunCommentModel,
} from '../../api/workflows.api';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';

// ---------------------------------------------------------------------------
// Helpers (scoped to this module)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AnalysisRunDetailsTimeline() {
  const { user } = useAuthContext();
  const { analysisRunDetail, analysisRunCommentsData, isLoadingAnalysisRunComments, refresh } =
    useAnalysisRunDetailsContext();

  const [isCreateCommentDialogOpen, setIsCreateCommentDialogOpen] = useState(false);
  const [editingComment, setEditingComment] = useState<AnalysisRunCommentModel | null>(null);
  const [deletingComment, setDeletingComment] = useState<AnalysisRunCommentModel | null>(null);

  const analysisRunOrcabusId = analysisRunDetail?.orcabusId ?? '';
  const currentUserEmail = user?.email ?? '';
  const dialogActorTimestamp = formatBackendDate(new Date());

  const createAnalysisRunComment = useAnalysisRunCommentCreateModel();
  const updateAnalysisRunComment = useAnalysisRunCommentUpdateModel();
  const deleteAnalysisRunComment = useAnalysisRunCommentDeleteModel();

  // States come embedded in the detail object — no separate API call needed.
  // All states are system-generated; users cannot create or edit them.
  const analysisRunTimelineStateData = useMemo<TimelineEvent[]>(
    () =>
      (analysisRunDetail?.states ?? []).map(
        (state) =>
          ({
            eventId: state.orcabusId,
            eventType: TimelineEventTypes.STATE,
            timestamp: state.timestamp,
            sourceType: TimelineEventSourceTypes.SYSTEM,
            state: state.status,
            comment: state.comment ?? undefined,
          }) satisfies TimelineEvent
      ),
    [analysisRunDetail?.states]
  );

  const analysisRunTimelineCommentData = useMemo<TimelineEvent[]>(
    () =>
      (analysisRunCommentsData ?? []).map((comment) => ({
        eventId: comment.orcabusId,
        eventType: TimelineEventTypes.COMMENT,
        timestamp: comment.updatedAt ?? comment.createdAt,
        createdBy: comment.createdBy,
        sourceType: TimelineEventSourceTypes.USER,
        comment: comment.text,
        severity: comment.severity ?? TimelineCommentSeverityEnum.INFO,
        commentType: TimelineCommentTypes.GENERAL,
        actions: [
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
        ],
      })),
    [analysisRunCommentsData]
  );

  const timelineEvents = useMemo(
    () => [...analysisRunTimelineStateData, ...analysisRunTimelineCommentData],
    [analysisRunTimelineCommentData, analysisRunTimelineStateData]
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleAddComment = async (data: AddCommentFormData) => {
    if (!analysisRunOrcabusId) {
      throw new Error('Analysis run identifier is required');
    }

    if (!currentUserEmail) {
      throw new Error('Authenticated user email is unavailable');
    }

    await createAnalysisRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: analysisRunOrcabusId,
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
    if (!analysisRunOrcabusId || !editingComment) {
      throw new Error('Analysis run comment is not selected');
    }

    await updateAnalysisRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: analysisRunOrcabusId,
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
    if (!analysisRunOrcabusId || !deletingComment) {
      throw new Error('Analysis run comment is not selected');
    }

    await deleteAnalysisRunComment.mutateAsync({
      params: {
        path: {
          orcabusId: analysisRunOrcabusId,
          commentOrcabusId: deletingComment.orcabusId,
        },
      },
    });

    refresh();
  };

  if (!analysisRunDetail) {
    return null;
  }

  return (
    <>
      <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
        {isLoadingAnalysisRunComments ? (
          <div className='min-h-64'>
            <SpinnerWithText text='Loading analysis run timeline…' />
          </div>
        ) : (
          <Timeline
            events={timelineEvents}
            customActions={
              <>
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
                timestamp: formatDateTimeLocalInputValue(
                  editingComment.updatedAt ?? editingComment.createdAt
                ),
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
    </>
  );
}
