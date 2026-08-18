import {
  CheckCircle,
  XCircle,
  Ban,
  Archive,
  Loader,
  ShieldCheck,
  ShieldQuestion,
  CircleDot,
  CircleOff,
  Hash,
  MessageCircleCheck,
  NotebookPen,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { getStatusFamily, FAMILY_ACCENT } from '@/components/ui/status-config';

const filledIconProps = { fill: 'currentColor', stroke: 'white', strokeWidth: 1.5 } as const;

// Both functions below key off the same five-family vocabulary StatusBadge
// uses (getStatusFamily/FAMILY_ACCENT) rather than choosing their own
// per-status colors — they used to disagree with StatusBadge (and with the
// timeline) about e.g. "deprecated" or "unvalidated". Icon choice and
// which states get the filled/outlined treatment stay local, since that's
// a legitimate presentational difference for a larger stat-tile icon.

export function getValidationStateIcon(state: string) {
  const accent = FAMILY_ACCENT[getStatusFamily(state)];
  switch (state) {
    case 'validated':
      return <ShieldCheck className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'unvalidated':
      return <ShieldQuestion className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'deprecated':
      return <Archive className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'failed':
      return <XCircle className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    default:
      return null;
  }
}

export function getAnalysisTypeIcon(type: string) {
  switch (type) {
    case 'ACTIVE':
      return <CircleDot className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'INACTIVE':
      return <CircleOff className='h-5 w-5 text-neutral-400' {...filledIconProps} />;
    case 'total':
      return <Hash className='h-5 w-5 text-blue-500' />;
    default:
      return null;
  }
}

export function getWorkflowTypeIcon(type: string) {
  switch (type) {
    case 'ACTIVE':
      return <CircleDot className='h-5 w-5 text-green-500' {...filledIconProps} />;
    case 'INACTIVE':
      return <CircleOff className='h-5 w-5 text-neutral-400' {...filledIconProps} />;
  }
}

export function getRunsStatusIcon(status: string) {
  const accent = FAMILY_ACCENT[getStatusFamily(status)];
  switch (status) {
    case 'succeeded':
      return <CheckCircle className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'failed':
      return <XCircle className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'aborted':
      return <Ban className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'resolved':
      return <MessageCircleCheck className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'deprecated':
      return <Archive className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    case 'ongoing':
    case 'running':
      return <Loader className={cn('h-5 w-5 motion-safe:animate-spin', accent)} />;
    case 'draft':
      return <NotebookPen className={cn('h-5 w-5', accent)} {...filledIconProps} />;
    default:
      return null;
  }
}
