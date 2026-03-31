import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getRelativeTime } from '@/utils/timeFormat';
import type { SequenceRun } from '@/data/mockData';

interface OverviewSequenceRunsCardProps {
  runs: SequenceRun[];
}

export function OverviewSequenceRunsCard({ runs }: OverviewSequenceRunsCardProps) {
  return (
    <div className='overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-[#2d3540]'>
        <h2 className='text-sm font-semibold text-slate-800 dark:text-slate-200'>
          Recent Sequence Runs
        </h2>
        <Link
          to='/sequence'
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
              <th className='px-4 py-2 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Sequence Run ID
              </th>
              <th className='px-4 py-2 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Status
              </th>
              <th className='px-4 py-2 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Started
              </th>
              <th className='px-4 py-2 text-left text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
                Libraries
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-100 dark:divide-[#2d3540]'>
            {runs.map((run) => (
              <tr
                key={run.id}
                className='transition-colors hover:bg-slate-50 dark:hover:bg-[#1e252e]/50'
              >
                <td className='px-4 py-3'>
                  <Link
                    to={`/sequence/${run.id}`}
                    className='font-mono text-[13px] text-blue-600 hover:underline dark:text-blue-400'
                  >
                    {run.runId}
                  </Link>
                  <div className='mt-0.5 text-[11px] text-slate-400 dark:text-[#6b7a8d]'>
                    {run.flowcellId}
                  </div>
                </td>
                <td className='px-4 py-3'>
                  <StatusBadge status={run.status} size='sm' />
                </td>
                <td className='px-4 py-3'>
                  <div className='text-[13px] text-slate-800 dark:text-slate-200'>
                    {new Date(run.startDate).toLocaleDateString()}
                  </div>
                  <div className='text-[11px] text-slate-400 dark:text-[#6b7a8d]'>
                    {getRelativeTime(run.startDate)}
                  </div>
                </td>
                <td className='px-4 py-3 text-[13px] text-slate-800 dark:text-slate-200'>
                  {run.libraries}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
