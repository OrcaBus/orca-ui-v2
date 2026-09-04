import { CaseDetailsLinkedSequenceRunsTab } from './CaseDetailsLinkedSequenceRunsTab';
import { CaseDetailsLinkedWorkflowRunsTab } from './CaseDetailsLinkedWorkflowRunsTab';

/**
 * Combined Runs tab: sequence runs and workflow runs stacked vertically, each
 * section keeping its own header, link/unlink affordances, and table so the
 * two run types stay independent while sharing a single "Runs" tab entry.
 */
export function CaseDetailsRunsTab() {
  return (
    <div className='flex flex-col gap-8'>
      <CaseDetailsLinkedSequenceRunsTab />
      <CaseDetailsLinkedWorkflowRunsTab />
    </div>
  );
}
