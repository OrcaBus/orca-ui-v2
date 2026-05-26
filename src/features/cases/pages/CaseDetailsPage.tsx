import { useRef, useEffect } from 'react';
import {
  CaseDetailsOverviewCard,
  CaseDetailsPageBreadcrumb,
  CaseDetailsPageHeader,
  CaseDetailsTabs,
  CaseDetailsTimeline,
  CaseDetailsLinkedLibrariesTab,
  CaseDetailsLinkedWorkflowRunsTab,
  CaseDetailsUsersTab,
} from '../components';
import { useCaseDetailsTab, CaseDetailsTabValues } from '../hooks/useCaseDetailsTab';
import { CaseDetailsProvider } from '../context/CaseDetailsContext';

export function CaseDetailsPage() {
  const { activeTab } = useCaseDetailsTab();

  const tabsRef = useRef<HTMLDivElement>(null);
  // Track the last-seen tab value so scroll only fires on genuine user-initiated
  // tab changes, not on the initial mount (works correctly in React 18 Strict Mode
  // because both mount cycles see the same activeTab value on remount).
  const prevTabRef = useRef<CaseDetailsTabValues | null>(null);

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
    <CaseDetailsProvider>
      <div className='p-6'>
        <CaseDetailsPageBreadcrumb />
        <CaseDetailsPageHeader />

        <CaseDetailsOverviewCard />

        <div ref={tabsRef}>
          <CaseDetailsTabs />
        </div>

        <div>
          {activeTab === CaseDetailsTabValues.TIMELINES && <CaseDetailsTimeline />}
          {activeTab === CaseDetailsTabValues.LIBRARIES && <CaseDetailsLinkedLibrariesTab />}

          {activeTab === CaseDetailsTabValues.WORKFLOWS && <CaseDetailsLinkedWorkflowRunsTab />}

          {activeTab === CaseDetailsTabValues.USERS && <CaseDetailsUsersTab />}
        </div>
      </div>
    </CaseDetailsProvider>
  );
}
