import { useMemo, useRef, useEffect } from 'react';
import { useParams } from 'react-router';
import { useAppShellHeader } from '@/context/app-shell-context';
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
import {
  SequenceRunDetailsProvider,
  useSequenceRunDetailsContext,
} from '../context/SequenceRunDetailsContext';

function SequenceRunDetailsAppShellHeader() {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();
  const { isLoadingSequenceRun } = useSequenceRunDetailsContext();
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Runs', href: '/runs' },
        { label: 'Sequence Runs', href: '/runs/sequence-runs' },
        {
          label: instrumentRunId ?? 'Loading...',
          isLoading: isLoadingSequenceRun,
        },
      ],
    }),
    [instrumentRunId, isLoadingSequenceRun]
  );

  useAppShellHeader(headerConfig);
  return null;
}

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
      <SequenceRunDetailsAppShellHeader />
      <div className='px-6'>
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
