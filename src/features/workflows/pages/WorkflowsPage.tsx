import { Tabs } from '@/components/ui/Tabs';
import { useWorkflowsTab } from '../shared/hooks/useWorkflowsTab';
import { WorkflowRunsPage } from '../workflow-runs/pages/WorkflowRunsPage';
import { AnalysisRunsPage } from '../analysis-runs/pages/AnalysisRunsPage';
import { WorkflowTypesPage } from '../workflow-types/pages/WorkflowTypesPage';
import { AnalysisTypesPage } from '../analysis-types/pages/AnalysisTypesPage';

const TABS = [
  { id: 'workflowRuns', label: 'Workflow Runs' },
  { id: 'analysisRuns', label: 'Analysis Runs' },
  { id: 'workflowTypes', label: 'Workflow Types' },
  { id: 'analysisTypes', label: 'Analysis Types' },
];

export function WorkflowsPage() {
  const { activeTab, setActiveTab } = useWorkflowsTab();

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='mb-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
          Workflows
        </h1>
        <p className='text-sm text-neutral-600 dark:text-neutral-400'>
          Monitor workflow runs and analysis runs, and browse workflow and analysis types.
        </p>
      </div>

      <div className='mb-6'>
        <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'workflowRuns' && <WorkflowRunsPage />}
      {activeTab === 'analysisRuns' && <AnalysisRunsPage />}
      {activeTab === 'workflowTypes' && <WorkflowTypesPage />}
      {activeTab === 'analysisTypes' && <AnalysisTypesPage />}
    </div>
  );
}
