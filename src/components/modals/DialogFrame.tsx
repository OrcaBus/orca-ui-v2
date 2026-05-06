import { Fragment, type CSSProperties, type ReactNode } from 'react';
import {
  Description as HeadlessDescription,
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type DialogFrameSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  titleAdornment?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  size?: DialogFrameSize;
  closeLabel?: string;
  showCloseButton?: boolean;
  overlayClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeClassName: Record<DialogFrameSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-xl',
  xl: 'max-w-2xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-5xl',
};

export function DialogFrame({
  isOpen,
  onClose,
  title,
  children,
  description,
  icon,
  titleAdornment,
  headerActions,
  footer,
  size = 'md',
  closeLabel = 'Close dialog',
  showCloseButton = true,
  overlayClassName,
  panelClassName,
  panelStyle,
  headerClassName,
  bodyClassName,
  footerClassName,
}: DialogFrameProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <HeadlessDialog as='div' onClose={onClose} className='relative z-50'>
        <TransitionChild
          as={Fragment}
          enter='ease-out duration-200'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-150'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div
            className={cn('fixed inset-0 bg-black/50 dark:bg-black/60', overlayClassName)}
            aria-hidden='true'
          />
        </TransitionChild>

        <div className='fixed inset-0 z-50 overflow-y-auto p-4'>
          <div className='flex min-h-full items-center justify-center'>
            <TransitionChild
              as={Fragment}
              enter='ease-out duration-200'
              enterFrom='opacity-0 translate-y-3 scale-[0.98]'
              enterTo='opacity-100 translate-y-0 scale-100'
              leave='ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0 scale-100'
              leaveTo='opacity-0 translate-y-3 scale-[0.98]'
            >
              <DialogPanel
                className={cn(
                  'w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl',
                  'dark:border-[#2d3540] dark:bg-[#111418]',
                  sizeClassName[size],
                  panelClassName
                )}
                style={panelStyle}
              >
                <div
                  className={cn(
                    'border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]',
                    headerClassName
                  )}
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 items-start gap-3'>
                      {icon && (
                        <div
                          className={cn(
                            'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                            'bg-blue-50 text-blue-600 dark:bg-[#137fec]/10 dark:text-[#137fec]'
                          )}
                        >
                          {icon}
                        </div>
                      )}

                      <div className='min-w-0'>
                        <div className='flex min-w-0 flex-wrap items-center gap-2'>
                          <DialogTitle className='truncate text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                            {title}
                          </DialogTitle>
                          {titleAdornment}
                        </div>

                        {description && (
                          <HeadlessDescription className='mt-0.5 text-sm leading-relaxed text-neutral-500 dark:text-[#9dabb9]'>
                            {description}
                          </HeadlessDescription>
                        )}
                      </div>
                    </div>

                    {(headerActions || showCloseButton) && (
                      <div className='flex shrink-0 items-center gap-2'>
                        {headerActions}
                        {showCloseButton && (
                          <button
                            type='button'
                            onClick={onClose}
                            className={cn(
                              'rounded-md p-2 text-neutral-600 transition-colors',
                              'hover:bg-neutral-100 hover:text-neutral-900',
                              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              'dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
                            )}
                            aria-label={closeLabel}
                          >
                            <X className='h-5 w-5' />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={cn('space-y-5 p-6', bodyClassName)}>{children}</div>

                {footer && (
                  <div
                    className={cn(
                      'flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4',
                      'dark:border-[#2d3540] dark:bg-[#1e252e]',
                      footerClassName
                    )}
                  >
                    {footer}
                  </div>
                )}
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </HeadlessDialog>
    </Transition>
  );
}
