/**
 * Library Details Page
 *
 * Integrates the workflowruns and files content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=workflowruns).
 */

import { useRef, useEffect } from 'react';
import {
  LibraryDetailsPageHeader,
  LibraryDetailsOverviewCard,
  LibraryDetailsWorkflowRunsTab,
  LibraryDetailsRelatedLibrariesTable,
  LibraryDetailsHistoryTable,
} from '../components';
import { useLibraryDetailsTab, LibraryDetailsTabValues } from '../hooks/useLibraryDetailsTab';
import { LibraryDetailsProvider } from '../context/LibraryDetailsContext';
import { LibraryDetailsPageBreadcrumb } from '../components/LibraryDetailsPageBreadcrumb';
import { LibraryDetailsTabs } from '../components/LibraryDetailsTabs';

export function LibraryDetailsPage() {
  const { activeTab } = useLibraryDetailsTab();
  const tabsRef = useRef<HTMLDivElement>(null);
  // Track the last-seen tab value so scroll only fires on genuine user-initiated
  // tab changes, not on the initial mount (works correctly in React 18 Strict Mode
  // because both mount cycles see the same activeTab value on remount).
  const prevTabRef = useRef<LibraryDetailsTabValues | null>(null);

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
    <LibraryDetailsProvider>
      <div className='p-6'>
        <LibraryDetailsPageBreadcrumb />
        <LibraryDetailsPageHeader />
        <LibraryDetailsOverviewCard />

        <div ref={tabsRef}>
          <LibraryDetailsTabs />
        </div>

        {activeTab === LibraryDetailsTabValues.WorkflowRuns && <LibraryDetailsWorkflowRunsTab />}
        {activeTab === LibraryDetailsTabValues.RelatedLibraries && (
          <LibraryDetailsRelatedLibrariesTable />
        )}
        {activeTab === LibraryDetailsTabValues.History && <LibraryDetailsHistoryTable />}
      </div>
    </LibraryDetailsProvider>
  );
}
