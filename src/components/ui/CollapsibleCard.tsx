import { ReactNode, useState, useCallback } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './Collapsible';
import { cn } from '@/utils/cn';

interface CollapsibleCardProps {
  header: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function CollapsibleCard({
  header,
  children,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  className,
  headerClassName,
  contentClassName,
}: CollapsibleCardProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isOpen = controlledOpen ?? internalOpen;

  const handleOpenChange = useCallback(
    (value: boolean) => {
      if (controlledOpen === undefined) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleOpenChange}
      className={cn(
        'rounded-lg border',
        'border-neutral-200 bg-white',
        'dark:border-[#2d3540] dark:bg-[#111418]',
        className
      )}
    >
      <CollapsibleTrigger
        className={cn(
          'flex w-full cursor-pointer items-center justify-between rounded-lg px-6 py-4 transition-colors',
          'hover:bg-neutral-50 dark:hover:bg-[#1e252e]',
          headerClassName
        )}
      >
        <div className='min-w-0 flex-1 text-left'>{header}</div>
        {isOpen ? (
          <ChevronUp className='ml-4 h-5 w-5 shrink-0 text-neutral-500 dark:text-[#9dabb9]' />
        ) : (
          <ChevronDown className='ml-4 h-5 w-5 shrink-0 text-neutral-500 dark:text-[#9dabb9]' />
        )}
      </CollapsibleTrigger>

      <CollapsibleContent className={cn('px-6 pt-2 pb-4', contentClassName)}>
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
