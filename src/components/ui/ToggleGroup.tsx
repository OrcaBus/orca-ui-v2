'use client';

import { createContext, useCallback, useContext, useState, type ComponentProps } from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';
import { toggleVariants } from './toggle-variants';

const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
});

type ToggleGroupType = 'single' | 'multiple';

interface ToggleGroupBaseProps extends ComponentProps<'div'>, VariantProps<typeof toggleVariants> {}

interface ToggleGroupSingleProps extends ToggleGroupBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

interface ToggleGroupMultipleProps extends ToggleGroupBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
}

type ToggleGroupProps = ToggleGroupSingleProps | ToggleGroupMultipleProps;

const ToggleGroupValueContext = createContext<{
  value: string | string[];
  type: ToggleGroupType;
  onItemClick: (value: string) => void;
}>({ value: '', type: 'single', onItemClick: () => {} });

function ToggleGroup({
  className,
  variant,
  size,
  children,
  type = 'single',
  value: controlledValue,
  defaultValue,
  onValueChange,
  ...props
}: ToggleGroupProps) {
  const [internalValue, setInternalValue] = useState<string | string[]>(
    defaultValue ?? (type === 'multiple' ? [] : '')
  );
  const value = controlledValue ?? internalValue;

  const handleItemClick = useCallback(
    (itemValue: string) => {
      if (type === 'single') {
        const newValue = value === itemValue ? '' : itemValue;
        if (controlledValue === undefined) setInternalValue(newValue);
        (onValueChange as ((v: string) => void) | undefined)?.(newValue);
      } else {
        const currentValues = Array.isArray(value) ? value : [];
        const newValues = currentValues.includes(itemValue)
          ? currentValues.filter((v) => v !== itemValue)
          : [...currentValues, itemValue];
        if (controlledValue === undefined) setInternalValue(newValues);
        (onValueChange as ((v: string[]) => void) | undefined)?.(newValues);
      }
    },
    [type, value, controlledValue, onValueChange]
  );

  return (
    <div
      data-slot='toggle-group'
      data-variant={variant}
      data-size={size}
      role='group'
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        <ToggleGroupValueContext.Provider value={{ value, type, onItemClick: handleItemClick }}>
          {children}
        </ToggleGroupValueContext.Provider>
      </ToggleGroupContext.Provider>
    </div>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof toggleVariants> & {
    value: string;
  }) {
  const context = useContext(ToggleGroupContext);
  const { value: groupValue, onItemClick } = useContext(ToggleGroupValueContext);

  const isPressed = Array.isArray(groupValue) ? groupValue.includes(value) : groupValue === value;

  return (
    <button
      type='button'
      data-slot='toggle-group-item'
      data-variant={context.variant || variant}
      data-size={context.size || size}
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className
      )}
      onClick={() => onItemClick(value)}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleGroup, ToggleGroupItem };
