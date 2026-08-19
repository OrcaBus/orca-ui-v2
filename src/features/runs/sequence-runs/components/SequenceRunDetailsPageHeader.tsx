import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSequenceRunDetailsContext } from '../context/SequenceRunDetailsContext';

export function SequenceRunDetailsPageHeader() {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();
  const { sequenceRunData, isLoadingSequenceRun } = useSequenceRunDetailsContext();

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Use the most recent sequence run for the status
  const latestRun = sequenceRunData?.[0];
  const status = latestRun?.status ?? null;

  return (
    <div className='my-4'>
      <div className='mb-3 flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          {isLoadingSequenceRun ? (
            <>
              <Skeleton className='h-8 w-64' />
              <Skeleton className='h-6 w-20 rounded-full' />
            </>
          ) : (
            <>
              <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
                Instrument Run {instrumentRunId}
              </h1>
              <StatusBadge status={status} size='md' />
            </>
          )}
        </div>
      </div>

      {/* Key Identifiers */}
      <div className='flex flex-wrap items-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Instrument Run ID:</span>
          {isLoadingSequenceRun ? (
            <Skeleton className='h-4 w-40' />
          ) : (
            <>
              <span className='font-mono text-neutral-900 dark:text-neutral-100'>
                {instrumentRunId ?? '—'}
              </span>
              {instrumentRunId && (
                <button
                  type='button'
                  onClick={() => void handleCopy(instrumentRunId, 'instrument-run-id')}
                  className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  aria-label='Copy Instrument Run ID'
                >
                  {copiedId === 'instrument-run-id' ? (
                    <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                  ) : (
                    <Copy className='h-4 w-4 text-neutral-400' />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
