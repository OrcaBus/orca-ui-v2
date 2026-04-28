import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAnalysisRunDetailContext } from '../context/AnalysisRunDetailContext';
import { toast } from 'sonner';

export function AnalysisRunDetailPageHeader() {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailContext();
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

  const displayName = analysisRunDetail?.analysisRunName ?? '—';
  const status = analysisRunDetail?.currentState?.status ?? 'unknown';

  return (
    <div className='mb-6'>
      <div className='mb-3 flex items-center gap-3'>
        {isLoadingAnalysisRunDetail ? (
          <>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-6 w-20 rounded-full' />
          </>
        ) : (
          <>
            <h1 className='text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
              {displayName}
            </h1>
            <StatusBadge status={status} size='md' />
          </>
        )}
      </div>

      {/* Key Identifiers */}
      <div className='flex flex-wrap items-center gap-6 text-sm'>
        {/* Orcabus ID */}
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>Orcabus ID:</span>
          {isLoadingAnalysisRunDetail ? (
            <Skeleton className='h-4 w-40' />
          ) : (
            <>
              <span className='font-mono text-neutral-900 dark:text-neutral-100'>
                {analysisRunDetail?.orcabusId ?? '—'}
              </span>
              {analysisRunDetail?.orcabusId && (
                <button
                  type='button'
                  onClick={() => void handleCopy(analysisRunDetail.orcabusId, 'orcabus-id')}
                  className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  aria-label='Copy Orcabus ID'
                >
                  {copiedId === 'orcabus-id' ? (
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
