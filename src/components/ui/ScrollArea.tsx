'use client';

import type { ComponentProps } from 'react';

import { cn } from '@/utils/cn';

function ScrollArea({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div data-slot='scroll-area' className={cn('relative overflow-hidden', className)} {...props}>
      <div
        data-slot='scroll-area-viewport'
        className='focus-visible:ring-ring/50 size-full overflow-auto rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1'
      >
        {children}
      </div>
    </div>
  );
}

// API stub - accepts props for compatibility but renders nothing
function ScrollBar(_props: ComponentProps<'div'> & { orientation?: 'vertical' | 'horizontal' }) {
  return null;
}

export { ScrollArea, ScrollBar };
