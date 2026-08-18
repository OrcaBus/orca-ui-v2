import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatTableDate } from '@/utils/timeFormat';
import type { OverviewWorkflowRun } from '../utils/overviewData';

interface OverviewWorkflowRunsCardProps {
  runs: OverviewWorkflowRun[];
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void | Promise<void>;
}

export function OverviewWorkflowRunsCard({
  runs,
  isLoading = false,
  error,
  onRetry,
}: OverviewWorkflowRunsCardProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#2d3540]'>
        <h2 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
          Recent Workflow Runs
        </h2>
        <Link
          to='/runs/workflow-runs/'
          className='flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
        >
          View all
          <ArrowRight className='h-3 w-3' />
        </Link>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b border-slate-200 bg-slate-50 dark:border-[#2d3540] dark:bg-[#111418]'>
            <tr>
              <th className='text-caption px-4 py-2 text-left font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Run Name
              </th>
              <th className='text-caption px-4 py-2 text-left font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Status
              </th>
              <th className='text-caption px-4 py-2 text-left font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Start time
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-[#2d3540]'>
            {error ? (
              <tr>
                <td colSpan={3} className='p-4'>
                  <ApiErrorState error={error} onRetry={onRetry} />
                </td>
              </tr>
            ) : isLoading ? (
              <tr>
                <td colSpan={3} className='px-4 py-8 text-center'>
                  <div className='sr-only'>Loading recent workflow runs</div>
                  <div aria-hidden='true' className='space-y-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height={16} borderRadius={4} />
                    ))}
                  </div>
                </td>
              </tr>
            ) : runs.length === 0 ? (
              <tr>
                <td colSpan={3} className='text-muted-foreground px-4 py-8 text-center text-sm'>
                  No recent workflow runs
                </td>
              </tr>
            ) : (
              runs.map((workflow) => (
                <tr
                  key={workflow.id}
                  className='transition-colors hover:bg-slate-50 dark:hover:bg-[#1e252e]/50'
                >
                  <td className='px-4 py-3'>
                    <Link
                      to={`/runs/workflow-runs/${workflow.id}`}
                      className='block text-[13px] text-blue-600 hover:underline dark:text-blue-400'
                    >
                      {workflow.runName}
                    </Link>
                  </td>
                  <td className='px-4 py-3'>
                    <StatusBadge status={workflow.status} size='sm' />
                  </td>
                  <td className='px-4 py-3'>
                    {workflow.startTime ? (
                      <div className='text-[13px] text-slate-800 dark:text-slate-200'>
                        {formatTableDate(workflow.startTime)}
                      </div>
                    ) : (
                      <span className='text-muted-foreground text-[13px]'>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
