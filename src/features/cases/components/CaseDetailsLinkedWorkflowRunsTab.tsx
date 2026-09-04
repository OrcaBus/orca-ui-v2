import { useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCaseUnlinkEntityModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { useCaseLinkedWorkflowRuns } from '../hooks/useCaseLinkedWorkflowRuns';
import { CaseDetailsLinkedWorkflowRunFilesTable } from './CaseDetailsLinkedWorkflowRunFilesTable';
import { CaseDetailsLinkWorkflowRunsModal } from './CaseDetailsLinkWorkflowRunsModal';
import { CaseDetailsUnlinkEntityModal } from './CaseDetailsUnlinkEntityModal';
import { CaseDetailsLinkedWorkflowRunsTable } from './CaseDetailsLinkedWorkflowRunsTable';
import { submitCaseUnlink, type CaseUnlinkTarget } from '../utils/caseUnlink';

export function CaseDetailsLinkedWorkflowRunsTab() {
  const { refresh } = useCaseDetailsContext();
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();
  const { wfrOrcabusIdArray, linkedWorkflowRuns, isLoading, isRefetching, isError } =
    useCaseLinkedWorkflowRuns();

  const [selectedPortalRunId, setSelectedPortalRunId] = useState<string | null>(null);
  const [unlinkTarget, setUnlinkTarget] = useState<CaseUnlinkTarget | null>(null);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  const unlinkMutation = useCaseUnlinkEntityModel();

  const handleConfirmUnlink = () => {
    submitCaseUnlink({
      caseOrcabusId,
      target: unlinkTarget,
      mutate: unlinkMutation.mutate,
      onSuccess: () => {
        toast.success('Workflow run unlinked');
        setUnlinkTarget(null);
        setSelectedPortalRunId(null);
        refresh();
      },
      onError: () => {
        toast.error('Failed to unlink workflow run');
      },
    });
  };

  const selectedRun = useMemo(
    () => linkedWorkflowRuns.find((run) => run.portalRunId === selectedPortalRunId),
    [linkedWorkflowRuns, selectedPortalRunId]
  );

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
          Linked Workflow Runs
        </h3>
        <Button onClick={() => setIsLinkModalOpen(true)}>
          <LinkIcon />
          Link Workflow Runs
        </Button>
      </div>

      {selectedPortalRunId && selectedRun ? (
        <div className='space-y-3'>
          <Button
            variant='ghost'
            type='button'
            onClick={() => setSelectedPortalRunId(null)}
            className='inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
          >
            <ArrowLeft className='h-3.5 w-3.5' aria-hidden='true' />
            Back to workflow runs
          </Button>

          <CaseDetailsLinkedWorkflowRunFilesTable portalRunId={selectedRun.portalRunId} />
        </div>
      ) : (
        <CaseDetailsLinkedWorkflowRunsTable
          runs={linkedWorkflowRuns}
          isLoading={isLoading || isRefetching}
          emptyDescription={
            isError
              ? 'Unable to load linked workflow runs.'
              : 'No workflow runs have been linked to this case yet.'
          }
          onViewFiles={setSelectedPortalRunId}
          onUnlink={(run) =>
            setUnlinkTarget({
              type: 'workflow run',
              orcabusId: run.orcabusId,
              label: run.workflowRunName ?? run.portalRunId,
            })
          }
          unlinkIsPending={unlinkMutation.isPending}
        />
      )}

      <CaseDetailsUnlinkEntityModal
        isOpen={unlinkTarget !== null}
        target={unlinkTarget}
        isPending={unlinkMutation.isPending}
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={handleConfirmUnlink}
      />

      <CaseDetailsLinkWorkflowRunsModal
        isOpen={isLinkModalOpen}
        alreadyLinkedIds={wfrOrcabusIdArray}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={() => {
          setIsLinkModalOpen(false);
          refresh();
        }}
      />
    </>
  );
}
