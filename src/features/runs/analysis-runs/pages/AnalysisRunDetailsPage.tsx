/**
 * Analysis Run Details Page
 *
 * Tab selection is driven by the `tab` query param (e.g. ?tab=libraries).
 */

import { useMemo, useRef, useEffect } from 'react';
import { useAppShellHeader } from '@/context/app-shell-context';
import {
  AnalysisRunDetailsPageHeader,
  AnalysisRunDetailsOverviewCard,
  AnalysisRunDetailsTabs,
  AnalysisRunDetailsTimeline,
  AnalysisRunDetailsWorkflowRunsTable,
  AnalysisRunDetailsLibrariesTable,
  AnalysisRunDetailsRunContextTable,
  AnalysisRunDetailsReadsetsTable,
} from '../components';
import {
  AnalysisRunDetailsProvider,
  useAnalysisRunDetailsContext,
} from '../context/AnalysisRunDetailsContext';
import { useAnalysisRunDetailsTab } from '../hooks/useAnalysisRunDetailsTab';

function AnalysisRunDetailsAppShellHeader() {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Runs', href: '/runs' },
        { label: 'Analysis Runs', href: '/runs/analysis-runs' },
        {
          label: analysisRunDetail?.analysisRunName || 'Loading...',
          isLoading: isLoadingAnalysisRunDetail,
        },
      ],
    }),
    [analysisRunDetail?.analysisRunName, isLoadingAnalysisRunDetail]
  );

  useAppShellHeader(headerConfig);
  return null;
}

export function AnalysisRunDetailsPage() {
  const { activeTab } = useAnalysisRunDetailsTab();

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
    <AnalysisRunDetailsProvider>
      <AnalysisRunDetailsAppShellHeader />
      <div className='px-6'>
        <AnalysisRunDetailsPageHeader />
        <AnalysisRunDetailsOverviewCard />

        {/* Tabs - selection synced to ?tab= query param */}
        <div ref={tabsRef}>
          <AnalysisRunDetailsTabs />
        </div>
        {/* Tab Content */}
        {activeTab === 'timeline' && <AnalysisRunDetailsTimeline />}
        {activeTab === 'workflow-runs' && <AnalysisRunDetailsWorkflowRunsTable />}
        {activeTab === 'libraries' && <AnalysisRunDetailsLibrariesTable />}
        {activeTab === 'run-context' && <AnalysisRunDetailsRunContextTable />}
        {activeTab === 'readsets' && <AnalysisRunDetailsReadsetsTable />}
      </div>
    </AnalysisRunDetailsProvider>
  );
}
