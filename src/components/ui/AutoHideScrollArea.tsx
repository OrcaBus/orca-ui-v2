import { useEffect, useRef, type ComponentPropsWithoutRef, type UIEvent } from 'react';

import { cn } from '@/utils/cn';

const SCROLL_IDLE_DELAY_MS = 800;

interface AutoHideScrollAreaProps extends ComponentPropsWithoutRef<'div'> {
  'aria-label': string;
}

export function AutoHideScrollArea({
  className,
  onScroll,
  role = 'region',
  tabIndex = 0,
  ...props
}: AutoHideScrollAreaProps) {
  const scrollIdleTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (scrollIdleTimerRef.current !== null) {
        window.clearTimeout(scrollIdleTimerRef.current);
      }
    },
    []
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const scrollArea = event.currentTarget;
    scrollArea.dataset.scrolling = 'true';

    if (scrollIdleTimerRef.current !== null) {
      window.clearTimeout(scrollIdleTimerRef.current);
    }

    scrollIdleTimerRef.current = window.setTimeout(() => {
      delete scrollArea.dataset.scrolling;
      scrollIdleTimerRef.current = null;
    }, SCROLL_IDLE_DELAY_MS);

    onScroll?.(event);
  };

  return (
    <div
      role={role}
      tabIndex={tabIndex}
      className={cn('scrollbar-auto-hide scrollbar-thin', className)}
      onScroll={handleScroll}
      {...props}
    />
  );
}
