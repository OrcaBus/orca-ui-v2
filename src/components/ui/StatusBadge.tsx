import { Tooltip, TooltipTrigger, TooltipContent } from './Tooltip';
import { FAMILY_CLASSNAMES, normalizeStatusBadgeKey, statusConfig } from './status-config';
import { cn } from '@/utils/cn';

// Family lookups (getStatusFamily, FAMILY_ACCENT, FAMILY_DOT) and the
// StatusFamily/StatusBadgeStatus types live in ./status-config, not here —
// a file that exports both a component and plain values breaks Vite Fast
// Refresh. Import them from '@/components/ui/status-config' directly.

interface StatusBadgeProps {
  /** Matched case-insensitively; underscores become hyphens. Unknown / empty → unknown. */
  status?: string | null;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

export function StatusBadge({ status, size = 'sm', showTooltip = true }: StatusBadgeProps) {
  const canonicalStatus = normalizeStatusBadgeKey(status);
  const config = statusConfig[canonicalStatus];
  const Icon = config.icon;
  const className = FAMILY_CLASSNAMES[config.family];
  // Most statusConfig entries never declare `animate` at all (only the
  // handful of "actively executing" states do), so the inferred union type
  // doesn't have the property on every member — narrow with `in` rather
  // than giving all ~34 other entries an explicit `animate: false`.
  const shouldAnimate = 'animate' in config && config.animate;

  const sizes = {
    sm: {
      badge: 'h-6 gap-1 px-2 text-xs leading-none',
      icon: 'w-3 h-3',
    },
    md: {
      badge: 'h-7 gap-1.5 px-2.5 text-sm leading-none',
      icon: 'w-3.5 h-3.5',
    },
  };

  const badge = (
    <span
      tabIndex={showTooltip ? 0 : undefined}
      className={`inline-flex items-center rounded border font-medium outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className} ${sizes[size].badge}`}
    >
      <Icon className={cn(sizes[size].icon, shouldAnimate && 'motion-safe:animate-pulse')} />
      {config.label}
    </span>
  );

  if (!showTooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent
        showArrow={false}
        className='bg-neutral-900 px-3 py-2 text-xs whitespace-nowrap text-white dark:border dark:border-[#2d3540] dark:bg-[#1e252e] dark:shadow-black/40'
      >
        {config.tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
