import { X } from 'lucide-react';
import { ReactNode } from 'react';

export type PillTagVariant = 'blue' | 'green' | 'purple' | 'amber' | 'neutral' | 'red';

export interface PillTagProps {
  children: ReactNode;
  variant?: PillTagVariant;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function PillTag({ children, variant = 'neutral', onRemove, size = 'sm' }: PillTagProps) {
  const variants: Record<PillTagVariant, string> = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    green:
      'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
    amber:
      'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    neutral:
      'bg-neutral-100 text-neutral-700 border-neutral-200 dark:bg-[#1e252e] dark:text-[#9dabb9] dark:border-[#2d3540]',
    purple:
      'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20',
    red: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${variants[variant]} ${sizes[size]}`}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className='rounded-full p-0.5 transition-colors hover:bg-black/10 dark:hover:bg-white/10'
        >
          <X className='h-3 w-3' />
        </button>
      )}
    </span>
  );
}
