/**
 * Analysis Run Detail Page
 *
 * Tab selection is driven by the `tab` query param (e.g. ?tab=libraries).
 */

import { useRef, useEffect } from 'react';
import {
  AnalysisRunDetailPageBreadcrumb,
  AnalysisRunDetailPageHeader,
  AnalysisRunDetailOverviewCard,
  AnalysisRunDetailTabs,
  AnalysisRunDetailTimeline,
  AnalysisRunDetailWorkflowRunsTable,
  AnalysisRunDetailLibrariesTable,
  AnalysisRunDetailRunContextTable,
  AnalysisRunDetailReadsetsTable,
} from '../components';
import { AnalysisRunDetailProvider } from '../context/AnalysisRunDetailContext';
import { useAnalysisRunDetailTab } from '../hooks/useAnalysisRunDetailTab';

export function AnalysisRunDetailPage() {
  const { activeTab } = useAnalysisRunDetailTab();

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
    <AnalysisRunDetailProvider>
      <div className='p-6'>
        <AnalysisRunDetailPageBreadcrumb />
        <AnalysisRunDetailPageHeader />
        <AnalysisRunDetailOverviewCard />

        {/* Tabs - selection synced to ?tab= query param */}
        <div ref={tabsRef}>
          <AnalysisRunDetailTabs />
        </div>
        {/* Tab Content */}
        {activeTab === 'timeline' && <AnalysisRunDetailTimeline />}
        {activeTab === 'workflow-runs' && <AnalysisRunDetailWorkflowRunsTable />}
        {activeTab === 'libraries' && <AnalysisRunDetailLibrariesTable />}
        {activeTab === 'run-context' && <AnalysisRunDetailRunContextTable />}
        {activeTab === 'readsets' && <AnalysisRunDetailReadsetsTable />}
      </div>
    </AnalysisRunDetailProvider>
  );
}
