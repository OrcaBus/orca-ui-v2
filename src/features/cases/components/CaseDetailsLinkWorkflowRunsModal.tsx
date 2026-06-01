import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Link as LinkIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useWorkflowRunListModel } from '@/features/runs/api/workflows.api';
import { useCaseExternalEntityCreateModel } from '../api/cases.api';

export interface CaseDetailsLinkWorkflowRunsModalProps {
  isOpen: boolean;
  alreadyLinkedIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export function CaseDetailsLinkWorkflowRunsModal({
  isOpen,
  alreadyLinkedIds,
  onClose,
  onSuccess,
}: CaseDetailsLinkWorkflowRunsModalProps) {
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const linkMutation = useCaseExternalEntityCreateModel();

  const { data: searchData, isLoading: isSearching } = useWorkflowRunListModel({
    params: {
      query: {
        search: searchQuery || undefined,
        rowsPerPage: 20,
      },
    },
    reactQuery: {
      enabled: !!searchQuery,
    },
  });

  const availableRuns = useMemo(
    () => (searchData?.results ?? []).filter((run) => !alreadyLinkedIds.includes(run.orcabusId)),
    [searchData, alreadyLinkedIds]
  );

  const handleToggle = (orcabusId: string) => {
    setSelectedIds((prev) =>
      prev.includes(orcabusId) ? prev.filter((id) => id !== orcabusId) : [...prev, orcabusId]
    );
  };

  const handleClose = () => {
    setSearchQuery('');
    setSelectedIds([]);
    onClose();
  };

  const handleConfirm = async () => {
    if (!caseOrcabusId || selectedIds.length === 0) return;
    setIsSubmitting(true);
    try {
      await Promise.all(
        selectedIds.map((wfrOrcabusId) =>
          linkMutation.mutateAsync({
            params: { path: { orcabusId: caseOrcabusId } },
            body: { externalEntity: wfrOrcabusId },
          })
        )
      );
      toast.success(
        `${selectedIds.length} workflow ${selectedIds.length === 1 ? 'run' : 'runs'} linked`
      );
      onSuccess();
    } catch {
      toast.error('Failed to link workflow runs');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />
      <div className='relative flex max-h-[80vh] w-full max-w-2xl flex-col rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-[#111418]'>
        {/* Header */}
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <h2 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Link Workflow Runs
          </h2>
          <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
            Search for workflow runs by name, portal run ID, or workflow to link to this case.
          </p>
        </div>

        {/* Search */}
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <div className='relative'>
            <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search by workflow run name, portal run ID...'
              className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-100 dark:placeholder:text-[#9dabb9] dark:focus:ring-blue-500'
            />
          </div>
        </div>

        {/* Results */}
        <div className='flex-1 overflow-y-auto p-6'>
          {!searchQuery ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              Start typing to search for workflow runs.
            </p>
          ) : isSearching ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              Searching...
            </p>
          ) : availableRuns.length === 0 ? (
            <p className='py-6 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'>
              No workflow runs found matching your search.
            </p>
          ) : (
            <div className='space-y-2'>
              {availableRuns.map((run) => (
                <label
                  key={run.orcabusId}
                  className='flex cursor-pointer items-center gap-3 rounded-md border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-[#1e252e]'
                >
                  <input
                    type='checkbox'
                    checked={selectedIds.includes(run.orcabusId)}
                    onChange={() => handleToggle(run.orcabusId)}
                    className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-neutral-600'
                  />
                  <div className='flex-1'>
                    <div className='font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                      {run.workflowRunName ?? run.portalRunId}
                    </div>
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                        {run.workflow.name}
                      </span>
                      {run.currentState && <StatusBadge status={run.currentState.status} />}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-700 dark:bg-[#1e252e]'>
          <div className='flex items-center justify-between'>
            <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
              {selectedIds.length} workflow {selectedIds.length === 1 ? 'run' : 'runs'} selected
            </p>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-600 dark:bg-[#111418] dark:text-neutral-200 dark:hover:bg-neutral-700/50'
              >
                Cancel
              </button>
              <button
                onClick={() => void handleConfirm()}
                disabled={selectedIds.length === 0 || isSubmitting}
                className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
              >
                <LinkIcon className='h-4 w-4' />
                {isSubmitting
                  ? 'Linking...'
                  : `Link${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
