import type { ComponentProps } from 'react';
import { AlertTriangle, RefreshCw, WifiOff, ShieldAlert, ServerCrash } from 'lucide-react';
import { cn } from '@/utils/cn';

type ErrorKind = 'network' | 'forbidden' | 'server' | 'generic';

interface ApiErrorStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  title?: string;
  message?: string;
  error?: unknown;
  onRetry?: () => void;
}

function resolveErrorDetails(error: unknown): {
  kind: ErrorKind;
  statusCode?: number;
  detail: string;
} {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      return { kind: 'network', detail: error.message };
    }
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    const status =
      typeof obj.status === 'number'
        ? obj.status
        : typeof obj.statusCode === 'number'
          ? obj.statusCode
          : undefined;

    if (status !== undefined) {
      const msg =
        typeof obj.message === 'string'
          ? obj.message
          : typeof obj.detail === 'string'
            ? obj.detail
            : '';

      if (status === 403 || status === 401) {
        return { kind: 'forbidden', statusCode: status, detail: msg };
      }
      if (status >= 500) {
        return { kind: 'server', statusCode: status, detail: msg };
      }
      return { kind: 'generic', statusCode: status, detail: msg };
    }
  }

  if (error instanceof Error) {
    return { kind: 'generic', detail: error.message };
  }

  return { kind: 'generic', detail: typeof error === 'string' ? error : 'Unknown error' };
}

const kindConfig: Record<
  ErrorKind,
  {
    icon: typeof AlertTriangle;
    label: string;
    description: string;
    accent: string;
    bg: string;
    iconBg: string;
    badge: string;
  }
> = {
  network: {
    icon: WifiOff,
    label: 'Connection failed',
    description: 'Unable to reach the server. Check your network connection and try again.',
    accent: 'text-amber-600 dark:text-amber-400',
    bg: 'border-amber-200/60 bg-amber-50/30 dark:border-amber-500/20 dark:bg-amber-500/5',
    iconBg: 'bg-amber-100 dark:bg-amber-500/15',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  },
  forbidden: {
    icon: ShieldAlert,
    label: 'Access denied',
    description: "You don't have permission to access this resource.",
    accent: 'text-orange-600 dark:text-orange-400',
    bg: 'border-orange-200/60 bg-orange-50/30 dark:border-orange-500/20 dark:bg-orange-500/5',
    iconBg: 'bg-orange-100 dark:bg-orange-500/15',
    badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300',
  },
  server: {
    icon: ServerCrash,
    label: 'Server error',
    description: 'The server encountered an unexpected error. Please try again later.',
    accent: 'text-red-600 dark:text-red-400',
    bg: 'border-red-200/60 bg-red-50/30 dark:border-red-500/20 dark:bg-red-500/5',
    iconBg: 'bg-red-100 dark:bg-red-500/15',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
  generic: {
    icon: AlertTriangle,
    label: 'Something went wrong',
    description: 'An unexpected error occurred while loading data.',
    accent: 'text-red-600 dark:text-red-400',
    bg: 'border-red-200/60 bg-red-50/30 dark:border-red-500/20 dark:bg-red-500/5',
    iconBg: 'bg-red-100 dark:bg-red-500/15',
    badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
  },
};

export function ApiErrorState({
  title,
  message,
  error,
  onRetry,
  className,
  ...props
}: ApiErrorStateProps) {
  const { kind, statusCode, detail } = resolveErrorDetails(error);
  const config = kindConfig[kind];
  const Icon = config.icon;

  const displayTitle = title ?? config.label;
  const displayMessage = message ?? (detail || config.description);

  return (
    <div className={cn('rounded-lg border p-6', config.bg, className)} role='alert' {...props}>
      <div className='flex flex-col items-center text-center'>
        <div className={cn('flex h-12 w-12 items-center justify-center rounded-xl', config.iconBg)}>
          <Icon className={cn('h-6 w-6', config.accent)} />
        </div>

        <div className='mt-4 space-y-1.5'>
          <div className='flex items-center justify-center gap-2'>
            <h3 className='text-sm font-semibold text-slate-900 dark:text-white'>{displayTitle}</h3>
            {statusCode && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold',
                  config.badge
                )}
              >
                {statusCode}
              </span>
            )}
          </div>
          <p className='mx-auto max-w-sm text-xs leading-relaxed text-slate-500 dark:text-[#9dabb9]'>
            {displayMessage}
          </p>
        </div>

        {onRetry && (
          <button
            type='button'
            onClick={onRetry}
            className='mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#252d38]'
          >
            <RefreshCw className='h-3.5 w-3.5' />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
