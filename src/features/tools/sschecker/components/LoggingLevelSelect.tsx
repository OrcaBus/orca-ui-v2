import { Select } from '@/components/ui/Select';
import type { LoggingLevel } from '../api/sschecker.api';
import { LOGGING_LEVELS } from '../utils/constants';

interface LoggingLevelSelectProps {
  value: LoggingLevel;
  onChange: (level: LoggingLevel) => void;
}

export function LoggingLevelSelect({ value, onChange }: LoggingLevelSelectProps) {
  return (
    <div className='relative'>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as LoggingLevel)}
        className='w-full appearance-none rounded-lg border border-neutral-300 bg-white px-3 py-2 pr-8 text-sm text-neutral-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
        aria-label='Logging level'
      >
        {LOGGING_LEVELS.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </Select>
      <div className='pointer-events-none absolute inset-y-0 right-2.5 flex items-center'>
        <svg
          className='h-4 w-4 text-neutral-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
          aria-hidden
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </div>
    </div>
  );
}
