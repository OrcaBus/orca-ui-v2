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

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContextInternal = createContext<DialogContextValue>({
  open: false,
  setOpen: () => {},
});

function Dialog({
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  modal?: boolean;
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
    <DialogContextInternal.Provider value={{ open, setOpen }}>
      {children}
    </DialogContextInternal.Provider>
  );
}

function DialogTrigger({
  children,
  asChild,
  onClick,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useContext(DialogContextInternal);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: (e: MouseEvent) => {
        (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        setOpen(true);
      },
      'data-slot': 'dialog-trigger',
      ...props,
    });
  }

  return (
    <button
      data-slot='dialog-trigger'
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

function DialogPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function DialogClose({
  children,
  asChild,
  onClick,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useContext(DialogContextInternal);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: (e: MouseEvent) => {
        (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        setOpen(false);
      },
      'data-slot': 'dialog-close',
      ...props,
    });
  }

  return (
    <button
      data-slot='dialog-close'
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

function DialogOverlay({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-overlay'
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      aria-hidden='true'
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }: ComponentProps<'div'>) {
  const { open, setOpen } = useContext(DialogContextInternal);

  return (
    <Transition show={open}>
      <HeadlessDialog onClose={() => setOpen(false)} className='relative z-50'>
        <TransitionChild
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <DialogOverlay />
        </TransitionChild>
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <TransitionChild
            enter='ease-out duration-200'
            enterFrom='opacity-0 scale-95'
            enterTo='opacity-100 scale-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100 scale-100'
            leaveTo='opacity-0 scale-95'
          >
            <DialogPanel
              data-slot='dialog-content'
              className={cn(
                'bg-background grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
                className
              )}
              {...(props as Record<string, unknown>)}
            >
              {children}
              <CloseButton className="ring-offset-background focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                <XIcon />
                <span className='sr-only'>Close</span>
              </CloseButton>
            </DialogPanel>
          </TransitionChild>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='dialog-footer'
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <HeadlessDialogTitle
      data-slot='dialog-title'
      className={cn('text-lg leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <HeadlessDescription
      data-slot='dialog-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
