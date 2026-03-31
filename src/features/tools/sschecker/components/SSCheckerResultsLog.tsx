import { AlertTriangle, CheckCircle, Copy, Download, Loader2, XCircle } from 'lucide-react';
import type { LoggingLevel, ValidationResult, ValidationStatus } from '../types';
import { VERSION } from '../constants';
import { ValidationResultItem } from './ValidationResultItem';

interface SSCheckerResultsLogProps {
  isChecking: boolean;
  validationResults: ValidationResult[] | null;
  validationStatus: ValidationStatus | null;
  loggingLevel: LoggingLevel;
  copied: boolean;
  onCopyLog: () => void;
  onDownloadLog: () => void;
}

function getResultsPlaceholderText(
  isChecking: boolean,
  validationResults: ValidationResult[] | null
): string | null {
  if (isChecking) return null;
  if (!validationResults) return 'Waiting for input...';
  if (validationResults.length === 0) return 'No entries at this logging level.';
  return null;
}

export function SSCheckerResultsLog({
  isChecking,
  validationResults,
  validationStatus,
  loggingLevel,
  copied,
  onCopyLog,
  onDownloadLog,
}: SSCheckerResultsLogProps) {
  const resultsText = getResultsPlaceholderText(isChecking, validationResults);
  const hasResults = validationResults && validationResults.length > 0;

  return (
    <div className='flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900'>
      <div className='flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-700'>
        <p className='text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400'>
          Results Log
        </p>
        <div className='flex items-center gap-1'>
          {validationStatus && (
            <span
              className={`mr-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                validationStatus === 'passed'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
                  : validationStatus === 'warnings'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
              }`}
            >
              {validationStatus === 'passed' && <CheckCircle className='h-3 w-3' />}
              {validationStatus === 'warnings' && <AlertTriangle className='h-3 w-3' />}
              {validationStatus === 'failed' && <XCircle className='h-3 w-3' />}
              {validationStatus.charAt(0).toUpperCase() + validationStatus.slice(1)}
            </span>
          )}
          <button
            type='button'
            onClick={onCopyLog}
            disabled={!validationResults}
            title={copied ? 'Copied!' : 'Copy log'}
            className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
          >
            <Copy className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={onDownloadLog}
            disabled={!validationResults}
            title='Download log'
            className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
          >
            <Download className='h-4 w-4' />
          </button>
        </div>
      </div>

      <div className='relative min-h-64'>
        {isChecking ? (
          <div className='flex h-48 items-center justify-center gap-2 text-sm text-neutral-400'>
            <Loader2 className='h-4 w-4 animate-spin' />
            Running validation...
          </div>
        ) : resultsText ? (
          <div className='flex items-start justify-between px-5 py-4'>
            <p className='text-sm text-neutral-400 italic dark:text-neutral-500'>{resultsText}</p>
            <span className='font-mono text-xs text-neutral-300 dark:text-neutral-600'>
              {VERSION}
            </span>
          </div>
        ) : (
          <div className='max-h-[520px] divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800'>
            {validationResults!.map((result, index) => (
              <ValidationResultItem key={index} result={result} />
            ))}
          </div>
        )}

        {hasResults && (
          <div className='flex items-center justify-between border-t border-neutral-100 px-5 py-2 dark:border-neutral-800'>
            <span className='text-xs text-neutral-400 dark:text-neutral-500'>
              {validationResults.length} {validationResults.length === 1 ? 'entry' : 'entries'} ·{' '}
              {loggingLevel} level and above
            </span>
            <span className='font-mono text-xs text-neutral-300 dark:text-neutral-600'>
              {VERSION}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
