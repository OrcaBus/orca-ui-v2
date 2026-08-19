import {
  AlertTriangle,
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
import { getStatusFamily, type StatusFamily } from '@/components/ui/status-config';
import type { TimelineCommentEvent, TimelineEvent } from './timeline.type';
import { TimelineCommentSeverityEnum, TimelineCommentTypes } from './timeline.type';
import { isStateEvent } from './timeline.utils';

export type TimelineVisual = {
  icon: LucideIcon;
  nodeClassName: string;
  iconClassName: string;
  cardClassName: string;
  badgeClassName: string;
};

/**
 * Rich gradient-card treatment per status family — richer than StatusBadge's chip,
 * but the same hue per family. Every timeline state resolves to one of these via `getStatusFamily` rather than choosing its own color;
 * see DESIGN.md → Implementation Notes for why that matters.
 */
const FAMILY_VISUAL: Record<StatusFamily, Omit<TimelineVisual, 'icon'>> = {
  neutral: {
    nodeClassName: 'border-transparent bg-neutral-100 dark:border-transparent dark:bg-neutral-800',
    iconClassName: 'text-neutral-600 dark:text-neutral-300',
    cardClassName:
      'bg-linear-to-r from-blue-50/80 to-white shadow-xs shadow-blue-100/50 ring-1 ring-blue-100/50 dark:from-blue-900/20 dark:to-gray-800/50 dark:shadow-blue-900/20 dark:ring-blue-900/20',
    badgeClassName: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  },
  info: {
    nodeClassName: 'border-transparent bg-blue-100 dark:border-transparent dark:bg-blue-950',
    iconClassName: 'text-blue-700 dark:text-blue-300',
    cardClassName:
      'bg-linear-to-r from-blue-50/80 to-white shadow-xs shadow-blue-100/50 ring-1 ring-blue-100/80 dark:from-blue-950/30 dark:to-neutral-950/20 dark:shadow-blue-950/20 dark:ring-blue-900/50',
    badgeClassName: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  },
  success: {
    nodeClassName: 'border-transparent bg-green-100 dark:border-transparent dark:bg-green-950',
    iconClassName: 'text-green-700 dark:text-green-300',
    cardClassName:
      'bg-linear-to-r from-green-50/80 to-white shadow-xs shadow-green-100/50 ring-1 ring-green-100/80 dark:from-green-950/30 dark:to-neutral-950/20 dark:shadow-green-950/20 dark:ring-green-900/50',
    badgeClassName: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  },
  error: {
    nodeClassName: 'border-transparent bg-red-100 dark:border-transparent dark:bg-red-950',
    iconClassName: 'text-red-700 dark:text-red-300',
    cardClassName:
      'bg-linear-to-r from-red-50/80 to-white shadow-xs shadow-red-100/50 ring-1 ring-red-100/80 dark:from-red-950/30 dark:to-neutral-950/20 dark:shadow-red-950/20 dark:ring-red-900/50',
    badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  },
  warning: {
    nodeClassName: 'border-transparent bg-amber-100 dark:border-transparent dark:bg-amber-950',
    iconClassName: 'text-amber-700 dark:text-amber-300',
    cardClassName:
      'bg-linear-to-r from-amber-50/80 to-white shadow-xs shadow-amber-100/50 ring-1 ring-amber-100/80 dark:from-amber-950/30 dark:to-neutral-950/20 dark:shadow-amber-950/20 dark:ring-amber-900/50',
    badgeClassName: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  },
};

function visualFor(family: StatusFamily, icon: LucideIcon): TimelineVisual {
  return { icon, ...FAMILY_VISUAL[family] };
}

const ARCHIVED_EVENT_VISUAL: TimelineVisual = {
  icon: Archive,
  nodeClassName:
    'border-transparent bg-neutral-200 opacity-80 dark:border-transparent dark:bg-neutral-800',
  iconClassName: 'text-neutral-700 dark:text-neutral-300',
  cardClassName:
    'bg-linear-to-r from-neutral-100/80 to-white shadow-xs shadow-neutral-100/50 ring-1 ring-neutral-200/80 dark:from-neutral-900/50 dark:to-neutral-950/20 dark:shadow-neutral-900/20 dark:ring-neutral-800/80',
  badgeClassName: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300',
};

export const STATE_VISUALS: Record<string, TimelineVisual> = {
  DRAFT: visualFor(getStatusFamily('draft'), FilePenLine),
  READY: visualFor(getStatusFamily('ready'), CheckCircle),
  SUBMITTED: visualFor(getStatusFamily('submitted'), CircleArrowUp),
  RUNNABLE: visualFor(getStatusFamily('runnable'), PlayCircle),
  STARTING: visualFor(getStatusFamily('starting'), Clock),
  RUNNING: visualFor(getStatusFamily('running'), LoaderCircle),
  STARTED: visualFor(getStatusFamily('started'), LoaderCircle),
  SUCCEEDED: visualFor(getStatusFamily('succeeded'), CheckCircle),
  FAILED: visualFor(getStatusFamily('failed'), XCircle),
  ABORTED: visualFor(getStatusFamily('aborted'), Ban),
  CANCELLED: visualFor(getStatusFamily('cancelled'), Ban),
  RESOLVED: visualFor(getStatusFamily('resolved'), CheckCircle),
  DEPRECATED: visualFor(getStatusFamily('deprecated'), Archive),
  // Case-timeline milestones. Partial failure is "warning" (degraded, not
  // a hard FAILED); phase-completed is "info", not "success" — green
  // stays reserved for the case's actual terminal `completed` state.
  CASE_PARTIALLY_FAILED: visualFor('warning', AlertTriangle),
  CASE_PHASE_COMPLETED: visualFor('info', CheckCircle),
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
  CANCELED: 'CANCELLED',
  REQUEST_RECEIVED: 'STARTED',
  SAMPLE_RECEIVED: 'STARTED',
  LIBRARY_PARTIALLY_FAILED: 'CASE_PARTIALLY_FAILED',
  SEQUENCING_STARTED: 'STARTED',
  SEQUENCING_COMPLETED: 'CASE_PHASE_COMPLETED',
  BIOINFORMATICS_STARTED: 'STARTED',
  BIOINFORMATICS_COMPLETED: 'CASE_PHASE_COMPLETED',
  CURATION_STARTED: 'STARTED',
  CURATION_COMPLETED: 'CASE_PHASE_COMPLETED',
  LOCKED: 'DEPRECATED',
  UNLOCKED: 'DEPRECATED',
  ARCHIVED: 'DEPRECATED',
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
  return visualKey ? STATE_VISUALS[visualKey] : STATE_VISUALS.DRAFT;
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
  if (event.isArchived) {
    return ARCHIVED_EVENT_VISUAL;
  }

  return isStateEvent(event) ? getTimelineStateVisual(event.state) : getCommentVisual(event);
}
