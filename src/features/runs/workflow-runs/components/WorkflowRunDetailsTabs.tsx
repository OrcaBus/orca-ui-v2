import { Tabs, type Tab } from '@/components/ui/Tabs';
import {
  useWorkflowRunDetailsTab,
  WorkflowRunDetailsTabValues,
} from '../hooks/useWorkflowRunDetailsTab';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';

export const WorkflowRunDetailsTabs = () => {
  const { activeTab, setActiveTab } = useWorkflowRunDetailsTab();

  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();

  const isLoading = isLoadingWorkflowRunDetail || !workflowRunDetail;

  const tabs: Tab[] = [
    { id: WorkflowRunDetailsTabValues.Timeline, label: 'Timeline' },
    {
      id: WorkflowRunDetailsTabValues.Libraries,
      label: 'Libraries',
      count: isLoading ? undefined : workflowRunDetail.libraries.length,
    },
    {
      id: WorkflowRunDetailsTabValues.RunContext,
      label: 'Run Context',
      count: isLoading ? undefined : workflowRunDetail.contexts.length,
    },
    {
      id: WorkflowRunDetailsTabValues.Readsets,
      label: 'Readsets',
      count: isLoading ? undefined : workflowRunDetail.readsets.length,
    },
  ];

  return (
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
