'use client';

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/cn';
import { composeRefs } from './compose-refs';

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

interface TooltipProviderProps {
  delayDuration?: number;
  children: ReactNode;
}

interface TooltipProviderContextValue {
  delayDuration: number;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue>({
  delayDuration: 0,
});

function TooltipProvider({ delayDuration = 0, children }: TooltipProviderProps) {
  const value = useMemo(() => ({ delayDuration }), [delayDuration]);
  return (
    <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>
  );
}

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLElement | null>;
  delayDuration: number;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

function useTooltipContext() {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error('Tooltip compound components must be used within <Tooltip>');
  return ctx;
}

function Tooltip({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  delayDuration,
}: {
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
}) {
  const providerCtx = useContext(TooltipProviderContext);
  const delay = delayDuration ?? providerCtx.delayDuration;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      setUncontrolledOpen(value);
      onOpenChange?.(value);
    },
    [onOpenChange]
  );

  const triggerRef = useRef<HTMLElement | null>(null);

  const value = useMemo(
    () => ({ open, setOpen, triggerRef, delayDuration: delay }),
    [open, setOpen, delay]
  );

  return <TooltipContext.Provider value={value}>{children}</TooltipContext.Provider>;
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: { asChild?: boolean; children: ReactNode } & ComponentProps<'button'>) {
  const { setOpen, triggerRef, delayDuration } = useTooltipContext();
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleOpen = useCallback(() => {
    clearTimeout(openTimerRef.current);
    if (delayDuration > 0) {
      openTimerRef.current = setTimeout(() => setOpen(true), delayDuration);
    } else {
      setOpen(true);
    }
  }, [setOpen, delayDuration]);

  const handleClose = useCallback(() => {
    clearTimeout(openTimerRef.current);
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    return () => clearTimeout(openTimerRef.current);
  }, []);

  const interactionProps = {
    onMouseEnter: handleOpen,
    onMouseLeave: handleClose,
    onFocus: handleOpen,
    onBlur: handleClose,
  };

  const childRef = isValidElement(children)
    ? (children as ReactElement & { ref?: Ref<unknown> }).ref
    : undefined;
  // eslint-disable-next-line react-hooks/refs -- composeRefs returns callback ref invoked in commit phase
  const mergedRef = composeRefs(triggerRef, childRef);

  if (asChild && isValidElement(children)) {
    // eslint-disable-next-line react-hooks/refs -- mergedRef is callback ref, not read during render
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      ref: mergedRef,
      'data-slot': 'tooltip-trigger',
      ...interactionProps,
      ...props,
    });
  }

  return (
    <button
      ref={triggerRef as Ref<HTMLButtonElement>}
      data-slot='tooltip-trigger'
      {...interactionProps}
      {...props}
    >
      {children}
    </button>
  );
}

function computePosition(
  triggerRect: DOMRect,
  floatingRect: { width: number; height: number },
  side: Side,
  align: Align,
  sideOffset: number
): { top: number; left: number; actualSide: Side } {
  let top: number;
  let left: number;

  const gap = sideOffset;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const positionsMap: Record<Side, () => { t: number; l: number }> = {
    top: () => ({
      t: triggerRect.top - floatingRect.height - gap,
      l: triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2,
    }),
    bottom: () => ({
      t: triggerRect.bottom + gap,
      l: triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2,
    }),
    left: () => ({
      t: triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2,
      l: triggerRect.left - floatingRect.width - gap,
    }),
    right: () => ({
      t: triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2,
      l: triggerRect.right + gap,
    }),
  };

  const preferred = positionsMap[side]();
  top = preferred.t;
  left = preferred.l;

  let actualSideResult = side;

  const fitsPreferred =
    top >= 0 && left >= 0 && top + floatingRect.height <= vh && left + floatingRect.width <= vw;

  if (!fitsPreferred) {
    const opposite: Record<Side, Side> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    const fallback = positionsMap[opposite[side]]();
    const fitsFallback =
      fallback.t >= 0 &&
      fallback.l >= 0 &&
      fallback.t + floatingRect.height <= vh &&
      fallback.l + floatingRect.width <= vw;

    if (fitsFallback) {
      top = fallback.t;
      left = fallback.l;
      actualSideResult = opposite[side];
    }
  }

  if (align === 'start') {
    if (actualSideResult === 'top' || actualSideResult === 'bottom') {
      left = triggerRect.left;
    } else {
      top = triggerRect.top;
    }
  } else if (align === 'end') {
    if (actualSideResult === 'top' || actualSideResult === 'bottom') {
      left = triggerRect.right - floatingRect.width;
    } else {
      top = triggerRect.bottom - floatingRect.height;
    }
  }

  top = Math.max(4, Math.min(top, vh - floatingRect.height - 4));
  left = Math.max(4, Math.min(left, vw - floatingRect.width - 4));

  return { top, left, actualSide: actualSideResult };
}

const sideAnimationClasses: Record<Side, string> = {
  top: 'slide-in-from-bottom-1',
  bottom: 'slide-in-from-top-1',
  left: 'slide-in-from-right-1',
  right: 'slide-in-from-left-1',
};

function TooltipContent({
  className,
  sideOffset = 6,
  side = 'top',
  align = 'center',
  children,
  hidden: hiddenProp,
  ...props
}: ComponentProps<'div'> & {
  sideOffset?: number;
  side?: Side;
  align?: Align;
}) {
  const { open, triggerRef } = useTooltipContext();
  const floatingRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    actualSide: Side;
  } | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;

    const triggerRect = trigger.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();

    setPos(computePosition(triggerRect, floatingRect, side, align, sideOffset));
  }, [side, align, sideOffset, triggerRef]);

  useEffect(() => {
    if (!open || hiddenProp) return;
    updatePosition();

    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, hiddenProp, updatePosition]);

  if (!open || hiddenProp) return null;

  const slideClass = pos ? sideAnimationClasses[pos.actualSide] : '';

  return createPortal(
    <div
      ref={floatingRef}
      data-slot='tooltip-content'
      data-side={pos?.actualSide ?? side}
      role='tooltip'
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: 50,
        visibility: pos ? 'visible' : 'hidden',
      }}
      className={cn(
        'w-fit max-w-xs rounded-md px-3 py-1.5 text-xs leading-normal text-balance',
        'bg-slate-900 text-white shadow-md',
        'dark:bg-slate-100 dark:text-slate-900 dark:shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        slideClass,
        'duration-150',
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
