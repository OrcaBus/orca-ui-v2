import { Button } from '@/components/ui/Button';
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import type { LoggingLevel, ValidationResponse } from '../api/sschecker.api';
import type { ValidationStatus } from '@/utils/constants';
import { formatLogLines, type FormattedLogLine } from '../utils/logFormatting';
import { getValidationStatusDisplay } from '../utils/validationResponse';

interface SSCheckerResultsLogPanelProps {
  isChecking: boolean;
  selectedFileName: string | undefined;
  validationResponse?: ValidationResponse;
  error: unknown;
  loggingLevel: LoggingLevel;
  copied: boolean;
  onCopyLog: () => void;
  onDownloadLog: () => void;
  onDownloadV2SampleSheet: () => void;
  onRetry: () => void;
}

function getResultsPlaceholderText(isChecking: boolean, validationResponse?: ValidationResponse) {
  if (isChecking) return null;
  if (!validationResponse) return 'Waiting for input...';
  return null;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unable to validate the sample sheet.';
}

function getStatusBadgeClasses(status: ValidationStatus): string {
  return status === 'passed'
    ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
    : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
}

function getLogLineClasses(severity: LoggingLevel | null): string {
  switch (severity) {
    case 'DEBUG':
      return 'text-neutral-500 dark:text-neutral-400';
    case 'INFO':
      return 'text-blue-700 dark:text-blue-300';
    case 'WARNING':
      return 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200';
    case 'ERROR':
    case 'CRITICAL':
      return 'bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200';
    default:
      return 'text-neutral-700 dark:text-neutral-300';
  }
}

function LogLine({ line }: { line: FormattedLogLine }) {
  return (
    <div className={`grid grid-cols-[3.5rem_minmax(0,1fr)] ${getLogLineClasses(line.severity)}`}>
      <span className='border-r border-neutral-200 px-3 py-1 text-right text-neutral-400 select-none dark:border-neutral-800 dark:text-neutral-600'>
        {line.lineNumber}
      </span>
      <span className='px-3 py-1 whitespace-pre-wrap'>{line.text || ' '}</span>
    </div>
  );
}

function LogViewer({ logFile }: { logFile: string }) {
  const lines = formatLogLines(logFile);

  return (
    <div className='max-h-130 overflow-auto border-t border-neutral-100 bg-neutral-50 font-mono text-xs leading-5 dark:border-neutral-800 dark:bg-neutral-950'>
      {lines.map((line) => (
        <LogLine key={line.lineNumber} line={line} />
      ))}
    </div>
  );
}

function SampleSheetPreview({
  sampleSheet,
  onDownload,
}: {
  sampleSheet: string;
  onDownload: () => void;
}) {
  return (
    <details className='border-t border-neutral-100 dark:border-neutral-800'>
      <summary className='flex cursor-pointer items-center justify-between gap-3 px-5 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50'>
        <span className='flex items-center gap-2'>
          <FileText className='h-4 w-4 text-neutral-400' />
          Sample Sheet V2
        </span>
      </summary>
      <div className='border-t border-neutral-100 dark:border-neutral-800'>
        <pre className='max-h-80 overflow-auto bg-neutral-50 px-5 py-4 font-mono text-xs whitespace-pre-wrap text-neutral-700 dark:bg-neutral-950 dark:text-neutral-300'>
          {sampleSheet}
        </pre>
        <div className='flex justify-end border-t border-neutral-100 px-5 py-3 dark:border-neutral-800'>
          <Button
            variant='ghost'
            type='button'
            onClick={onDownload}
            className='inline-flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800'
          >
            <Download className='h-3.5 w-3.5' />
            Download CSV
          </Button>
        </div>
      </div>
    </details>
  );
}

export function SSCheckerResultsLogPanel({
  isChecking,
  selectedFileName,
  validationResponse,
  error,
  loggingLevel,
  copied,
  onCopyLog,
  onDownloadLog,
  onDownloadV2SampleSheet,
  onRetry,
}: SSCheckerResultsLogPanelProps) {
  const resultsText = getResultsPlaceholderText(isChecking, validationResponse);
  const validationStatus = validationResponse
    ? getValidationStatusDisplay(validationResponse.check_status)
    : null;
  const hasLog = Boolean(validationResponse?.log_file);
  const hasSampleSheet = Boolean(validationResponse?.v2_sample_sheet);

  return (
    <div className='flex-1 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900'>
      <div className='flex items-center justify-between border-b border-neutral-200 px-5 py-3.5 dark:border-neutral-700'>
        <p className='text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400'>
          Results Log
        </p>
        <div className='flex items-center gap-1'>
          {validationStatus && (
            <span
              className={`mr-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeClasses(
                validationStatus.status
              )}`}
            >
              {validationStatus.status === 'passed' ? (
                <CheckCircle className='h-3 w-3' />
              ) : (
                <XCircle className='h-3 w-3' />
              )}
              {validationStatus.label}
            </span>
          )}
          <Button
            variant='ghost'
            type='button'
            onClick={onCopyLog}
            disabled={!hasLog}
            title={copied ? 'Copied!' : 'Copy log'}
            className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
          >
            <Copy className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            type='button'
            onClick={onDownloadLog}
            disabled={!hasLog}
            title='Download log'
            className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-neutral-800 dark:hover:text-neutral-300'
          >
            <Download className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='relative min-h-64'>
        {isChecking ? (
          <div className='flex h-48 flex-col items-center justify-center gap-2 text-sm text-neutral-400'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Checking {selectedFileName ?? 'sample sheet'}...</span>
          </div>
        ) : error ? (
          <div className='flex min-h-64 flex-col items-center justify-center gap-4 px-5 py-8 text-center'>
            <div className='flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-300'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <div>
              <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                Validation request failed
              </p>
              <p className='mt-1 max-w-lg text-sm text-neutral-500 dark:text-neutral-400'>
                {getErrorMessage(error)}
              </p>
            </div>
            <Button
              variant='ghost'
              type='button'
              onClick={onRetry}
              disabled={isChecking}
              className='inline-flex items-center gap-2 rounded-md bg-slate-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-500 dark:hover:bg-slate-400'
            >
              <RotateCcw className='h-3.5 w-3.5' />
              Retry
            </Button>
          </div>
        ) : resultsText ? (
          <div className='px-5 py-4'>
            <p className='text-sm text-neutral-400 italic dark:text-neutral-500'>{resultsText}</p>
          </div>
        ) : validationResponse ? (
          <div>
            <div className='flex items-start justify-between gap-4 px-5 py-4'>
              <div>
                <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                  Check Result: {validationStatus?.label}
                </p>
                {validationResponse?.error_message && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-300'>
                    {validationResponse.error_message}
                  </p>
                )}
              </div>
              <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                Logger: {loggingLevel}
              </span>
            </div>
            {hasLog ? (
              <LogViewer logFile={validationResponse.log_file} />
            ) : (
              <div className='border-t border-neutral-100 px-5 py-4 text-sm text-neutral-400 italic dark:border-neutral-800 dark:text-neutral-500'>
                No log output returned by sschecker.
              </div>
            )}
            {hasSampleSheet && (
              <SampleSheetPreview
                sampleSheet={validationResponse.v2_sample_sheet ?? ''}
                onDownload={onDownloadV2SampleSheet}
              />
            )}
          </div>
        ) : null}

        {hasLog && (
          <div className='border-t border-neutral-100 px-5 py-2 dark:border-neutral-800'>
            <span className='text-xs text-neutral-400 dark:text-neutral-500'>
              Raw backend log · {loggingLevel} level
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
