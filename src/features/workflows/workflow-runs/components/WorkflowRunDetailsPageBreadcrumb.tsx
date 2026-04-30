import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';

export const WorkflowRunDetailsPageBreadcrumb: React.FC = () => {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();

  return (
    <PageBreadcrumb
      items={[
        { label: 'Workflows', href: '/workflows' },
        { label: 'Workflow Runs', href: '/workflows' },
        {
          label: workflowRunDetail?.workflowRunName || 'Loading...',
          isLoading: isLoadingWorkflowRunDetail,
        },
      ]}
    />
  );
};
export default WorkflowRunDetailsPageBreadcrumb;
