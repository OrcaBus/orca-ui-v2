import type { ComponentProps } from 'react';
import { cn } from '@/utils/cn';

function Spinner({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='spinner'
      role='status'
      aria-label='Loading'
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent',
        className
      )}
      {...props}
    >
      <span className='sr-only'>Loading…</span>
    </div>
  );
}

function SpinnerWithText({
  text = 'Loading…',
  className,
  ...props
}: ComponentProps<'div'> & { text?: string }) {
  return (
    <div
      data-slot='spinner-with-text'
      className={cn('flex h-full items-center justify-center', className)}
      {...props}
    >
      <div className='flex flex-col items-center gap-3'>
        <Spinner className='h-8 w-8 text-neutral-400 dark:text-neutral-500' />
        <p className='text-sm text-neutral-500 dark:text-neutral-400'>{text}</p>
      </div>
    </div>
  );
}

export { Spinner, SpinnerWithText };
