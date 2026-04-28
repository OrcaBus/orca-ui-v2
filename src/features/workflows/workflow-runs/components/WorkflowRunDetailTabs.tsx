import { Tabs, type Tab } from '@/components/ui/Tabs';
import {
  useWorkflowRunDetailTab,
  WorkflowRunDetailTabValues,
} from '../hooks/useWorkflowRunDetailTab';
import { useWorkflowRunDetailContext } from '../context/WorkflowRunDetailContext';

export const WorkflowRunDetailTabs = () => {
  const { activeTab, setActiveTab } = useWorkflowRunDetailTab();

  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailContext();

  const isLoading = isLoadingWorkflowRunDetail || !workflowRunDetail;

  const tabs: Tab[] = [
    { id: WorkflowRunDetailTabValues.Timeline, label: 'Timeline' },
    {
      id: WorkflowRunDetailTabValues.Libraries,
      label: 'Libraries',
      count: isLoading ? undefined : workflowRunDetail.libraries.length,
    },
    {
      id: WorkflowRunDetailTabValues.RunContext,
      label: 'Run Context',
      count: isLoading ? undefined : workflowRunDetail.contexts.length,
    },
    {
      id: WorkflowRunDetailTabValues.Readsets,
      label: 'Readsets',
      count: isLoading ? undefined : workflowRunDetail.readsets.length,
    },
  ];

  return (
    <div className='mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
