import { EnhancedTimeline } from '@/components/timeline/EnhancedTimeline';
import { getAllRunIds, workflowRunStates } from '@/data/mockTimelineData';
import type {
  TimelineEvent,
  AddCustomStateFormData,
  AddCommentFormData,
} from '@/components/timeline/timeline.type';

export interface WorkflowRunTimelineTabProps {
  events: TimelineEvent[];
  filterLabel: string;
  onAddCustomState: (data: AddCustomStateFormData) => Promise<void>;
  onAddComment: (data: AddCommentFormData) => Promise<void>;
}

export function WorkflowRunTimelineTab({
  events,
  filterLabel,
  onAddCustomState,
  onAddComment,
}: WorkflowRunTimelineTabProps) {
  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <EnhancedTimeline
        events={events}
        availableRunIds={getAllRunIds()}
        availableStates={workflowRunStates}
        onAddCustomState={onAddCustomState}
        onAddComment={onAddComment}
        filterLabel={filterLabel}
      />
    </div>
  );
}
