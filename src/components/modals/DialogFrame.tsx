import type { CSSProperties, ReactNode } from 'react';
import {
  Description as HeadlessDescription,
  DialogBackdrop,
  Dialog as HeadlessDialog,
  DialogPanel,
  DialogTitle,
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
  closeDisabled?: boolean;
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
  closeDisabled = false,
}: DialogFrameProps) {
  return (
    <HeadlessDialog
      open={isOpen}
      onClose={closeDisabled ? () => undefined : onClose}
      className='relative z-60'
    >
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/50 transition-opacity duration-200 ease-out',
          'data-closed:opacity-0 data-leave:duration-150 data-leave:ease-in',
          'dark:bg-black/60',
          overlayClassName
        )}
      />

      <div className='fixed inset-0 z-50 overflow-y-auto p-4'>
        <div className='flex min-h-full items-center justify-center'>
          <DialogPanel
            transition
            className={cn(
              'w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl',
              'transform transition-all duration-200 ease-out',
              'data-closed:translate-y-3 data-closed:scale-[0.98] data-closed:opacity-0',
              'data-leave:duration-150 data-leave:ease-in',
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
                <div
                  className={cn('flex min-w-0 gap-3', description ? 'items-start' : 'items-center')}
                >
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
                        disabled={closeDisabled}
                        onClick={(e) => {
                          if (closeDisabled) return;
                          // Move focus to the body before the portal is marked aria-hidden.
                          // Headless UI restores focus to the opener after the transition.
                          e.currentTarget.blur();
                          onClose();
                        }}
                        className={cn(
                          'rounded-md p-2 text-neutral-600 transition-colors',
                          'hover:bg-neutral-100 hover:text-neutral-900',
                          'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                          'disabled:cursor-not-allowed disabled:opacity-50',
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
        </div>
      </div>
    </HeadlessDialog>
  );
}
