'use client';

import { useCallback, useRef, useState, type ComponentProps, type PointerEvent } from 'react';

import { cn } from '@/utils/cn';

interface SliderProps extends Omit<ComponentProps<'div'>, 'onChange' | 'defaultValue'> {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  onValueChange?: (value: number[]) => void;
  onValueCommit?: (value: number[]) => void;
}

function Slider({
  className,
  defaultValue,
  value: controlledValue,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  onValueChange,
  onValueCommit,
  ...props
}: SliderProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? [min]);
  const values = controlledValue ?? internalValue;
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<number | null>(null);

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return min;
      const rect = trackRef.current.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const rawValue = min + percent * (max - min);
      return Math.round(rawValue / step) * step;
    },
    [min, max, step]
  );

  const updateValue = useCallback(
    (index: number, newVal: number) => {
      const updated = [...values];
      updated[index] = Math.max(min, Math.min(max, newVal));
      const newValues = updated.toSorted((a, b) => a - b);
      if (!controlledValue) setInternalValue(newValues);
      onValueChange?.(newValues);
      return newValues;
    },
    [values, min, max, controlledValue, onValueChange]
  );

  const handlePointerDown = (index: number) => (e: PointerEvent) => {
    if (disabled) return;
    e.preventDefault();
    isDragging.current = index;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (isDragging.current === null || disabled) return;
    const newVal = getValueFromPosition(e.clientX);
    updateValue(isDragging.current, newVal);
  };

  const handlePointerUp = () => {
    if (isDragging.current !== null) {
      onValueCommit?.(values);
      isDragging.current = null;
    }
  };

  const rangeStart = values.length > 1 ? getPercentage(values[0]) : 0;
  const rangeEnd = getPercentage(values[values.length - 1]);

  return (
    <div
      data-slot='slider'
      data-disabled={disabled || undefined}
      className={cn(
        'relative flex w-full touch-none items-center select-none',
        disabled && 'opacity-50',
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      {...props}
    >
      <div
        ref={trackRef}
        data-slot='slider-track'
        className='bg-muted relative h-4 w-full grow overflow-hidden rounded-full'
        onClick={(e) => {
          if (disabled) return;
          const newVal = getValueFromPosition(e.clientX);
          const closestIndex = values.reduce(
            (closest, val, i) =>
              Math.abs(val - newVal) < Math.abs(values[closest] - newVal) ? i : closest,
            0
          );
          const newValues = updateValue(closestIndex, newVal);
          onValueCommit?.(newValues);
        }}
      >
        <div
          data-slot='slider-range'
          className='bg-primary absolute h-full'
          style={{
            left: `${rangeStart}%`,
            width: `${rangeEnd - rangeStart}%`,
          }}
        />
      </div>
      {values.map((val, index) => (
        <div
          data-slot='slider-thumb'
          key={index}
          role='slider'
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-disabled={disabled}
          className='border-primary bg-background ring-ring/50 absolute block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none'
          style={{ left: `calc(${getPercentage(val)}% - 8px)` }}
          onPointerDown={handlePointerDown(index)}
          onKeyDown={(e) => {
            if (disabled) return;
            let newVal = val;
            if (e.key === 'ArrowRight' || e.key === 'ArrowUp') newVal += step;
            if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') newVal -= step;
            if (newVal !== val) {
              e.preventDefault();
              const newValues = updateValue(index, newVal);
              onValueCommit?.(newValues);
            }
          }}
        />
      ))}
    </div>
  );
}

export { Slider };
