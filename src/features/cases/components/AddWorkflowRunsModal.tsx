import { Plus, Search } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { formatTableDate } from '../../../utils/timeFormat';
import type { WorkflowRun } from '../api/cases.api';

interface AddWorkflowRunsModalProps {
  isOpen: boolean;
  searchQuery: string;
  selectedIds: string[];
  availableWorkflows: WorkflowRun[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onToggleWorkflow: (workflowId: string) => void;
  onConfirm: () => void;
}

export function AddWorkflowRunsModal({
  isOpen,
  searchQuery,
  selectedIds,
  availableWorkflows,
  onClose,
  onSearchChange,
  onToggleWorkflow,
  onConfirm,
}: AddWorkflowRunsModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={onClose} />

      <div className='relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-[#111418]'>
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Add Workflow Runs
          </h2>
        </div>

        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder='Search by workflow run name or ID...'
              className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-100 dark:placeholder:text-[#9dabb9] dark:focus:ring-blue-500'
            />
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-6'>
          {availableWorkflows.length > 0 ? (
            <div className='space-y-2'>
              {availableWorkflows.map((run) => (
                <label
                  key={run.id}
                  className='flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-[#1e252e]'
                >
                  <input
                    type='checkbox'
                    checked={selectedIds.includes(run.id)}
                    onChange={() => onToggleWorkflow(run.id)}
                    className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600'
                  />
                  <div className='flex-1'>
                    <div className='text-sm text-neutral-900 dark:text-neutral-100'>{run.name}</div>
                    <div className='mt-1 flex items-center gap-2'>
                      <PillTag variant='purple' size='sm'>
                        {run.workflowType}
                      </PillTag>
                      <PillTag
                        variant={
                          run.status === 'succeeded'
                            ? 'green'
                            : run.status === 'ongoing'
                              ? 'blue'
                              : run.status === 'failed'
                                ? 'red'
                                : 'amber'
                        }
                        size='sm'
                      >
                        {run.status}
                      </PillTag>
                      <span className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                        {formatTableDate(run.startTime)}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className='py-8 text-center'>
              <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
                No workflow runs available to add.
              </p>
            </div>
          )}
        </div>

        <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-[#1e252e]'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
              {selectedIds.length} {selectedIds.length === 1 ? 'run' : 'runs'} selected
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={onClose}
                className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-[#111418] dark:text-neutral-200 dark:hover:bg-neutral-700/50'
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={selectedIds.length === 0}
                className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
              >
                <Plus className='h-4 w-4' />
                Add {selectedIds.length > 0 && `(${selectedIds.length})`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
