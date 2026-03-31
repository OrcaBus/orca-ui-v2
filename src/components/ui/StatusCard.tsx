import { ReactNode } from 'react';

interface StatusCardProps {
  label: string;
  value: number;
  percentage?: number;
  icon?: ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'neutral' | 'info';
  selected?: boolean;
  onClick?: () => void;
}

export function StatusCard({
  label,
  value,
  percentage,
  icon,
  variant = 'neutral',
  selected = false,
  onClick,
}: StatusCardProps) {
  const variantClasses = {
    success: selected
      ? 'border-green-600 bg-green-50 shadow-md dark:border-green-500 dark:bg-green-500/10 dark:shadow-green-500/10'
      : 'border-neutral-200 bg-white hover:border-green-400 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-green-500/40',
    error: selected
      ? 'border-red-600 bg-red-50 shadow-md dark:border-red-500 dark:bg-red-500/10 dark:shadow-red-500/10'
      : 'border-neutral-200 bg-white hover:border-red-400 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-red-500/40',
    warning: selected
      ? 'border-amber-600 bg-amber-50 shadow-md dark:border-amber-500 dark:bg-amber-500/10 dark:shadow-amber-500/10'
      : 'border-neutral-200 bg-white hover:border-amber-400 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-amber-500/40',
    neutral: selected
      ? 'border-neutral-600 bg-neutral-50 shadow-md dark:border-[#9dabb9] dark:bg-[#1e252e] dark:shadow-none'
      : 'border-neutral-200 bg-white hover:border-neutral-400 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-[#9dabb9]/40',
    info: selected
      ? 'border-blue-600 bg-blue-50 shadow-md dark:border-[#137fec] dark:bg-[#137fec]/10 dark:shadow-[#137fec]/10'
      : 'border-neutral-200 bg-white hover:border-blue-400 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-[#137fec]/40',
  };

  const leftBorderClasses = {
    success: 'border-l-green-500',
    error: 'border-l-red-500',
    warning: 'border-l-amber-500',
    neutral: 'border-l-neutral-400 dark:border-l-[#9dabb9]/40',
    info: 'border-l-blue-500 dark:border-l-[#137fec]',
  };

  const percentageClasses = {
    success: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-500/10',
    error: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10',
    warning: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10',
    neutral: 'text-neutral-500 bg-neutral-100 dark:text-[#9dabb9] dark:bg-[#1e252e]',
    info: 'text-blue-600 bg-blue-50 dark:text-[#137fec] dark:bg-[#137fec]/10',
  };

  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`flex flex-col justify-between rounded-lg border border-l-[3px] p-4 transition-all ${
        variantClasses[variant]
      } ${leftBorderClasses[variant]} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className='mb-3 flex items-center justify-between'>
        <span className='text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-[#9dabb9]'>
          {label}
        </span>
        {icon && <span className='dark:text-[#9dabb9]'>{icon}</span>}
      </div>
      <div className='flex items-end justify-between'>
        <span className='text-2xl font-bold text-neutral-900 dark:text-white'>{value}</span>
        {percentage !== undefined && (
          <span
            className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${percentageClasses[variant]}`}
          >
            {percentage}%
          </span>
        )}
      </div>
    </button>
  );
}
