import {
  TimelineEventTypes,
  type TimelineEventConfig,
  type TimelineEventType,
} from './timeline.type';

export const TIMELINE_EVENT_CONFIGS: Record<TimelineEventType, TimelineEventConfig> = {
  [TimelineEventTypes.STATE]: { label: 'State Change', icon: 'state' },
  [TimelineEventTypes.COMMENT]: { label: 'Comment', icon: 'comment' },
};
