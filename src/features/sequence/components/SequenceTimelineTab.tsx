import { useMemo } from 'react';
import { EnhancedTimeline } from '../../../components/timeline';
import type { AddCustomStateFormData, AddCommentFormData } from '../../../components/timeline';
import type { SequenceRun } from '../../../data/mockData';
import { statusEventsToTimelineEvents } from '../utils/statusEventToTimelineEvent';

const SEQUENCE_RUN_STATES = [
  { value: 'pending', label: 'Pending' },
  { value: 'running', label: 'Running' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'aborted', label: 'Aborted' },
  { value: 'on_hold', label: 'On Hold' },
] as const;

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
  const { events, availableRunIds } = useMemo(() => {
    const allEvents = sequenceRuns.flatMap((sr) =>
      statusEventsToTimelineEvents(sr.statusHistory ?? [], sr.id, sr.runId)
    );
    const runIds =
      sequenceRuns.length > 1 ? sequenceRuns.map((sr) => ({ value: sr.id, label: sr.runId })) : [];
    return { events: allEvents, availableRunIds: runIds };
  }, [sequenceRuns]);

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <EnhancedTimeline
        events={events}
        availableRunIds={availableRunIds}
        availableStates={[...SEQUENCE_RUN_STATES]}
        onAddCustomState={onAddCustomState}
        onAddComment={onAddComment}
        filterLabel='Sequence Run ID'
      />
    </div>
  );
}
