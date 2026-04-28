import { useMemo, useState } from 'react';
import { MessageCircle, Plus } from 'lucide-react';
import {
  CommentDialog,
  CustomStateDialog,
  Timeline,
  TimelineFunctionButton,
} from '../../../components/timeline';
import type { AddCustomStateFormData, AddCommentFormData } from '../../../components/timeline';
import type { SequenceRun } from '../../../data/mockData';
import { statusEventsToTimelineEvents } from '../utils/statusEventToTimelineEvent';

interface SequenceTimelineTabProps {
  sequenceRuns: SequenceRun[];
  onAddCustomState: (data: AddCustomStateFormData) => Promise<void>;
  onAddComment: (data: AddCommentFormData) => Promise<void>;
}

export function SequenceTimelineTab({
  sequenceRuns,
  onAddCustomState,
  onAddComment,
}: SequenceTimelineTabProps) {
  const [isCustomStateDialogOpen, setIsCustomStateDialogOpen] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);

  const events = useMemo(
    () => sequenceRuns.flatMap((sr) => statusEventsToTimelineEvents(sr.statusHistory ?? [], sr.id)),
    [sequenceRuns]
  );

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <Timeline
        events={events}
        customActions={
          <>
            <TimelineFunctionButton
              icon={<Plus className='h-4 w-4' />}
              variant='primary'
              onClick={() => setIsCustomStateDialogOpen(true)}
            >
              Add State
            </TimelineFunctionButton>
            <TimelineFunctionButton
              icon={<MessageCircle className='h-4 w-4' />}
              onClick={() => setIsCommentDialogOpen(true)}
            >
              Add Comment
            </TimelineFunctionButton>
          </>
        }
      />

      <CustomStateDialog
        isOpen={isCustomStateDialogOpen}
        onClose={() => setIsCustomStateDialogOpen(false)}
        onSubmit={onAddCustomState}
      />

      <CommentDialog
        isOpen={isCommentDialogOpen}
        onClose={() => setIsCommentDialogOpen(false)}
        onSubmit={onAddComment}
      />
    </div>
  );
}
