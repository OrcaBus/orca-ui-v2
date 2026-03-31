import { type PropsWithChildren } from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { X, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

interface DetailedErrorBoundaryProps extends PropsWithChildren {
  errorTitle?: string;
  /** Called when the user dismisses the error (X button). */
  onCloseError?: () => void;
  /** Optional retry handler invoked alongside the boundary reset. */
  onRetry?: () => void;
}

function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    if (typeof obj.detail === 'string') return obj.detail;
    if (typeof obj.message === 'string') return obj.message;
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Unknown error';
    }
  }
  return String(error);
}

function ErrorFallback({
  error,
  resetErrorBoundary,
  errorTitle,
  onCloseError,
  onRetry,
}: FallbackProps & Pick<DetailedErrorBoundaryProps, 'errorTitle' | 'onCloseError' | 'onRetry'>) {
  const navigate = useNavigate();

  const handleDismiss = () => {
    resetErrorBoundary();
    onCloseError?.();
  };

  const handleRetry = () => {
    onRetry?.();
    resetErrorBoundary();
  };

  const handleGoBack = () => {
    void navigate(-1);
  };

  return (
    <div className='relative my-4 w-full rounded-lg border border-red-100 bg-white p-6 shadow-sm dark:border-red-900/60 dark:bg-[#111418]'>
      <div className='mb-4 flex w-full items-center justify-between'>
        <h3 className='text-lg font-semibold text-slate-900 dark:text-slate-100'>
          {errorTitle ?? 'An error occurred'}
        </h3>
        <button
          type='button'
          onClick={handleDismiss}
          className='rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-500 focus:ring-2 focus:ring-red-500 focus:outline-none dark:text-slate-500 dark:hover:bg-[#1e252e] dark:hover:text-slate-400 dark:focus:ring-red-400'
        >
          <span className='sr-only'>Dismiss error</span>
          <X className='h-5 w-5' />
        </button>
      </div>

      <div className='rounded-md bg-red-50 p-4 dark:bg-red-900/10'>
        <pre className='font-mono text-sm wrap-break-word whitespace-pre-wrap text-red-600 dark:text-red-400'>
          {formatErrorMessage(error)}
        </pre>
      </div>

      <div className='mt-4 flex items-center gap-2'>
        <button
          type='button'
          onClick={handleGoBack}
          className='inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#252d38]'
        >
          <ArrowLeft className='h-3.5 w-3.5' />
          Go back
        </button>
        <button
          type='button'
          onClick={handleRetry}
          className='inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <RefreshCw className='h-3.5 w-3.5' />
          Retry
        </button>
      </div>
    </div>
  );
}

export function DetailedErrorBoundary({
  children,
  errorTitle,
  onCloseError,
  onRetry,
}: DetailedErrorBoundaryProps) {
  return (
    <ErrorBoundary
      FallbackComponent={(props) => (
        <ErrorFallback
          {...props}
          errorTitle={errorTitle}
          onCloseError={onCloseError}
          onRetry={onRetry}
        />
      )}
    >
      {children}
    </ErrorBoundary>
  );
}
