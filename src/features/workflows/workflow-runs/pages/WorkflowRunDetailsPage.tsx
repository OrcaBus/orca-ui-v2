/**
 * Workflow Run Details Page
 *
 * Integrates the Timeline and tabbed content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=libraries).
 */

import { useRef, useEffect } from 'react';
import {
  WorkflowRunDetailsPageHeader,
  WorkflowRunDetailsOverviewCard,
  WorkflowRunDetailsLibrariesTable,
  WorkflowRunDetailsRunContextTable,
  WorkflowRunDetailsReadsetsTable,
  WorkflowRunDetailsPageBreadcrumb,
  WorkflowRunDetailsTimeline,
  WorkflowRunDetailsTabs,
} from '../components';
import { WorkflowRunDetailsProvider } from '../context/WorkflowRunDetailsContext';
import {
  useWorkflowRunDetailsTab,
  WorkflowRunDetailsTabValues,
} from '../hooks/useWorkflowRunDetailsTab';

export function WorkflowRunDetailsPage() {
  const { activeTab } = useWorkflowRunDetailsTab();

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
    <WorkflowRunDetailsProvider>
      <div className='p-6'>
        <WorkflowRunDetailsPageBreadcrumb />
        <WorkflowRunDetailsPageHeader />
        <WorkflowRunDetailsOverviewCard />

        {/* Tabs - selection synced to ?tab= query param */}
        <div ref={tabsRef}>
          <WorkflowRunDetailsTabs />
        </div>

        {/* Tab Content */}
        {activeTab === WorkflowRunDetailsTabValues.Timeline && <WorkflowRunDetailsTimeline />}
        {activeTab === WorkflowRunDetailsTabValues.Libraries && (
          <WorkflowRunDetailsLibrariesTable />
        )}
        {activeTab === WorkflowRunDetailsTabValues.RunContext && (
          <WorkflowRunDetailsRunContextTable />
        )}
        {activeTab === WorkflowRunDetailsTabValues.Readsets && <WorkflowRunDetailsReadsetsTable />}
      </div>
    </WorkflowRunDetailsProvider>
  );
}
