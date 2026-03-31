import { useNavigate } from 'react-router';
import { ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { AnalysisRunDetail } from '@/data/mockData';

export interface AnalysisRunOverviewCardProps {
  analysisRun: AnalysisRunDetail;
}

export function AnalysisRunOverviewCard({ analysisRun }: AnalysisRunOverviewCardProps) {
  const navigate = useNavigate();

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900'>
      <div className='grid grid-cols-3 gap-8'>
        {/* Analysis Run Fields */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-white'>
            Analysis Run
          </h3>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Analysis Run Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {analysisRun.name}
              </div>
            </div>
            {analysisRun.comment && (
              <div>
                <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Comment</div>
                <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                  {analysisRun.comment}
                </div>
              </div>
            )}
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>Status</div>
              <StatusBadge status={analysisRun.status} />
            </div>
          </div>
        </div>

        {/* Analysis Type Section */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-white'>
            Analysis Type
          </h3>
          <div className='space-y-3'>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Analysis Name
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {analysisRun.analysisType.name}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Analysis Version
              </div>
              <div className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                {analysisRun.analysisType.version}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Description
              </div>
              <div className='text-sm text-neutral-900 dark:text-neutral-100'>
                {analysisRun.analysisType.description}
              </div>
            </div>
            <div>
              <div className='mb-0.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Analysis Status
              </div>
              <span
                className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                  analysisRun.analysisType.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                }`}
              >
                {analysisRun.analysisType.status}
              </span>
            </div>
          </div>
        </div>

        {/* Relationship Links Section */}
        <div>
          <h3 className='mb-4 text-sm font-semibold text-neutral-900 dark:text-white'>
            Relationships
          </h3>
          <div className='space-y-3'>
            <div>
              <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Linked Contexts
              </div>
              <div className='flex flex-wrap gap-1'>
                {analysisRun.linkedContextIds.map((ctxId) => (
                  <div
                    key={ctxId}
                    className='inline-flex items-center gap-1 rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                  >
                    <ExternalLink className='h-3 w-3' />
                    {ctxId}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Linked Workflows
              </div>
              <div className='flex flex-wrap gap-1'>
                {analysisRun.linkedWorkflowIds.map((wfId) => (
                  <button
                    key={wfId}
                    type='button'
                    onClick={() => {
                      void navigate(`/workflows/workflowrun/${wfId}`);
                    }}
                    className='inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                  >
                    <ExternalLink className='h-3 w-3' />
                    {wfId}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Related Libraries
              </div>
              <div className='flex flex-wrap gap-1'>
                {analysisRun.linkedLibraryIds.map((libId) => (
                  <button
                    key={libId}
                    type='button'
                    onClick={() => {
                      void navigate(`/lab/${libId}`);
                    }}
                    className='inline-flex items-center gap-1 rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50'
                  >
                    <ExternalLink className='h-3 w-3' />
                    {libId}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className='mb-1.5 text-xs text-neutral-600 dark:text-neutral-400'>
                Related Readsets
              </div>
              <div className='text-xs font-medium text-neutral-900 dark:text-neutral-100'>
                {analysisRun.linkedReadsetIds.length} readsets
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
