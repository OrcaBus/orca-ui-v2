import type { ReactNode } from 'react';
import { Dialog, DialogPanel, DialogTitle, TransitionChild } from '@headlessui/react';
import dayjs from 'dayjs';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { cn } from '@/utils/cn';

interface TimelineDialogFrameProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  actorEmail?: string;
  actorTimestamp?: string;
}

function getActorInitial(actorEmail?: string) {
  return actorEmail?.trim().charAt(0).toUpperCase() || 'U';
}

function formatActorTimestamp(actorTimestamp?: string) {
  if (!actorTimestamp) {
    return dayjs().format('MMM D, YYYY • h:mm A');
  }

  const parsedTimestamp = dayjs(actorTimestamp);
  return parsedTimestamp.isValid()
    ? parsedTimestamp.format('MMM D, YYYY • h:mm A')
    : actorTimestamp;
}

export function TimelineDialogFrame({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  actorEmail,
  actorTimestamp,
}: TimelineDialogFrameProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className='relative z-50'>
      <TransitionChild
        enter='ease-out duration-200'
        enterFrom='opacity-0'
        enterTo='opacity-100'
        leave='ease-in duration-150'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <div className='fixed inset-0 bg-black/50 dark:bg-black/60' aria-hidden='true' />
      </TransitionChild>

      <div className='fixed inset-0 overflow-y-auto p-4'>
        <div className='flex min-h-full items-center justify-center'>
          <TransitionChild
            enter='ease-out duration-200'
            enterFrom='opacity-0 translate-y-3 scale-[0.98]'
            enterTo='opacity-100 translate-y-0 scale-100'
            leave='ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0 scale-100'
            leaveTo='opacity-0 translate-y-3 scale-[0.98]'
          >
            <DialogPanel className='w-full max-w-xl overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'>
              <div className='border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
                <div className='flex items-center justify-between gap-3'>
                  <div className='flex min-w-0 items-center gap-3'>
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                        'bg-blue-50 text-blue-600 dark:bg-[#137fec]/10 dark:text-[#137fec]'
                      )}
                    >
                      {icon}
                    </div>
                    <DialogTitle className='truncate text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                      {title}
                    </DialogTitle>
                  </div>

                  <button
                    type='button'
                    onClick={onClose}
                    className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
                    aria-label='Close dialog'
                  >
                    <X className='h-5 w-5' />
                  </button>
                </div>
              </div>

              <div className='space-y-5 p-6'>
                {(actorEmail || actorTimestamp) && (
                  <div className='flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                    <Avatar className='h-10 w-10'>
                      <AvatarFallback className='bg-blue-100 text-sm font-semibold text-blue-600 dark:bg-[#137fec]/10 dark:text-[#137fec]'>
                        {getActorInitial(actorEmail)}
                      </AvatarFallback>
                    </Avatar>

                    <div className='min-w-0'>
                      {actorEmail && (
                        <div className='truncate text-sm font-medium text-neutral-900 dark:text-slate-100'>
                          {actorEmail}
                        </div>
                      )}
                      <div className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
                        {formatActorTimestamp(actorTimestamp)}
                      </div>
                    </div>
                  </div>
                )}

                {children}
              </div>

              <div className='flex flex-wrap items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                {footer}
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  );
}
