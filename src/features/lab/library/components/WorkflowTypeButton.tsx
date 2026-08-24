import { Button } from '@/components/ui/Button';

interface WorkflowTypeButtonProps {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}

export function WorkflowTypeButton({ isSelected, label, onClick }: WorkflowTypeButtonProps) {
  return (
    <Button
      variant='ghost'
      size='inline'
      type='button'
      aria-pressed={isSelected}
      onClick={onClick}
      className={`h-9 w-full justify-start rounded-none border-l-2 px-4 py-1.5 text-left transition-colors ${
        isSelected
          ? 'border-l-blue-400 bg-white hover:bg-white dark:bg-[#1e252e] dark:hover:bg-[#1e252e]'
          : 'border-l-transparent hover:border-l-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
      }`}
    >
      <span
        className={`min-w-0 truncate text-sm font-semibold ${
          isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'
        }`}
      >
        {label}
      </span>
    </Button>
  );
}
