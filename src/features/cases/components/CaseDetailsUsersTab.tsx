import { useState } from 'react';
import { useParams } from 'react-router';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type CaseUserLinkModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { CaseDetailsAddUserModal } from './CaseDetailsAddUserModal';
import { CaseDetailsRemoveUserModal } from './CaseDetailsRemoveUserModal';
import { CaseDetailsUsersTable } from './CaseDetailsUsersTable';

type RemoveTarget = { userOrcabusId: string; userEmail: string };

export function CaseDetailsUsersTab() {
  const { caseDetail, refresh } = useCaseDetailsContext();
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null);

  const users: CaseUserLinkModel[] = caseDetail?.userSet ?? [];

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>Case Users</h3>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <UserPlus />
          Add User
        </Button>
      </div>

      <CaseDetailsUsersTable
        users={users}
        onRemoveUser={(userOrcabusId, userEmail) => setRemoveTarget({ userOrcabusId, userEmail })}
      />

      <CaseDetailsAddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refresh}
      />

      <CaseDetailsRemoveUserModal
        isOpen={!!caseOrcabusId && removeTarget !== null}
        caseOrcabusId={caseOrcabusId ?? ''}
        userOrcabusId={removeTarget?.userOrcabusId ?? ''}
        userEmail={removeTarget?.userEmail ?? null}
        onClose={() => setRemoveTarget(null)}
        onSuccess={() => {
          setRemoveTarget(null);
          refresh();
        }}
      />
    </>
  );
}
