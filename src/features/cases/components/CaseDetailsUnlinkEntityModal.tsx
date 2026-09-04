import { useId } from 'react';
import { Unlink } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';
import type { CaseUnlinkTarget } from '../utils/caseUnlink';

interface CaseDetailsUnlinkEntityModalProps {
  isOpen: boolean;
  target: CaseUnlinkTarget | null;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function titleCaseEntity(type: CaseUnlinkTarget['type']) {
  switch (type) {
    case 'library':
      return 'Library';
    case 'sample':
      return 'Sample';
    case 'sequence run':
      return 'Sequence Run';
    default:
      return 'Workflow Run';
  }
}

export function CaseDetailsUnlinkEntityModal({
  isOpen,
  target,
  isPending,
  onCancel,
  onConfirm,
}: CaseDetailsUnlinkEntityModalProps) {
  const shownTarget = useLastPresent(target);
  const entityTitle = shownTarget ? titleCaseEntity(shownTarget.type) : 'Entity';
  const entityLabel = shownTarget?.label ?? '';
  const entityType = shownTarget?.type ?? 'entity';
  const pendingStatusId = useId();

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onCancel}
      title={`Unlink ${entityTitle}`}
      description='Remove this relationship from the case?'
      icon={<Unlink className='h-5 w-5' aria-hidden='true' />}
      size='sm'
      closeDisabled={isPending}
      footer={
        <>
          <Button type='button' variant='outline' onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={isPending || !shownTarget}
            aria-label={`Confirm unlink ${entityType} ${entityLabel}`}
            aria-busy={isPending}
            aria-describedby={isPending ? pendingStatusId : undefined}
          >
            <Unlink className='h-4 w-4' aria-hidden='true' />
            {isPending ? 'Unlinking…' : 'Unlink'}
          </Button>
          {isPending && (
            <span id={pendingStatusId} className='sr-only' role='status' aria-live='polite'>
              Unlinking {entityType} {entityLabel}
            </span>
          )}
        </>
      }
    >
      <div className='space-y-3'>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          Unlink{' '}
          <strong className='font-medium text-neutral-900 dark:text-white'>{entityLabel}</strong>{' '}
          from this case?
        </p>
        <p className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
          This removes only the case relationship and will not delete the {entityType}.
        </p>
      </div>
    </DialogFrame>
  );
}
