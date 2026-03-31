/**
 * Enhanced Timeline Component System
 *
 * A comprehensive timeline component for displaying operational events,
 * state changes, and user interactions for Sequence Runs and Workflow Runs.
 *
 * @example
 * ```tsx
 * import { EnhancedTimeline } from './components/timeline';
 * import { workflowRunStates } from './data/mockTimelineData';
 *
 * <EnhancedTimeline
 *   events={events}
 *   availableStates={workflowRunStates}
 *   onAddCustomState={handleAddState}
 *   onAddComment={handleAddComment}
 * />
 * ```
 */

// Main component
export { EnhancedTimeline } from './EnhancedTimeline';

// Dialog components
export { AddCustomStateDialog } from './AddCustomStateDialog';
export { AddCommentDialog } from './AddCommentDialog';
export { PayloadViewerDialog } from './PayloadViewerDialog';

// Re-export types for convenience
export type {
  TimelineEvent,
  TimelineEventType,
  TimelineEventSource,
  TimelineFilters,
  TimelineEventConfig,
  WorkflowRunStatus,
  SequenceRunStatus,
  AddCustomStateFormData,
  AddCommentFormData,
} from './timeline.type';

export { TIMELINE_EVENT_CONFIGS } from './timeline.constants';
