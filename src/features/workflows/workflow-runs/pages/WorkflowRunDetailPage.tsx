/**
 * Workflow Run Detail Page
 *
 * Integrates the Timeline and tabbed content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=libraries).
 */

import { useRef, useEffect } from 'react';
import {
  WorkflowRunDetailPageHeader,
  WorkflowRunDetailOverviewCard,
  WorkflowRunDetailLibrariesTable,
  WorkflowRunDetailRunContextTable,
  WorkflowRunDetailReadsetsTable,
  WorkflowRunDetailPageBreadcrumb,
  WorkflowRunDetailTimeline,
  WorkflowRunDetailTabs,
} from '../components';
import { WorkflowRunDetailProvider } from '../context/WorkflowRunDetailContext';
import {
  useWorkflowRunDetailTab,
  WorkflowRunDetailTabValues,
} from '../hooks/useWorkflowRunDetailTab';

export function WorkflowRunDetailPage() {
  const { activeTab } = useWorkflowRunDetailTab();

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
    <WorkflowRunDetailProvider>
      <div className='p-6'>
        <WorkflowRunDetailPageBreadcrumb />
        <WorkflowRunDetailPageHeader />
        <WorkflowRunDetailOverviewCard />

        {/* Tabs - selection synced to ?tab= query param */}
        <div ref={tabsRef}>
          <WorkflowRunDetailTabs />
        </div>

        {/* Tab Content */}
        {activeTab === WorkflowRunDetailTabValues.Timeline && <WorkflowRunDetailTimeline />}
        {activeTab === WorkflowRunDetailTabValues.Libraries && <WorkflowRunDetailLibrariesTable />}
        {activeTab === WorkflowRunDetailTabValues.RunContext && (
          <WorkflowRunDetailRunContextTable />
        )}
        {activeTab === WorkflowRunDetailTabValues.Readsets && <WorkflowRunDetailReadsetsTable />}
      </div>
    </WorkflowRunDetailProvider>
  );
}
