'use client';

import { useState, type ComponentProps } from 'react';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/utils/cn';
import { toggleVariants } from './toggle-variants';

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed = false,
  onPressedChange,
  ...props
}: ComponentProps<'button'> &
  VariantProps<typeof toggleVariants> & {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
  }) {
  const [internalPressed, setInternalPressed] = useState(defaultPressed);
  const isPressed = pressed !== undefined ? pressed : internalPressed;

  return (
    <button
      type='button'
      data-slot='toggle'
      aria-pressed={isPressed}
      data-state={isPressed ? 'on' : 'off'}
      className={cn(toggleVariants({ variant, size, className }))}
      onClick={() => {
        const next = !isPressed;
        if (pressed === undefined) setInternalPressed(next);
        onPressedChange?.(next);
      }}
      {...props}
    />
  );
}

export { Toggle };
