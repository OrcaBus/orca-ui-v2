import type { CSSProperties, ReactNode } from 'react';
import {
  Description as HeadlessDescription,
  Dialog as HeadlessDialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

export type DrawerFrameSide = 'left' | 'right';
export type DrawerFrameSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DrawerFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  titleAdornment?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  side?: DrawerFrameSide;
  size?: DrawerFrameSize;
  closeLabel?: string;
  showCloseButton?: boolean;
  overlayClassName?: string;
  containerClassName?: string;
  panelClassName?: string;
  panelStyle?: CSSProperties;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeClassName: Record<DrawerFrameSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  full: 'max-w-5xl',
};

const sideContainerClassName: Record<DrawerFrameSide, string> = {
  left: 'left-0 pr-10 sm:pr-16',
  right: 'right-0 pl-10 sm:pl-16',
};

const sidePanelClassName: Record<DrawerFrameSide, string> = {
  left: 'border-r data-closed:-translate-x-full',
  right: 'border-l data-closed:translate-x-full',
};

export function DrawerFrame({
  isOpen,
  onClose,
  title,
  children,
  subtitle,
  description,
  icon,
  titleAdornment,
  headerActions,
  footer,
  side = 'right',
  size = 'lg',
  closeLabel = 'Close drawer',
  showCloseButton = true,
  overlayClassName,
  containerClassName,
  panelClassName,
  panelStyle,
  headerClassName,
  bodyClassName,
  footerClassName,
}: DrawerFrameProps) {
  const supportingText = subtitle ?? description;

  return (
    <HeadlessDialog open={isOpen} onClose={onClose} className='relative z-50'>
      <DialogBackdrop
        transition
        className={cn(
          'fixed inset-0 bg-black/30 transition-opacity duration-200 ease-out',
          'data-closed:opacity-0 data-leave:duration-150 data-leave:ease-in',
          'dark:bg-black/50',
          overlayClassName
        )}
      />

      <div
        className={cn(
          'pointer-events-none fixed inset-y-0 flex max-w-full',
          sideContainerClassName[side],
          containerClassName
        )}
      >
        <DialogPanel
          transition
          className={cn(
            'pointer-events-auto flex h-full w-screen transform flex-col bg-white shadow-2xl',
            'border-neutral-200 transition-all duration-300 ease-in-out',
            'data-leave:duration-200 data-leave:ease-in',
            'dark:border-[#2d3540] dark:bg-[#111418]',
            sizeClassName[size],
            sidePanelClassName[side],
            panelClassName
          )}
          style={panelStyle}
        >
          <div
            className={cn(
              'flex shrink-0 items-start justify-between gap-3 border-b border-neutral-200 px-6 py-4',
              'dark:border-[#2d3540]',
              headerClassName
            )}
          >
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

                {supportingText && (
                  <HeadlessDescription className='mt-1 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400'>
                    {supportingText}
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
                    onClick={(e) => {
                      // By calling e.currentTarget.blur() before onClose(), focus moves to <body> before the portal is marked aria-hidden.  Headless UI separately tracks the opener element and restores focus to it after the transition finishes, so focus return still works correctly.
                      e.currentTarget.blur();
                      onClose();
                    }}
                    className={cn(
                      'rounded-lg p-2 text-neutral-400 transition-colors',
                      'hover:bg-neutral-100 hover:text-neutral-600',
                      'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                      'dark:hover:bg-[#1e252e] dark:hover:text-neutral-200'
                    )}
                    aria-label={closeLabel}
                  >
                    <X className='h-5 w-5' />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-5', bodyClassName)}>
            {children}
          </div>

          {footer && (
            <div
              className={cn(
                'shrink-0 border-t border-neutral-200 bg-neutral-50 px-6 py-4',
                'dark:border-[#2d3540] dark:bg-[#1e252e]',
                footerClassName
              )}
            >
              {footer}
            </div>
          )}
        </DialogPanel>
      </div>
    </HeadlessDialog>
  );
}
