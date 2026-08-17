import { LucideIcon } from 'lucide-react';

import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center px-4 py-12'>
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-[#1e252e]'>
        <Icon className='h-6 w-6 text-neutral-400 dark:text-[#9dabb9]' />
      </div>
      <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>{title}</h3>
      <p className='mb-4 max-w-sm text-center text-sm text-neutral-600 dark:text-[#9dabb9]'>
        {description}
      </p>
      {action && <Button onClick={action.onClick}>{action.label}</Button>}
    </div>
  );
}
