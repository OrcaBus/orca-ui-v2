import { PageBreadcrumb } from '@/components/ui/PageBreadcrumb';
import { useWorkflowRunDetailContext } from '../context/WorkflowRunDetailContext';

export const WorkflowRunDetailPageBreadcrumb: React.FC = () => {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailContext();

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
export default WorkflowRunDetailPageBreadcrumb;
