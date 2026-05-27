import type { ReactNode } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { formatActorTimestamp, getActorInitial } from './timeline.utils';

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
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      icon={icon}
      size='lg'
      footer={footer}
    >
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
    </DialogFrame>
  );
}
