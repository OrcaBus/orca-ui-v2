import { LucideIcon } from 'lucide-react';

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
      <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100'>
        <Icon className='h-6 w-6 text-neutral-400' />
      </div>
      <h3 className='mb-1 font-medium text-neutral-900'>{title}</h3>
      <p className='mb-4 max-w-sm text-center text-sm text-neutral-600'>{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
