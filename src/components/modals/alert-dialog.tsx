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
} from '@headlessui/react';

import { cn } from '@/utils/cn';
import { buttonVariants } from '../ui/button-variants';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContextInternal = createContext<AlertDialogContextValue>({
  open: false,
  setOpen: () => {},
});

function AlertDialog({
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
    <AlertDialogContextInternal.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContextInternal.Provider>
  );
}

function AlertDialogTrigger({
  children,
  asChild,
  onClick,
  ...props
}: ComponentProps<'button'> & { asChild?: boolean }) {
  const { setOpen } = useContext(AlertDialogContextInternal);

  if (asChild && isValidElement(children)) {
    return cloneElement(children as ReactElement<Record<string, unknown>>, {
      onClick: (e: MouseEvent) => {
        (children as ReactElement<{ onClick?: (e: MouseEvent) => void }>).props.onClick?.(e);
        onClick?.(e as MouseEvent<HTMLButtonElement>);
        setOpen(true);
      },
      'data-slot': 'alert-dialog-trigger',
      ...props,
    });
  }

  return (
    <button
      data-slot='alert-dialog-trigger'
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

function AlertDialogPortal({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function AlertDialogOverlay({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-overlay'
      className={cn('fixed inset-0 z-50 bg-black/50', className)}
      aria-hidden='true'
      {...props}
    />
  );
}

function AlertDialogContent({ className, children, ...props }: ComponentProps<'div'>) {
  const { open } = useContext(AlertDialogContextInternal);

  return (
    <Transition show={open}>
      <HeadlessDialog
        onClose={() => {
          /* Alert dialogs should not close on overlay click */
        }}
        className='relative z-50'
      >
        <TransitionChild
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <AlertDialogOverlay />
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
              data-slot='alert-dialog-content'
              className={cn(
                'bg-background grid w-full max-w-[calc(100%-2rem)] gap-4 rounded-lg border p-6 shadow-lg sm:max-w-lg',
                className
              )}
              {...(props as Record<string, unknown>)}
            >
              {children}
            </DialogPanel>
          </TransitionChild>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-header'
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='alert-dialog-footer'
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  );
}

function AlertDialogTitle({ className, ...props }: ComponentProps<'h2'>) {
  return (
    <HeadlessDialogTitle
      data-slot='alert-dialog-title'
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <HeadlessDescription
      data-slot='alert-dialog-description'
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

function AlertDialogAction({ className, onClick, ...props }: ComponentProps<'button'>) {
  const { setOpen } = useContext(AlertDialogContextInternal);
  return (
    <button
      className={cn(buttonVariants(), className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

function AlertDialogCancel({ className, onClick, ...props }: ComponentProps<'button'>) {
  const { setOpen } = useContext(AlertDialogContextInternal);
  return (
    <button
      className={cn(buttonVariants({ variant: 'outline' }), className)}
      onClick={(e) => {
        onClick?.(e);
        setOpen(false);
      }}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
