import type { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InfoDrawerActionCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  onClick: () => void;
  icon?: ReactNode;
  buttonIcon?: ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const buttonClassName = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90 disabled:hover:bg-primary',
  secondary:
    'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:hover:bg-[#2d3540]',
};

export function InfoDrawerActionCard({
  title,
  description,
  buttonLabel,
  onClick,
  icon,
  buttonIcon,
  variant = 'primary',
  disabled = false,
}: InfoDrawerActionCardProps) {
  return (
    <article className='rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-[#2d3540] dark:bg-[#1a2029]'>
      <div className='flex items-start gap-3'>
        {icon && (
          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-slate-500 shadow-sm dark:bg-[#111418] dark:text-[#9dabb9]'>
            {icon}
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <h4 className='text-sm font-semibold text-slate-900 dark:text-white'>{title}</h4>
          <p className='mt-1 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
            {description}
          </p>
        </div>
      </div>

      <button
        type='button'
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'mt-4 flex w-full items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
          buttonClassName[variant]
        )}
      >
        {buttonIcon}
        {buttonLabel}
      </button>
    </article>
  );
}
