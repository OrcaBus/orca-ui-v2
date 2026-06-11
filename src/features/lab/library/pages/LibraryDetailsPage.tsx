/**
 * Library Details Page
 *
 * Integrates the workflowruns and files content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=workflowruns).
 */

import { useMemo, useRef, useEffect } from 'react';
import {
  LibraryDetailsPageHeader,
  LibraryDetailsOverviewCard,
  LibraryDetailsWorkflowRunsTab,
  LibraryDetailsRelatedLibrariesTable,
  LibraryDetailsHistoryTable,
} from '../components';
import { useAppShellHeader } from '@/context/app-shell-context';
import { useLibraryDetailsTab, LibraryDetailsTabValues } from '../hooks/useLibraryDetailsTab';
import { LibraryDetailsProvider, useLibraryDetails } from '../context/LibraryDetailsContext';
import { LibraryDetailsTabs } from '../components/LibraryDetailsTabs';

function LibraryDetailsAppShellHeader() {
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Lab', href: '/lab' },
        { label: 'Libraries', href: '/lab/libraries' },
        {
          label: libraryDetail?.libraryId || 'Loading...',
          isLoading: isLoadingLibraryDetail,
        },
      ],
    }),
    [isLoadingLibraryDetail, libraryDetail?.libraryId]
  );

  useAppShellHeader(headerConfig);
  return null;
}

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
      <LibraryDetailsAppShellHeader />
      <div className='px-6'>
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
