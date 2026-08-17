import { X } from 'lucide-react';
import { ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '@/utils/cn';

export type PillTagVariant = 'blue' | 'green' | 'purple' | 'amber' | 'neutral' | 'red';

export interface PillTagProps {
  children: ReactNode;
  variant?: PillTagVariant;
  size?: 'sm' | 'md';
  icon?: ReactNode;
  /** Renders as an internal app link (react-router) instead of a static tag. Mutually exclusive with `onClick`/`onRemove`. */
  href?: string;
  /** Renders as a button instead of a static tag. Mutually exclusive with `href`/`onRemove`. */
  onClick?: () => void;
  /** Adds a remove (×) affordance to a static tag. Ignored when `href`/`onClick` is set. */
  onRemove?: () => void;
}

export function PillTag({
  children,
  variant = 'neutral',
  size = 'sm',
  icon,
  href,
  onClick,
  onRemove,
}: PillTagProps) {
  const variants: Record<PillTagVariant, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    green:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    amber:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    neutral:
      'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540]',
    purple:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };

  const hoverClasses: Record<PillTagVariant, string> = {
    blue: 'hover:bg-blue-200 dark:hover:bg-blue-500/20',
    green: 'hover:bg-green-200 dark:hover:bg-green-500/20',
    amber: 'hover:bg-amber-200 dark:hover:bg-amber-500/20',
    neutral: 'hover:bg-neutral-200 dark:hover:bg-[#2d3540]',
    purple: 'hover:bg-purple-200 dark:hover:bg-purple-500/20',
    red: 'hover:bg-red-200 dark:hover:bg-red-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const isInteractive = Boolean(href || onClick);

  const classes = cn(
    'inline-flex items-center gap-1 rounded-full border font-medium transition-colors',
    variants[variant],
    sizes[size],
    isInteractive && [hoverClasses[variant], 'cursor-pointer']
  );

  if (href) {
    return (
      <Link to={href} className={classes}>
        {icon}
        {children}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type='button' onClick={onClick} className={classes}>
        {icon}
        {children}
      </button>
    );
  }

  return (
    <span className={classes}>
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className='rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        >
          <X className='h-3 w-3' />
        </button>
      )}
    </span>
  );
}
