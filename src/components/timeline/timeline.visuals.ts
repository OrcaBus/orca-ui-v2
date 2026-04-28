import {
  Archive,
  Ban,
  CheckCircle,
  CircleArrowUp,
  Clock,
  FilePenLine,
  FileText,
  MessageCircleCode,
  MessageCircleWarning,
  MessageCircleX,
  PlayCircle,
  XCircle,
  LoaderCircle,
  type LucideIcon,
  MessageCircleMore,
} from 'lucide-react';
import type { TimelineCommentEvent, TimelineEvent, TimelineStateEvent } from './timeline.type';
import {
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEventTypes,
} from './timeline.type';

export type TimelineVisual = {
  icon: LucideIcon;
  nodeClassName: string;
  iconClassName: string;
  cardClassName: string;
  badgeClassName: string;
};

const NEUTRAL_STATE_VISUAL: TimelineVisual = {
  icon: PlayCircle,
  nodeClassName: 'border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800',
  iconClassName: 'text-neutral-600 dark:text-neutral-300',
  cardClassName:
    'bg-linear-to-r from-blue-50/80 to-white shadow-xs shadow-blue-100/50 ring-1 ring-blue-100/50 dark:from-blue-900/20 dark:to-gray-800/50 dark:shadow-blue-900/20 dark:ring-blue-900/20',
  badgeClassName: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
};

function neutralStateVisual(icon: LucideIcon): TimelineVisual {
  return {
    ...NEUTRAL_STATE_VISUAL,
    icon,
  };
}

export const STATE_VISUALS: Record<string, TimelineVisual> = {
  DRAFT: neutralStateVisual(FilePenLine),
  READY: neutralStateVisual(CheckCircle),
  SUBMITTED: neutralStateVisual(CircleArrowUp),
  RUNNABLE: neutralStateVisual(PlayCircle),
  STARTING: neutralStateVisual(Clock),
  RUNNING: neutralStateVisual(LoaderCircle),
  STARTED: {
    icon: LoaderCircle,
    nodeClassName: 'border-transparent bg-blue-100 dark:border-transparent dark:bg-blue-950',
    iconClassName: 'text-blue-700 dark:text-blue-300',
    cardClassName:
      'bg-linear-to-r from-blue-50/80 to-white shadow-xs shadow-blue-100/50 ring-1 ring-blue-100/80 dark:from-blue-950/30 dark:to-neutral-950/20 dark:shadow-blue-950/20 dark:ring-blue-900/50',
    badgeClassName: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  SUCCEEDED: {
    icon: CheckCircle,
    nodeClassName: 'border-transparent bg-green-100 dark:border-transparent dark:bg-green-950',
    iconClassName: 'text-green-700 dark:text-green-300',
    cardClassName:
      'bg-linear-to-r from-green-50/80 to-white shadow-xs shadow-green-100/50 ring-1 ring-green-100/80 dark:from-green-950/30 dark:to-neutral-950/20 dark:shadow-green-950/20 dark:ring-green-900/50',
    badgeClassName: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  },
  FAILED: {
    icon: XCircle,
    nodeClassName: 'border-transparent bg-red-100 dark:border-transparent dark:bg-red-950',
    iconClassName: 'text-red-700 dark:text-red-300',
    cardClassName:
      'bg-linear-to-r from-red-50/80 to-white shadow-xs shadow-red-100/50 ring-1 ring-red-100/80 dark:from-red-950/30 dark:to-neutral-950/20 dark:shadow-red-950/20 dark:ring-red-900/50',
    badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
  ABORTED: {
    icon: Ban,
    nodeClassName: 'border-transparent bg-orange-100 dark:border-transparent dark:bg-orange-950',
    iconClassName: 'text-orange-700 dark:text-orange-300',
    cardClassName:
      'bg-linear-to-r from-orange-50/80 to-white shadow-xs shadow-orange-100/50 ring-1 ring-orange-100/80 dark:from-orange-950/30 dark:to-neutral-950/20 dark:shadow-orange-950/20 dark:ring-orange-900/50',
    badgeClassName: 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300',
  },
  RESOLVED: {
    icon: CheckCircle,
    nodeClassName: 'border-transparent bg-teal-100 dark:border-transparent dark:bg-teal-950',
    iconClassName: 'text-teal-700 dark:text-teal-300',
    cardClassName:
      'bg-linear-to-r from-teal-50/80 to-white shadow-xs shadow-teal-100/50 ring-1 ring-teal-100/80 dark:from-teal-950/30 dark:to-neutral-950/20 dark:shadow-teal-950/20 dark:ring-teal-900/50',
    badgeClassName: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  },
  DEPRECATED: {
    icon: Archive,
    nodeClassName: 'border-transparent bg-neutral-200 dark:border-transparent dark:bg-neutral-800',
    iconClassName: 'text-neutral-700 dark:text-neutral-300',
    cardClassName:
      'bg-linear-to-r from-neutral-100/80 to-white shadow-xs shadow-neutral-100/50 ring-1 ring-neutral-200/80 dark:from-neutral-900/50 dark:to-neutral-950/20 dark:shadow-neutral-900/20 dark:ring-neutral-800/80',
    badgeClassName: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
  },
};

const STATE_ALIASES: Record<string, string> = {
  COMPLETED: 'SUCCEEDED',
  COMPLETE: 'SUCCEEDED',
  SUCCESS: 'SUCCEEDED',
  ONGOING: 'STARTED',
  PROCESSING: 'STARTED',
  INITIALIZING: 'STARTED',
  QUEUED: 'DRAFT',
  PENDING: 'DRAFT',
  ERROR: 'FAILED',
  CANCELLED: 'ABORTED',
  CANCELED: 'ABORTED',
};

function normalizeStateKey(state: string): string {
  return state
    .trim()
    .replace(/[\s-]+/g, '_')
    .toUpperCase();
}

export function getTimelineStateVisual(state: string): TimelineVisual {
  const stateKey = normalizeStateKey(state);
  const visualKey = STATE_VISUALS[stateKey] ? stateKey : STATE_ALIASES[stateKey];
  return visualKey ? STATE_VISUALS[visualKey] : NEUTRAL_STATE_VISUAL;
}

const COMMENT_VISUALS: Record<string, TimelineVisual> = {
  [TimelineCommentSeverityEnum.DEBUG]: {
    icon: MessageCircleCode,
    nodeClassName: 'border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800',
    iconClassName: 'text-neutral-600 dark:text-neutral-300',
    cardClassName:
      'bg-linear-to-r from-neutral-50/80 to-white shadow-xs shadow-neutral-100/50 ring-1 ring-neutral-200/60 dark:from-neutral-900/40 dark:to-neutral-950/20 dark:shadow-neutral-900/20 dark:ring-neutral-800/80',
    badgeClassName: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  [TimelineCommentSeverityEnum.INFO]: {
    icon: MessageCircleMore,
    nodeClassName: 'border-transparent bg-slate-100 dark:border-transparent dark:bg-slate-800',
    iconClassName: 'text-slate-600 dark:text-slate-300',
    cardClassName:
      'bg-linear-to-r from-slate-50/80 to-white shadow-xs shadow-slate-100/50 ring-1 ring-slate-200/70 dark:from-slate-900/30 dark:to-neutral-950/20 dark:shadow-slate-900/20 dark:ring-slate-800/70',
    badgeClassName: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  [TimelineCommentSeverityEnum.WARNING]: {
    icon: MessageCircleWarning,
    nodeClassName: 'border-transparent bg-amber-100 dark:border-transparent dark:bg-amber-950',
    iconClassName: 'text-amber-700 dark:text-amber-300',
    cardClassName:
      'bg-linear-to-r from-amber-50/80 to-white shadow-xs shadow-amber-100/50 ring-1 ring-amber-100/80 dark:from-amber-950/30 dark:to-neutral-950/20 dark:shadow-amber-950/20 dark:ring-amber-900/50',
    badgeClassName: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
  [TimelineCommentSeverityEnum.ERROR]: {
    icon: MessageCircleX,
    nodeClassName: 'border-transparent bg-red-100 dark:border-transparent dark:bg-red-950',
    iconClassName: 'text-red-700 dark:text-red-300',
    cardClassName:
      'bg-linear-to-r from-red-50/80 to-white shadow-xs shadow-red-100/50 ring-1 ring-red-100/80 dark:from-red-950/30 dark:to-neutral-950/20 dark:shadow-red-950/20 dark:ring-red-900/50',
    badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
};

const SAMPLESHEET_VISUAL: TimelineVisual = {
  icon: FileText,
  nodeClassName: 'border-transparent bg-cyan-100 dark:border-transparent dark:bg-cyan-950',
  iconClassName: 'text-cyan-700 dark:text-cyan-300',
  cardClassName:
    'bg-linear-to-r from-cyan-50/80 to-white shadow-xs shadow-cyan-100/50 ring-1 ring-cyan-100/80 dark:from-cyan-950/30 dark:to-neutral-950/20 dark:shadow-cyan-950/20 dark:ring-cyan-900/50',
  badgeClassName: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
};

function isStateEvent(event: TimelineEvent): event is TimelineStateEvent {
  return event.eventType === TimelineEventTypes.STATE;
}

function getCommentVisual(event: TimelineCommentEvent): TimelineVisual {
  const severity = event.severity ?? TimelineCommentSeverityEnum.INFO;

  if (event.commentType === TimelineCommentTypes.SAMPLESHEET) {
    return severity === TimelineCommentSeverityEnum.INFO
      ? SAMPLESHEET_VISUAL
      : { ...COMMENT_VISUALS[severity], icon: FileText };
  }

  return COMMENT_VISUALS[severity];
}

export function getTimelineEventVisual(event: TimelineEvent): TimelineVisual {
  return isStateEvent(event) ? getTimelineStateVisual(event.state) : getCommentVisual(event);
}
