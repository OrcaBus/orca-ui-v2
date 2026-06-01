import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';

export const WorkflowRunDetailsPageBreadcrumb: React.FC = () => {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Runs', href: '/runs' },
        { label: 'Workflow Runs', href: '/runs/workflow-runs' },
        {
          label: workflowRunDetail?.workflowRunName || 'Loading...',
          isLoading: isLoadingWorkflowRunDetail,
        },
      ]}
    />
  );
};
export default WorkflowRunDetailsPageBreadcrumb;
