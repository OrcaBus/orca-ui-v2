import type { ComponentProps, ReactElement } from 'react';

import { cn } from '@/utils/cn';

export interface SelectOption {
  value: string;
  label: string;
}

type NativeSelectProps = ComponentProps<'select'> & {
  options?: never;
  placeholder?: never;
};

type OptionsSelectProps = Omit<ComponentProps<'select'>, 'children' | 'onChange'> & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  children?: never;
};

type SelectProps = NativeSelectProps | OptionsSelectProps;

function isOptionsSelect(props: SelectProps): props is OptionsSelectProps {
  return Array.isArray((props as OptionsSelectProps).options);
}

/**
 * A native-<select>-based dropdown with the shared visual language (see
 * Input/Button). Unlike the earlier version of this component, it forwards
 * id, name, disabled, aria attributes, and ref, and accepts a className
 * override — it used to accept none of that, which is the reason most
 * forms reached for a hand-rolled <select> instead (each one inventing its
 * own slightly different focus/radius treatment). New forms should be able
 * to use this directly, including with react-hook-form's `register()`.
 */
export function Select(props: OptionsSelectProps): ReactElement;
export function Select(props: NativeSelectProps): ReactElement;
export function Select(props: SelectProps): ReactElement {
  const selectClassName = cn(
    'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:border-[#137fec] dark:focus:ring-[#137fec]',
    props.className
  );

  if (isOptionsSelect(props)) {
    const { className: _className, value, onChange, options, placeholder, ...selectProps } = props;
    return (
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={selectClassName}
        {...selectProps}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  const { className: _className, children, ...selectProps } = props;
  return (
    <select className={selectClassName} {...selectProps}>
      {children}
    </select>
  );
}
