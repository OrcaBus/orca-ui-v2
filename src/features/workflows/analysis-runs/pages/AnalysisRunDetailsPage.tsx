/**
 * Analysis Run Details Page
 *
 * Tab selection is driven by the `tab` query param (e.g. ?tab=libraries).
 */

import { useRef, useEffect } from 'react';
import {
  AnalysisRunDetailsPageBreadcrumb,
  AnalysisRunDetailsPageHeader,
  AnalysisRunDetailsOverviewCard,
  AnalysisRunDetailsTabs,
  AnalysisRunDetailsTimeline,
  AnalysisRunDetailsWorkflowRunsTable,
  AnalysisRunDetailsLibrariesTable,
  AnalysisRunDetailsRunContextTable,
  AnalysisRunDetailsReadsetsTable,
} from '../components';
import { AnalysisRunDetailsProvider } from '../context/AnalysisRunDetailsContext';
import { useAnalysisRunDetailsTab } from '../hooks/useAnalysisRunDetailsTab';

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
      <div className='p-6'>
        <AnalysisRunDetailsPageBreadcrumb />
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
