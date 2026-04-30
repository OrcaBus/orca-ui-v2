import { useRef, useEffect } from 'react';
import {
  SequenceRunDetailsPageHeader,
  SequenceRunDetailsOverviewCard,
  SequenceRunDetailsTabs,
  SequenceRunDetailsTimeline,
  SequenceRunDetailsLibrariesTable,
  SequenceRunDetailsSampleSheetsTab,
} from '../components';
import {
  useSequenceRunDetailsTab,
  SequenceRunDetailsTabValues,
} from '../hooks/useSequenceRunDetailsTab';
import { SequenceRunDetailsProvider } from '../context/SequenceRunDetailsContext';

export function SequenceRunDetailsPage() {
  const { activeTab } = useSequenceRunDetailsTab();

  const tabsRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [activeTab]);

  return (
    <SequenceRunDetailsProvider>
      <div className='p-6'>
        <SequenceRunDetailsPageHeader />
        <SequenceRunDetailsOverviewCard />

        {/* Tabs */}
        <div ref={tabsRef}>
          <SequenceRunDetailsTabs />
        </div>

        <div>
          {activeTab === SequenceRunDetailsTabValues.Timeline && <SequenceRunDetailsTimeline />}
          {activeTab === SequenceRunDetailsTabValues.SampleSheets && (
            <SequenceRunDetailsSampleSheetsTab />
          )}
          {activeTab === SequenceRunDetailsTabValues.RelatedLibraries && (
            <SequenceRunDetailsLibrariesTable />
          )}
        </div>
      </div>
    </SequenceRunDetailsProvider>
  );
}
