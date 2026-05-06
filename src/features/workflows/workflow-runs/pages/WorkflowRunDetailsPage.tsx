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
  // Track the last-seen tab value so scroll only fires on genuine user-initiated
  // tab changes, not on the initial mount (works correctly in React 18 Strict Mode
  // because both mount cycles see the same activeTab value on remount).
  const prevTabRef = useRef<WorkflowRunDetailsTabValues | null>(null);

  useEffect(() => {
    if (prevTabRef.current === null) {
      // First mount — record the tab but do not scroll.
      prevTabRef.current = activeTab;
      return;
    }
    if (prevTabRef.current === activeTab) {
      // Strict Mode remount or unrelated re-render — tab hasn't changed.
      return;
    }
    prevTabRef.current = activeTab;
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
