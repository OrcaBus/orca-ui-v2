import { Input } from '@/components/ui/Input';
import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Link as LinkIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { useWorkflowRunListModel } from '@/features/runs/shared/api/workflows.api';
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
      enabled: isOpen && !!searchQuery,
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

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title='Link Workflow Runs'
      description='Search for workflow runs by name, portal run ID, or workflow to link to this case.'
      icon={<LinkIcon className='h-5 w-5' />}
      size='xl'
      closeDisabled={isSubmitting}
      panelClassName='flex flex-col'
      panelStyle={{ maxHeight: 'min(80vh, 720px)' }}
      bodyClassName='flex min-h-0 flex-1 flex-col space-y-0 p-0'
      footer={
        <div className='flex w-full items-center justify-between'>
          <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
            {selectedIds.length} workflow {selectedIds.length === 1 ? 'run' : 'runs'} selected
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              type='button'
              onClick={handleClose}
              disabled={isSubmitting}
              className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-200 dark:hover:bg-[#2d3540]'
            >
              Cancel
            </Button>
            <Button
              type='button'
              onClick={() => void handleConfirm()}
              disabled={selectedIds.length === 0 || isSubmitting}
            >
              <LinkIcon />
              {isSubmitting
                ? 'Linking...'
                : `Link${selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}`}
            </Button>
          </div>
        </div>
      }
    >
      {/* Search */}
      <div className='shrink-0 border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
        <div className='relative'>
          <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
          <Input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search by workflow run name, portal run ID...'
            className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-100 dark:placeholder:text-[#9dabb9] dark:focus:ring-blue-500'
          />
        </div>
      </div>

      {/* Results */}
      <div className='min-h-0 flex-1 overflow-y-auto p-6'>
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
                <Input
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
    </DialogFrame>
  );
}
