import { useNavigate } from 'react-router';
import { X, Link2, ArrowRight } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { getRelativeTime, formatDetailDate } from '../../../utils/timeFormat';
import type { Case } from '../types/case.types';
import { getCaseTypeVariant } from '../utils/getCaseTypeVariant';

interface LinkedLibrary {
  id: string;
  name: string;
  type: string;
  status: string;
}

interface CaseSummaryDrawerProps {
  case_: Case;
  linkedLibraries: LinkedLibrary[];
  onClose: () => void;
}

export function CaseSummaryDrawer({ case_, linkedLibraries, onClose }: CaseSummaryDrawerProps) {
  const navigate = useNavigate();

  return (
    <div className='fixed inset-0 z-50 flex'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      <div className='relative ml-auto flex w-full max-w-md flex-col bg-white shadow-xl dark:bg-neutral-900'>
        <div className='px-6 pt-5 pb-4'>
          <div className='flex items-start justify-between'>
            <div>
              <p className='mb-1 text-xs font-semibold tracking-wider text-blue-600 uppercase dark:text-blue-400'>
                Case Summary
              </p>
              <h2 className='text-xl font-bold text-neutral-900 dark:text-neutral-100'>
                {case_.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className='rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 dark:text-[#9dabb9] dark:hover:bg-neutral-800 dark:hover:text-slate-100'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        <hr className='border-neutral-200 dark:border-neutral-700' />

        <div className='flex-1 space-y-6 overflow-y-auto px-6 py-5'>
          <div>
            <h3 className='mb-3 text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300'>
              Metadata
            </h3>
            <div className='space-y-3 rounded-r-lg border-blue-500 bg-neutral-50 px-4 py-3 dark:bg-neutral-800'>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>Title</span>
                <span className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
                  {case_.title}
                </span>
              </div>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>Alias</span>
                <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
                  {case_.alias}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>Type</span>
                <PillTag variant={getCaseTypeVariant(case_.type)} size='sm'>
                  {case_.type}
                </PillTag>
              </div>
              <div className='flex items-baseline justify-between'>
                <span className='text-sm text-neutral-500 dark:text-neutral-400'>
                  Last Modified
                </span>
                <span
                  className='text-sm text-neutral-900 dark:text-neutral-100'
                  title={formatDetailDate(case_.lastModified)}
                >
                  {getRelativeTime(case_.lastModified)}
                </span>
              </div>
            </div>
          </div>

          <hr className='border-neutral-200 dark:border-neutral-700' />

          <div>
            <h3 className='mb-3 text-xs font-bold tracking-wider text-neutral-700 uppercase dark:text-neutral-300'>
              Linked Libraries ({linkedLibraries.length})
            </h3>
            {linkedLibraries.length > 0 ? (
              <div className='overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700'>
                <table className='w-full text-sm'>
                  <thead className='border-b border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800'>
                    <tr>
                      <th className='px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400'>
                        Library ID
                      </th>
                      <th className='px-4 py-2.5 text-left text-xs font-semibold tracking-wider text-neutral-400'>
                        Type
                      </th>
                      <th className='px-4 py-2.5 text-right text-xs font-semibold tracking-wider text-neutral-400'>
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-neutral-100 dark:divide-neutral-700'>
                    {linkedLibraries.map((lib) => (
                      <tr key={lib.id} className='hover:bg-neutral-50 dark:hover:bg-neutral-800/50'>
                        <td className='px-4 py-3'>
                          <span className='inline-flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300'>
                            <Link2 className='h-3.5 w-3.5' />
                            {lib.name}
                          </span>
                        </td>
                        <td className='px-4 py-3 text-neutral-600 dark:text-neutral-400'>
                          {lib.type}
                        </td>
                        <td className='px-4 py-3 text-right'>
                          <PillTag
                            variant={
                              lib.status === 'ready'
                                ? 'green'
                                : lib.status === 'processing'
                                  ? 'blue'
                                  : 'red'
                            }
                            size='sm'
                          >
                            {lib.status === 'ready'
                              ? 'Pass'
                              : lib.status === 'processing'
                                ? 'Running'
                                : 'Fail'}
                          </PillTag>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:bg-neutral-800'>
                No linked libraries
              </div>
            )}
          </div>
        </div>

        <div className='border-t border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <button
            onClick={() => void navigate(`/cases/${case_.id}`)}
            className='flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700'
          >
            Go to Case Detail
            <ArrowRight className='h-4 w-4' />
          </button>
        </div>
      </div>
    </div>
  );
}
