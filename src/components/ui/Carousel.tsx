import { Children, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface CarouselProps {
  children: ReactNode;
  activeIndex?: number | null;
  onActiveIndexChange?: (index: number) => void;
  className?: string;
  viewportClassName?: string;
  containerClassName?: string;
  contentClassName?: string;
  pageControlsClassName?: string;
  previousLabel?: string;
  nextLabel?: string;
  step?: number;
  centerActiveItem?: boolean;
  showPageControls?: boolean;
}

export function Carousel({
  children,
  activeIndex,
  onActiveIndexChange,
  className,
  viewportClassName,
  containerClassName,
  contentClassName,
  pageControlsClassName,
  previousLabel = 'Previous',
  nextLabel = 'Next',
  step,
  centerActiveItem = false,
  showPageControls = true,
}: CarouselProps) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const itemCount = items.length;
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [scrollIndex, setScrollIndex] = useState(0);

  const currentIndex =
    activeIndex == null
      ? scrollIndex
      : Math.min(Math.max(activeIndex, 0), Math.max(itemCount - 1, 0));

  const hasControlledNavigation = activeIndex != null && Boolean(onActiveIndexChange);
  const canNavigatePrev = hasControlledNavigation ? currentIndex > 0 : canScrollPrev;
  const canNavigateNext = hasControlledNavigation ? currentIndex < itemCount - 1 : canScrollNext;

  const scrollItemIntoView = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
    const viewport = viewportRef.current;
    const content = contentRef.current;

    if (!viewport || !content || index < 0) return;

    const item = content.children.item(index) as HTMLElement | null;
    if (!item) return;

    const desiredLeft = item.offsetLeft - (viewport.clientWidth - item.offsetWidth) / 2;
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const left = Math.min(Math.max(desiredLeft, 0), maxLeft);

    viewport.scrollTo({ left, behavior });
  }, []);

  const updateScrollState = useCallback(() => {
    const viewport = viewportRef.current;
    const content = contentRef.current;
    if (!viewport || !content) return;

    setCanScrollPrev(viewport.scrollLeft > 4);
    setCanScrollNext(viewport.scrollLeft + viewport.clientWidth < viewport.scrollWidth - 4);

    if (!content.children.length) {
      setScrollIndex(0);
      return;
    }

    const viewportCenter = viewport.scrollLeft + viewport.clientWidth / 2;
    const children = Array.from(content.children) as HTMLElement[];
    const nearestIndex = children.reduce(
      (nearest, item, index) => {
        const itemCenter = item.offsetLeft + item.offsetWidth / 2;
        const distance = Math.abs(itemCenter - viewportCenter);

        return distance < nearest.distance ? { index, distance } : nearest;
      },
      { index: 0, distance: Number.POSITIVE_INFINITY }
    ).index;

    setScrollIndex(nearestIndex);
  }, []);

  const scrollActiveItemIntoView = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (activeIndex == null) return;
      scrollItemIntoView(activeIndex, behavior);
    },
    [activeIndex, scrollItemIntoView]
  );

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleResize = () => {
      if (centerActiveItem) scrollActiveItemIntoView('auto');
      updateScrollState();
    };

    updateScrollState();

    viewport.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      viewport.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', handleResize);
    };
  }, [centerActiveItem, children, scrollActiveItemIntoView, updateScrollState]);

  useEffect(() => {
    if (!centerActiveItem) return;

    const animationFrame = window.requestAnimationFrame(() => {
      scrollActiveItemIntoView();
      updateScrollState();
    });

    return () => window.cancelAnimationFrame(animationFrame);
  }, [centerActiveItem, children, scrollActiveItemIntoView, updateScrollState]);

  const handleScroll = (direction: 'prev' | 'next') => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (hasControlledNavigation) {
      const nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
      const clampedIndex = Math.min(Math.max(nextIndex, 0), itemCount - 1);

      if (clampedIndex !== currentIndex) {
        onActiveIndexChange?.(clampedIndex);
        scrollItemIntoView(clampedIndex);
      }

      return;
    }

    const fallbackStep = Math.max(viewport.clientWidth * 0.75, 220);
    const left = direction === 'next' ? (step ?? fallbackStep) : -(step ?? fallbackStep);

    viewport.scrollBy({
      left,
      behavior: 'smooth',
    });
  };

  const handlePageControlClick = (index: number) => {
    onActiveIndexChange?.(index);
    scrollItemIntoView(index);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        className={cn(
          'relative rounded-lg bg-neutral-50/60 px-12 py-3 shadow-xs dark:bg-[#161b22]/80',
          containerClassName
        )}
      >
        <button
          type='button'
          onClick={() => handleScroll('prev')}
          disabled={!canNavigatePrev}
          className='absolute top-1/2 left-3 z-10 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-900/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none dark:bg-[#137fec] dark:hover:bg-[#0f6fd1] dark:disabled:bg-[#2d3540] dark:disabled:text-[#6b7785]'
          aria-label={previousLabel}
        >
          <ChevronLeft className='h-5 w-5' />
        </button>

        <div
          ref={viewportRef}
          className={cn(
            'min-w-0 overflow-x-auto scroll-smooth py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            viewportClassName
          )}
        >
          <div ref={contentRef} className={cn('flex w-full gap-3', contentClassName)}>
            {items}
          </div>
        </div>

        <button
          type='button'
          onClick={() => handleScroll('next')}
          disabled={!canNavigateNext}
          className='absolute top-1/2 right-3 z-10 inline-flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-900/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400 disabled:shadow-none dark:bg-[#137fec] dark:hover:bg-[#0f6fd1] dark:disabled:bg-[#2d3540] dark:disabled:text-[#6b7785]'
          aria-label={nextLabel}
        >
          <ChevronRight className='h-5 w-5' />
        </button>
      </div>

      {showPageControls && itemCount > 1 ? (
        <div className={cn('flex items-center justify-center gap-2', pageControlsClassName)}>
          {items.map((_, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={index}
                type='button'
                onClick={() => handlePageControlClick(index)}
                className={cn(
                  'h-2.5 w-2.5 cursor-pointer rounded-full transition-colors',
                  isActive
                    ? 'bg-blue-600 dark:bg-[#137fec]'
                    : 'bg-neutral-300 hover:bg-neutral-400 dark:bg-[#4a5568] dark:hover:bg-[#64748b]'
                )}
                aria-label={`Go to carousel item ${index + 1}`}
                aria-current={isActive ? 'true' : undefined}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
