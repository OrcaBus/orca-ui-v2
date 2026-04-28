import { Tabs, type Tab } from '@/components/ui/Tabs';
import {
  useAnalysisRunDetailTab,
  type AnalysisRunDetailTabId,
} from '../hooks/useAnalysisRunDetailTab';
import { useAnalysisRunDetailContext } from '../context/AnalysisRunDetailContext';

export const AnalysisRunDetailTabs = () => {
  const { activeTab, setActiveTab } = useAnalysisRunDetailTab();
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailContext();

  const isLoading = isLoadingAnalysisRunDetail || !analysisRunDetail;

  const tabs: Tab[] = [
    {
      id: 'timeline' satisfies AnalysisRunDetailTabId,
      label: 'Timeline',
    },
    {
      id: 'workflow-runs' satisfies AnalysisRunDetailTabId,
      label: 'Workflow Runs',
    },
    {
      id: 'libraries' satisfies AnalysisRunDetailTabId,
      label: 'Libraries',
      count: isLoading ? undefined : analysisRunDetail.libraries.length,
    },
    {
      id: 'run-context' satisfies AnalysisRunDetailTabId,
      label: 'Run Context',
      count: isLoading ? undefined : analysisRunDetail.contexts.length,
    },
    {
      id: 'readsets' satisfies AnalysisRunDetailTabId,
      label: 'Readsets',
      count: isLoading ? undefined : analysisRunDetail.readsets.length,
    },
  ];

  return (
    <div className='mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
