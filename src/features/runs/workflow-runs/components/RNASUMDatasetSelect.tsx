import { useState } from 'react';
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';
import { ALL_RNASUM_DATASETS, type RNASUMDataset } from '@/utils/rnasumDatasets';

interface RNASUMDatasetSelectProps {
  /** Project codes that are valid choices (from allowedDatasetChoice) */
  availableOptions: string[];
  selectedValue: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function RNASUMDatasetSelect({
  availableOptions,
  selectedValue,
  onChange,
  placeholder = 'Search datasets…',
  inputId,
  ariaDescribedBy,
  ariaInvalid,
}: RNASUMDatasetSelectProps) {
  const [query, setQuery] = useState('');

  const options: RNASUMDataset[] = ALL_RNASUM_DATASETS.filter((d) =>
    availableOptions.includes(d.project)
  );

  const selectedOption = options.find((o) => o.project === selectedValue) ?? null;

  const filteredOptions =
    query === ''
      ? options
      : options.filter(
          (o) =>
            o.project.toLowerCase().includes(query.toLowerCase()) ||
            o.name.toLowerCase().includes(query.toLowerCase())
        );

  return (
    <Combobox
      value={selectedOption}
      onChange={(val: RNASUMDataset | null) => {
        if (val) onChange(val.project);
      }}
      onClose={() => setQuery('')}
    >
      <div className='relative'>
        <ComboboxInput
          id={inputId}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          className={cn(
            'w-full rounded-lg border px-3 py-2 pr-9 text-sm',
            'border-neutral-300 bg-white text-neutral-900 placeholder-neutral-400',
            'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder-[#9dabb9]',
            'focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none',
            'dark:focus:border-blue-400',
            'transition duration-150'
          )}
          displayValue={(val: RNASUMDataset | null) => val?.project ?? ''}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
        />
        <ComboboxButton className='absolute inset-y-0 right-0 flex items-center px-2.5'>
          <ChevronsUpDown className='h-4 w-4 text-neutral-400 dark:text-neutral-500' />
        </ComboboxButton>
      </div>

      <ComboboxOptions
        anchor='bottom'
        transition
        className={cn(
          'absolute z-50 mt-1 w-(--input-width)',
          'max-h-72 overflow-hidden rounded-lg',
          'border border-neutral-200 dark:border-[#2d3540]',
          'bg-white dark:bg-[#111418]',
          'shadow-lg ring-1 ring-black/5 dark:ring-white/10',
          '[--anchor-gap:0.25rem]',
          'transition duration-100 data-leave:data-closed:opacity-0'
        )}
      >
        {/* Column header */}
        <div className='grid grid-cols-12 gap-2 border-b border-neutral-100 px-3 py-2 dark:border-[#2d3540]'>
          <div className='col-span-3 text-xs font-medium text-neutral-500 dark:text-neutral-400'>
            Project
          </div>
          <div className='col-span-7 text-xs font-medium text-neutral-500 dark:text-neutral-400'>
            Name
          </div>
          <div className='col-span-2 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400'>
            Samples
          </div>
        </div>

        <div className='max-h-60 overflow-y-auto'>
          {filteredOptions.length === 0 && query !== '' ? (
            <div className='px-3 py-3 text-sm text-neutral-500 dark:text-neutral-400'>
              No datasets found.
            </div>
          ) : (
            filteredOptions.map((option) => (
              <ComboboxOption
                key={option.project}
                value={option}
                className={cn(
                  'grid cursor-pointer grid-cols-12 gap-2 px-3 py-2 select-none',
                  'border-b border-neutral-50 last:border-0 dark:border-[#1e252e]',
                  'text-neutral-900 dark:text-neutral-100',
                  'transition-colors duration-75',
                  'hover:bg-neutral-50 dark:hover:bg-[#1e252e]',
                  'data-focus:bg-blue-50 dark:data-focus:bg-blue-900/30',
                  option.project === selectedValue && 'bg-blue-50 dark:bg-blue-900/20'
                )}
              >
                <div className='col-span-3 flex items-center gap-2'>
                  <Check
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-blue-500',
                      option.project === selectedValue ? 'visible' : 'invisible'
                    )}
                  />
                  <span
                    className={cn(
                      'text-xs',
                      option.project === selectedValue
                        ? 'font-semibold text-blue-600 dark:text-blue-400'
                        : 'font-medium'
                    )}
                  >
                    {option.project}
                  </span>
                </div>
                <div className='col-span-7 flex items-center text-xs text-neutral-600 dark:text-neutral-300'>
                  {option.name}
                </div>
                <div className='col-span-2 flex items-center justify-end text-xs text-neutral-400 dark:text-neutral-500'>
                  {option.samplesNo}
                </div>
              </ComboboxOption>
            ))
          )}
        </div>
      </ComboboxOptions>
    </Combobox>
  );
}
