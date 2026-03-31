'use client';

import type { ComponentProps } from 'react';
import { Checkbox as HeadlessCheckbox } from '@headlessui/react';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

function Checkbox({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  value,
  ...props
}: Omit<ComponentProps<'span'>, 'onChange'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  return (
    <HeadlessCheckbox
      data-slot='checkbox'
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      className={cn(
        'group/checkbox peer bg-input-background dark:bg-input/30 data-[checked]:bg-primary data-[checked]:text-primary-foreground dark:data-[checked]:bg-primary data-[checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span
        data-slot='checkbox-indicator'
        className='flex items-center justify-center text-current opacity-0 transition-none group-data-[checked]/checkbox:opacity-100'
      >
        <CheckIcon className='size-3.5' />
      </span>
    </HeadlessCheckbox>
  );
}

export { Checkbox };
