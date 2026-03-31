import { Copy, Check } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { AnalysisRunDetail } from '@/data/mockData';

export interface AnalysisRunDetailPageHeaderProps {
  analysisRun: AnalysisRunDetail;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}

export function AnalysisRunDetailPageHeader({
  analysisRun,
  copiedId,
  onCopy,
}: AnalysisRunDetailPageHeaderProps) {
  return (
    <div className='mb-6'>
      <div className='mb-3 flex items-center gap-3'>
        <h1 className='text-2xl font-semibold text-neutral-900 dark:text-white'>
          {analysisRun.name}
        </h1>
        <StatusBadge status={analysisRun.status} size='md' />
      </div>

      {/* Key Identifiers */}
      <div className='flex flex-wrap items-center gap-6 text-sm'>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-600 dark:text-neutral-400'>AnalysisRun Orcabus ID:</span>
          <span className='font-mono text-neutral-900 dark:text-neutral-100'>
            {analysisRun.orcabusId}
          </span>
          <button
            onClick={() => onCopy(analysisRun.orcabusId, 'orcabus-id')}
            className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            {copiedId === 'orcabus-id' ? (
              <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
            ) : (
              <Copy className='h-4 w-4 text-neutral-400' />
            )}
          </button>
        </div>
        {analysisRun.externalId && (
          <div className='flex items-center gap-2'>
            <span className='text-neutral-600 dark:text-neutral-400'>External ID:</span>
            <span className='font-mono text-neutral-900 dark:text-neutral-100'>
              {analysisRun.externalId}
            </span>
            <button
              onClick={() => onCopy(analysisRun.externalId!, 'external-id')}
              className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
            >
              {copiedId === 'external-id' ? (
                <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
              ) : (
                <Copy className='h-4 w-4 text-neutral-400' />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
