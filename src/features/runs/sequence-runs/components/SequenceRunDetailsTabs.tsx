import { Tabs, type Tab } from '@/components/ui/Tabs';
import {
  useSequenceRunDetailsTab,
  SequenceRunDetailsTabValues,
} from '../hooks/useSequenceRunDetailsTab';
import { useSequenceRunDetailsContext } from '../context/SequenceRunDetailsContext';

export const SequenceRunDetailsTabs = () => {
  const { activeTab, setActiveTab } = useSequenceRunDetailsTab();

  const { sequenceRunData, isLoadingSequenceRun } = useSequenceRunDetailsContext();

  const isLoading = isLoadingSequenceRun || !sequenceRunData;

  const tabs: Tab[] = [
    { id: SequenceRunDetailsTabValues.Timeline, label: 'Timeline' },
    {
      id: SequenceRunDetailsTabValues.SampleSheets,
      label: 'Sample Sheets',
      count: isLoading ? undefined : sequenceRunData.length,
    },
    {
      id: SequenceRunDetailsTabValues.RelatedLibraries,
      label: 'Related Libraries',
    },
  ];

  return (
    <div className='mt-4 mb-6'>
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
