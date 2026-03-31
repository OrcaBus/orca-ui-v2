import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  options: MultiSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  triggerClassName,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabels = options.filter((o) => values.includes(o.value));

  function toggle(value: string) {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value));
    } else {
      onChange([...values, value]);
    }
  }

  function removeValue(value: string, e: React.MouseEvent) {
    e.stopPropagation();
    onChange(values.filter((v) => v !== value));
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type='button'
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-left text-sm shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]',
          triggerClassName
        )}
      >
        <span className='flex min-h-[20px] flex-1 flex-wrap items-center gap-1'>
          {selectedLabels.length === 0 ? (
            <span className='text-neutral-500 dark:text-[#9dabb9]'>{placeholder}</span>
          ) : selectedLabels.length <= 2 ? (
            selectedLabels.map((opt) => (
              <span
                key={opt.value}
                className='inline-flex items-center gap-0.5 rounded bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
              >
                {opt.label}
                <X
                  className='h-3 w-3 cursor-pointer hover:text-blue-900 dark:hover:text-blue-200'
                  onClick={(e) => removeValue(opt.value, e)}
                />
              </span>
            ))
          ) : (
            <span className='text-neutral-700 dark:text-slate-200'>
              {selectedLabels.length} selected
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform dark:text-[#9dabb9] ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className='absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'>
          {options.map((option) => {
            const isSelected = values.includes(option.value);
            return (
              <button
                key={option.value}
                type='button'
                onClick={() => toggle(option.value)}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-neutral-50 dark:hover:bg-[#1e252e]'
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 dark:border-[#137fec] dark:bg-[#137fec]'
                      : 'border-neutral-300 dark:border-[#2d3540] dark:bg-[#1e252e]'
                  }`}
                >
                  {isSelected && <Check className='h-3 w-3 text-white' />}
                </span>
                <span
                  className={
                    isSelected
                      ? 'font-medium text-neutral-900 dark:text-white'
                      : 'text-neutral-700 dark:text-slate-300'
                  }
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
