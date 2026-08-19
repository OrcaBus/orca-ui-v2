import {
  XCircle,
  Archive,
  ShieldCheck,
  ShieldQuestion,
  CircleDot,
  CircleOff,
  Hash,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  FAMILY_ACCENT,
  getStatusFamily,
  normalizeStatusBadgeKey,
  statusConfig,
} from '@/components/ui/status-config';

const filledIconProps = { fill: 'currentColor', stroke: 'white', strokeWidth: 1.5 } as const;

// Validation-state icons use the shared family accents while retaining their
// domain-specific icon and filled treatment. Run-status icons below render
// directly from the shared status registry.

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
  const canonicalStatus = normalizeStatusBadgeKey(status);
  if (canonicalStatus === 'unknown') return null;
  const config = statusConfig[canonicalStatus];
  const Icon = config.icon;
  const shouldAnimate = 'animate' in config && config.animate;
  return (
    <Icon
      className={cn(
        'h-5 w-5',
        shouldAnimate && 'motion-safe:animate-spin',
        FAMILY_ACCENT[config.family]
      )}
    />
  );
}
