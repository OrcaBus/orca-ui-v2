'use client';

import type { ComponentProps } from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';

import { cn } from '@/utils/cn';

function Switch({
  className,
  checked,
  defaultChecked,
  onCheckedChange,
  disabled,
  name,
  value,
  ...props
}: Omit<ComponentProps<'button'>, 'onChange' | 'value'> & {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
}) {
  return (
    <HeadlessSwitch
      data-slot='switch'
      checked={checked}
      defaultChecked={defaultChecked}
      onChange={onCheckedChange}
      disabled={disabled}
      name={name}
      value={value}
      className={cn(
        'group/switch peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-[background-color,border-color,opacity] outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'data-[checked]:bg-primary bg-switch-background focus-visible:border-ring focus-visible:ring-ring/50 dark:not-data-[checked]:bg-input/80 focus-visible:ring-[3px]',
        className
      )}
      {...props}
    >
      <span
        data-slot='switch-thumb'
        className='bg-card dark:bg-card-foreground dark:group-data-[checked]/switch:bg-primary-foreground pointer-events-none block size-4 translate-x-0 rounded-full ring-0 transition-transform group-data-[checked]/switch:translate-x-[calc(100%-2px)]'
      />
    </HeadlessSwitch>
  );
}

export { Switch };
