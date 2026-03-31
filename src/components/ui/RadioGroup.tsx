'use client';

import type { ComponentProps } from 'react';
import { RadioGroup as HeadlessRadioGroup, Radio as HeadlessRadio } from '@headlessui/react';
import { CircleIcon } from 'lucide-react';

import { cn } from '@/utils/cn';

function RadioGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
  ...props
}: Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> & {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
}) {
  return (
    <HeadlessRadioGroup
      data-slot='radio-group'
      value={value}
      defaultValue={defaultValue}
      onChange={onValueChange}
      disabled={disabled}
      name={name}
      className={cn('grid gap-3', className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  value,
  disabled,
  ...props
}: Omit<ComponentProps<'div'>, 'value'> & {
  value: string;
  disabled?: boolean;
}) {
  return (
    <HeadlessRadio
      data-slot='radio-group-item'
      value={value}
      disabled={disabled}
      className={cn(
        'group/radio border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      <span
        data-slot='radio-group-indicator'
        className='relative flex items-center justify-center opacity-0 group-data-[checked]/radio:opacity-100'
      >
        <CircleIcon className='fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2' />
      </span>
    </HeadlessRadio>
  );
}

export { RadioGroup, RadioGroupItem };
