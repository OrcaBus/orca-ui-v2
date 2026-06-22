import { Tabs, type Tab } from '@/components/ui/Tabs';
import { useLibraryDetailsTab, LibraryDetailsTabValues } from '../hooks/useLibraryDetailsTab';

export const LibraryDetailsTabs = () => {
  const { activeTab, setActiveTab } = useLibraryDetailsTab();

  const tabs: Tab[] = [
    { id: LibraryDetailsTabValues.WorkflowRuns, label: 'Workflow Runs' },
    { id: LibraryDetailsTabValues.RelatedLibraries, label: 'Related Libraries' },
    { id: LibraryDetailsTabValues.History, label: 'History' },
  ];

  return (
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
