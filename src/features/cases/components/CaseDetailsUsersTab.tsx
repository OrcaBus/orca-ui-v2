import { useState } from 'react';
import { useParams } from 'react-router';
import { UserPlus } from 'lucide-react';
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
        <button
          onClick={() => setIsAddModalOpen(true)}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <UserPlus className='h-4 w-4' />
          Add User
        </button>
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

      {caseOrcabusId && removeTarget && (
        <CaseDetailsRemoveUserModal
          isOpen
          caseOrcabusId={caseOrcabusId}
          userOrcabusId={removeTarget.userOrcabusId}
          userEmail={removeTarget.userEmail}
          onClose={() => setRemoveTarget(null)}
          onSuccess={() => {
            setRemoveTarget(null);
            refresh();
          }}
        />
      )}
    </>
  );
}
