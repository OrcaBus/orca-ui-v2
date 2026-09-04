import { useState } from 'react';
import { useParams } from 'react-router';
import { Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { Button } from '@/components/ui/Button';
import { useCaseUnlinkEntityModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { useCaseLinkedSequenceRuns } from '../hooks/useCaseLinkedSequenceRuns';
import { CaseDetailsLinkSequenceRunsModal } from './CaseDetailsLinkSequenceRunsModal';
import { CaseDetailsLinkedSequenceRunsTable } from './CaseDetailsLinkedSequenceRunsTable';
import { CaseDetailsUnlinkEntityModal } from './CaseDetailsUnlinkEntityModal';
import { submitCaseUnlink, type CaseUnlinkTarget } from '../utils/caseUnlink';

export function CaseDetailsLinkedSequenceRunsTab() {
  const { refresh } = useCaseDetailsContext();
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();

  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<CaseUnlinkTarget | null>(null);

  const {
    sequenceRunOrcabusIdArray,
    linkedSequenceRuns,
    isLoading: isLoadingSequenceRuns,
    isRefetching: isRefetchingSequenceRuns,
    isError: isErrorSequenceRuns,
    error: sequenceRunsError,
    refetch: refetchSequenceRuns,
  } = useCaseLinkedSequenceRuns();

  const unlinkMutation = useCaseUnlinkEntityModel();

  const handleConfirmUnlink = () => {
    submitCaseUnlink({
      caseOrcabusId,
      target: unlinkTarget,
      mutate: unlinkMutation.mutate,
      onSuccess: () => {
        toast.success('Sequence run unlinked');
        setUnlinkTarget(null);
        refresh();
      },
      onError: () => {
        toast.error('Failed to unlink sequence run');
      },
    });
  };

  const topBar = (
    <div className='mb-2 flex items-center justify-between'>
      <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
        Linked Sequence Runs
      </h3>
      <Button onClick={() => setIsLinkModalOpen(true)}>
        <LinkIcon />
        Link Sequence Runs
      </Button>
    </div>
  );

  const linkModal = (
    <CaseDetailsLinkSequenceRunsModal
      isOpen={isLinkModalOpen}
      alreadyLinkedIds={sequenceRunOrcabusIdArray}
      onClose={() => setIsLinkModalOpen(false)}
      onSuccess={() => {
        setIsLinkModalOpen(false);
        refresh();
      }}
    />
  );

  if (isErrorSequenceRuns) {
    return (
      <>
        {topBar}
        <ApiErrorState error={sequenceRunsError} onRetry={() => void refetchSequenceRuns()} />
        {linkModal}
      </>
    );
  }

  return (
    <>
      {topBar}

      <CaseDetailsLinkedSequenceRunsTable
        runs={linkedSequenceRuns}
        isLoading={isLoadingSequenceRuns || isRefetchingSequenceRuns}
        emptyDescription={
          sequenceRunOrcabusIdArray.length === 0
            ? 'No sequence runs have been linked to this case yet.'
            : 'No sequence runs found.'
        }
        onUnlink={(run) =>
          setUnlinkTarget({
            type: 'sequence run',
            orcabusId: run.orcabusId,
            label: run.sequenceRunId,
          })
        }
        unlinkIsPending={unlinkMutation.isPending}
      />

      {linkModal}
      <CaseDetailsUnlinkEntityModal
        isOpen={unlinkTarget !== null}
        target={unlinkTarget}
        isPending={unlinkMutation.isPending}
        onCancel={() => setUnlinkTarget(null)}
        onConfirm={handleConfirmUnlink}
      />
    </>
  );
}
