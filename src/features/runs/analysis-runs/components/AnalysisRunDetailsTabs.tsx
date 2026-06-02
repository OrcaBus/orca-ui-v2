import { Tabs, type Tab } from '@/components/ui/Tabs';
import {
  useAnalysisRunDetailsTab,
  type AnalysisRunDetailsTabId,
} from '../hooks/useAnalysisRunDetailsTab';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';

export const AnalysisRunDetailsTabs = () => {
  const { activeTab, setActiveTab } = useAnalysisRunDetailsTab();
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();

  const isLoading = isLoadingAnalysisRunDetail || !analysisRunDetail;

  const tabs: Tab[] = [
    {
      id: 'timeline' satisfies AnalysisRunDetailsTabId,
      label: 'Timeline',
    },
    {
      id: 'workflow-runs' satisfies AnalysisRunDetailsTabId,
      label: 'Workflow Runs',
    },
    {
      id: 'libraries' satisfies AnalysisRunDetailsTabId,
      label: 'Libraries',
      count: isLoading ? undefined : analysisRunDetail.libraries.length,
    },
    {
      id: 'run-context' satisfies AnalysisRunDetailsTabId,
      label: 'Run Context',
      count: isLoading ? undefined : analysisRunDetail.contexts.length,
    },
    {
      id: 'readsets' satisfies AnalysisRunDetailsTabId,
      label: 'Readsets',
      count: isLoading ? undefined : analysisRunDetail.readsets.length,
    },
  ];

  return (
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
