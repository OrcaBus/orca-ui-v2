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

// ─── Types ───────────────────────────────────────────────────────────────────

type Side = 'top' | 'right' | 'bottom' | 'left';
type Align = 'start' | 'center' | 'end';

/** Visual style of the tooltip bubble. */
export type TooltipVariant = 'dark' | 'light';

/** Size of the tooltip bubble. */
export type TooltipSize = 'sm' | 'md' | 'lg';

// ─── Variant / size styles ────────────────────────────────────────────────────

const variantClasses: Record<TooltipVariant, string> = {
  dark: 'bg-slate-900 text-white shadow-md dark:bg-slate-100 dark:text-slate-900',
  light:
    'bg-white text-slate-700 border border-slate-200 shadow-md dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
};

const sizeClasses: Record<TooltipSize, string> = {
  sm: 'text-xs px-2 py-1 max-w-xs',
  md: 'text-xs px-3 py-1.5 max-w-sm',
  lg: 'text-sm px-4 py-2 max-w-md',
};

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TooltipProviderContextValue {
  delayDuration: number;
  variant: TooltipVariant;
  size: TooltipSize;
}

const TooltipProviderContext = createContext<TooltipProviderContextValue>({
  delayDuration: 200,
  variant: 'dark',
  size: 'md',
});

function TooltipProvider({
  delayDuration = 200,
  variant = 'dark',
  size = 'md',
  children,
}: {
  delayDuration?: number;
  variant?: TooltipVariant;
  size?: TooltipSize;
  children: ReactNode;
}) {
  const value = useMemo(() => ({ delayDuration, variant, size }), [delayDuration, variant, size]);
  return (
    <TooltipProviderContext.Provider value={value}>{children}</TooltipProviderContext.Provider>
  );
}

// ─── Context ──────────────────────────────────────────────────────────────────

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

// ─── Tooltip root ─────────────────────────────────────────────────────────────

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
  /** Override the provider delay for this tooltip. */
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

// ─── Trigger ──────────────────────────────────────────────────────────────────

function TooltipTrigger({
  asChild,
  children,
  ...props
}: { asChild?: boolean; children: ReactNode } & ComponentProps<'button'>) {
  const { setOpen, triggerRef, delayDuration } = useTooltipContext();
  const openTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Set when a pointer press dismisses the tooltip. It suppresses the focus that
  // the same click puts on the trigger — and any later focus restored to it (e.g.
  // when a dialog opened from the trigger closes) — from re-opening the tooltip.
  // Cleared on a fresh pointer-enter so hovering still works afterwards.
  const dismissedByPointerRef = useRef(false);

  const handleOpen = useCallback(() => {
    clearTimeout(openTimerRef.current);
    openTimerRef.current =
      delayDuration > 0
        ? setTimeout(() => setOpen(true), delayDuration)
        : (setOpen(true), undefined);
  }, [setOpen, delayDuration]);

  const handleClose = useCallback(() => {
    clearTimeout(openTimerRef.current);
    setOpen(false);
  }, [setOpen]);

  const handlePointerEnter = useCallback(() => {
    dismissedByPointerRef.current = false;
    handleOpen();
  }, [handleOpen]);

  const handlePointerDown = useCallback(() => {
    dismissedByPointerRef.current = true;
    handleClose();
  }, [handleClose]);

  const handleFocus = useCallback(() => {
    // Ignore focus that follows a pointer dismissal (click, or focus restored
    // after a dialog opened from this trigger closes). Keyboard focus is not
    // preceded by a pointer press, so it still opens the tooltip.
    if (dismissedByPointerRef.current) return;
    handleOpen();
  }, [handleOpen]);

  useEffect(() => () => clearTimeout(openTimerRef.current), []);

  const interactionProps = {
    onPointerEnter: handlePointerEnter,
    onMouseLeave: handleClose,
    onPointerDown: handlePointerDown,
    onFocus: handleFocus,
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

// ─── Positioning logic ────────────────────────────────────────────────────────

function computePosition(
  triggerRect: DOMRect,
  floatingRect: { width: number; height: number },
  side: Side,
  align: Align,
  sideOffset: number
): { top: number; left: number; actualSide: Side; arrowX: number; arrowY: number } {
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
  let top = preferred.t;
  let left = preferred.l;
  let actualSide = side;

  const fits = (t: number, l: number) =>
    t >= 0 && l >= 0 && t + floatingRect.height <= vh && l + floatingRect.width <= vw;

  if (!fits(top, left)) {
    const opposite: Record<Side, Side> = {
      top: 'bottom',
      bottom: 'top',
      left: 'right',
      right: 'left',
    };
    const fallback = positionsMap[opposite[side]]();
    if (fits(fallback.t, fallback.l)) {
      top = fallback.t;
      left = fallback.l;
      actualSide = opposite[side];
    }
  }

  if (align === 'start') {
    if (actualSide === 'top' || actualSide === 'bottom') left = triggerRect.left;
    else top = triggerRect.top;
  } else if (align === 'end') {
    if (actualSide === 'top' || actualSide === 'bottom')
      left = triggerRect.right - floatingRect.width;
    else top = triggerRect.bottom - floatingRect.height;
  }

  const finalTop = Math.max(4, Math.min(top, vh - floatingRect.height - 4));
  const finalLeft = Math.max(4, Math.min(left, vw - floatingRect.width - 4));

  // Arrow center offset relative to the tooltip's top-left corner
  const arrowX = Math.max(
    8,
    Math.min(triggerRect.left + triggerRect.width / 2 - finalLeft, floatingRect.width - 8)
  );
  const arrowY = Math.max(
    8,
    Math.min(triggerRect.top + triggerRect.height / 2 - finalTop, floatingRect.height - 8)
  );

  return { top: finalTop, left: finalLeft, actualSide, arrowX, arrowY };
}

// ─── Content ──────────────────────────────────────────────────────────────────

function TooltipContent({
  className,
  sideOffset = 8,
  side = 'top',
  align = 'center',
  showArrow = true,
  variant,
  size,
  children,
  hidden: hiddenProp,
  ...props
}: ComponentProps<'div'> & {
  sideOffset?: number;
  side?: Side;
  align?: Align;
  /** Whether to render the tooltip arrow. */
  showArrow?: boolean;
  /** Override the provider variant. */
  variant?: TooltipVariant;
  /** Override the provider size. */
  size?: TooltipSize;
}) {
  const { open, triggerRef } = useTooltipContext();
  const providerCtx = useContext(TooltipProviderContext);
  const resolvedVariant = variant ?? providerCtx.variant;
  const resolvedSize = size ?? providerCtx.size;

  const floatingRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{
    top: number;
    left: number;
    actualSide: Side;
    arrowX: number;
    arrowY: number;
  } | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;
    setPos(
      computePosition(
        trigger.getBoundingClientRect(),
        floating.getBoundingClientRect(),
        side,
        align,
        sideOffset
      )
    );
  }, [side, align, sideOffset, triggerRef]);

  useEffect(() => {
    if (!open || hiddenProp) return;
    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      setPos(null); // reset on close so next open always animates in from scratch
    };
  }, [open, hiddenProp, updatePosition]);

  const isVisible = open && !hiddenProp && pos !== null;
  const actualSide = pos?.actualSide ?? side;

  // Arrow: a rotated square. After 45° clockwise rotation:
  //   border-t → top-right face (tip → right vertex)
  //   border-l → top-left face  (left vertex → tip)
  //   border-b → bottom-left face
  //   border-r → bottom-right face
  // For each side, only the two faces of the *visible* triangle need borders.
  const arrowSize = 10;
  const arrowHalf = arrowSize / 2;
  const arrowStyle = {
    position: 'absolute' as const,
    width: arrowSize,
    height: arrowSize,
    transform: 'rotate(45deg)',
    ...(actualSide === 'top' || actualSide === 'bottom'
      ? { left: (pos?.arrowX ?? 0) - arrowHalf }
      : { top: (pos?.arrowY ?? 0) - arrowHalf }),
    ...(actualSide === 'bottom' && { top: -arrowHalf }),
    ...(actualSide === 'top' && { bottom: -arrowHalf }),
    ...(actualSide === 'right' && { left: -arrowHalf }),
    ...(actualSide === 'left' && { right: -arrowHalf }),
  };
  const arrowClasses =
    resolvedVariant === 'dark'
      ? 'bg-slate-900 dark:bg-slate-100'
      : cn(
          'bg-white dark:bg-slate-800',
          // border-l = top-left face, border-t = top-right face → both visible when tip points UP
          actualSide === 'bottom' && 'border-l border-t border-slate-200 dark:border-slate-700',
          // border-r = bottom-right face, border-b = bottom-left face → both visible when tip points DOWN
          actualSide === 'top' && 'border-r border-b border-slate-200 dark:border-slate-700',
          // border-l = top-left face, border-b = bottom-left face → both visible when tip points LEFT
          actualSide === 'right' && 'border-l border-b border-slate-200 dark:border-slate-700',
          // border-t = top-right face, border-r = bottom-right face → both visible when tip points RIGHT
          actualSide === 'left' && 'border-t border-r border-slate-200 dark:border-slate-700'
        );

  // The wrapper is the positioning/transition container (no bg).
  // The card is a separate inner div with bg/border/shadow.
  // Arrow renders first → card (later in DOM) paints on top and covers arrow's inner half.
  return createPortal(
    <div
      ref={floatingRef}
      style={{
        position: 'fixed',
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        zIndex: isVisible ? 50 : -1,
        pointerEvents: 'none',
      }}
      className={cn(
        'transition duration-150 ease-out',
        isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      )}
    >
      {showArrow && <span aria-hidden style={arrowStyle} className={arrowClasses} />}
      <div
        data-slot='tooltip-content'
        data-side={actualSide}
        role='tooltip'
        className={cn(
          'rounded-md leading-normal',
          variantClasses[resolvedVariant],
          sizeClasses[resolvedSize],
          className
        )}
        {...props}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
export type { Side as TooltipSide, Align as TooltipAlign };
