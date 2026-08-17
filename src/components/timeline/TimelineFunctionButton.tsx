import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface TimelineFunctionButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
}

/** Renders a consistently styled action button for timeline header controls. */
export function TimelineFunctionButton({
  icon,
  variant = 'secondary',
  type = 'button',
  className,
  children,
  ...props
}: TimelineFunctionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'focus:ring-ring inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-offset-2 dark:focus:ring-offset-neutral-950'
          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
        className
      )}
      {...props}
    >
      {icon && <span className='flex h-4 w-4 items-center justify-center'>{icon}</span>}
      {children}
    </button>
  );
}
