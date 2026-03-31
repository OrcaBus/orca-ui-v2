'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

function Progress({
  className,
  value,
  max = 100,
  ...props
}: ComponentProps<'div'> & {
  value?: number;
  max?: number;
}) {
  return (
    <div
      data-slot='progress'
      role='progressbar'
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('bg-primary/20 relative h-2 w-full overflow-hidden rounded-full', className)}
      {...props}
    >
      <div
        data-slot='progress-indicator'
        className='bg-primary h-full w-full flex-1 transition-all'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </div>
  );
}

export { Progress };
