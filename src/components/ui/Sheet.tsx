'use client';

import {
  cloneElement,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useState,
  type ComponentProps,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import {
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle as HeadlessDialogTitle,
  Description as HeadlessDescription,
  Transition,
  TransitionChild,
  CloseButton,
} from '@headlessui/react';
import { XIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContextInternal = createContext<SheetContextValue>({
  open: false,
  setOpen: () => {},
});

function Sheet({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <SheetContextInternal.Provider value={{ open, setOpen }}>
      {children}
    </SheetContextInternal.Provider>
  );
}

function SheetTrigger({
  children,
  asChild,
  onClick,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useContext(SheetContextInternal);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: (e: MouseEvent) => {
        (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        setOpen(true);
      },
      'data-slot': 'sheet-trigger',
      ...props,
    });
  }

  return (
    <button
      data-slot='sheet-trigger'
      onClick={(e) => {
        onClick?.(e);
        setOpen(true);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetClose({
  children,
  asChild,
  onClick,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useContext(SheetContextInternal);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: (e: MouseEvent) => {
        (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        setOpen(false);
      },
      'data-slot': 'sheet-close',
      ...props,
    });
  }

  return (
    <button
      data-slot='sheet-close'
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    >
      {children}
    </button>
  );
}

function SheetOverlay({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-overlay'
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      aria-hidden='true'
      {...props}
    />
  );
}

const slideTransitions = {
  right: {
    enterFrom: 'translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: 'translate-x-full',
  },
  left: {
    enterFrom: '-translate-x-full',
    enterTo: 'translate-x-0',
    leaveFrom: 'translate-x-0',
    leaveTo: '-translate-x-full',
  },
  top: {
    enterFrom: '-translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: '-translate-y-full',
  },
  bottom: {
    enterFrom: 'translate-y-full',
    enterTo: 'translate-y-0',
    leaveFrom: 'translate-y-0',
    leaveTo: 'translate-y-full',
  },
};

function SheetContent({
  className,
  children,
  side = 'right',
  ...props
}: ComponentProps<'div'> & {
  side?: 'top' | 'right' | 'bottom' | 'left';
}) {
  const { open, setOpen } = useContext(SheetContextInternal);
  const transition = slideTransitions[side];

  return (
    <Transition show={open}>
      <HeadlessDialog onClose={() => setOpen(false)} className='relative z-50'>
        <TransitionChild
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-300'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <SheetOverlay />
        </TransitionChild>
        <div className='fixed inset-0 z-50'>
          <TransitionChild
            enter='transform transition ease-in-out duration-500'
            enterFrom={transition.enterFrom}
            enterTo={transition.enterTo}
            leave='transform transition ease-in-out duration-300'
            leaveFrom={transition.leaveFrom}
            leaveTo={transition.leaveTo}
          >
            <DialogPanel
              data-slot='sheet-content'
              className={cn(
                'bg-background fixed z-50 flex flex-col gap-4 shadow-lg',
                side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
                side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
                side === 'top' && 'inset-x-0 top-0 h-auto border-b',
                side === 'bottom' && 'inset-x-0 bottom-0 h-auto border-t',
                className
              )}
              {...(props as Record<string, unknown>)}
            >
              {children}
              <CloseButton className='ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none'>
                <XIcon className='size-4' />
                <span className='sr-only'>Close</span>
              </CloseButton>
            </DialogPanel>
          </TransitionChild>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-header'
      className={cn('flex flex-col gap-1.5 p-4', className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='sheet-footer'
      className={cn('mt-auto flex flex-col gap-2 p-4', className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <HeadlessDialogTitle
      data-slot='sheet-title'
      className={cn('text-foreground font-semibold', className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <HeadlessDescription
      data-slot='sheet-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
