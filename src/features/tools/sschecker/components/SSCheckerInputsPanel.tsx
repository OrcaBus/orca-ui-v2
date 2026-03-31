import { Loader2, Play } from 'lucide-react';
import type { LoggingLevel } from '../types';
import { FormatTipCard } from './FormatTipCard';
import { LoggingLevelSelect } from './LoggingLevelSelect';
import { SampleSheetFileInput } from './SampleSheetFileInput';

interface SSCheckerInputsPanelProps {
  selectedFile: File | null;
  loggingLevel: LoggingLevel;
  isChecking: boolean;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
  onLoggingLevelChange: (level: LoggingLevel) => void;
  onCheck: () => void;
}

export function SSCheckerInputsPanel({
  selectedFile,
  loggingLevel,
  isChecking,
  onFileSelect,
  onFileClear,
  onLoggingLevelChange,
  onCheck,
}: SSCheckerInputsPanelProps) {
  const canCheck = Boolean(selectedFile) && !isChecking;

  return (
    <div className='flex w-1/3 shrink-0 flex-col gap-3'>
      <div className='rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900'>
        <p className='mb-4 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400'>
          Inputs
        </p>

        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
            Sample Sheet File
          </label>
          <SampleSheetFileInput
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
            onFileClear={onFileClear}
          />
        </div>

        <div className='mb-5'>
          <label className='mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
            Logging Level
          </label>
          <LoggingLevelSelect value={loggingLevel} onChange={onLoggingLevelChange} />
        </div>

        <button
          type='button'
          onClick={onCheck}
          disabled={!canCheck}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            !canCheck
              ? 'cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-neutral-700 dark:text-neutral-500'
              : 'bg-slate-500 text-white hover:bg-slate-600 dark:bg-slate-600 dark:hover:bg-slate-500'
          }`}
        >
          {isChecking ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Checking...
            </>
          ) : (
            <>
              <Play className='h-3.5 w-3.5 fill-current' />
              Check
            </>
          )}
        </button>
      </div>

      <FormatTipCard />
    </div>
  );
}
