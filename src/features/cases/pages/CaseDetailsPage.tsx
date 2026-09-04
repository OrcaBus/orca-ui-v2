import { useCallback, useMemo, useRef, useEffect } from 'react';
import {
  CaseHeader,
  CaseDetailsRail,
  CaseStatsStrip,
  LifecycleStepper,
  CaseDetailsTabs,
  CaseDetailsStatesTable,
  CaseDetailsLinkedLibrariesTab,
  CaseDetailsPendingEntitiesTab,
  CaseDetailsRunsTab,
} from '../components';
import type { CaseStatsStripTab } from '../components/CaseStatsStrip';
import { useAppShellHeader } from '@/context/app-shell-context';
import { useCaseDetailsTab, CaseDetailsTabValues } from '../hooks/useCaseDetailsTab';
import { CaseDetailsProvider, useCaseDetailsContext } from '../context/CaseDetailsContext';

const CasesDetailsAppShellHeader = () => {
  const { caseDetail, isLoadingCaseDetail } = useCaseDetailsContext();
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Cases', href: '/cases' },
        {
          label: caseDetail?.requestFormId ?? 'Loading...',
          isLoading: isLoadingCaseDetail,
        },
      ],
    }),
    [caseDetail?.requestFormId, isLoadingCaseDetail]
  );

  useAppShellHeader(headerConfig);
  return null;
};

export function CaseDetailsPage() {
  const { activeTab, setActiveTab } = useCaseDetailsTab();

  const handleSelectStatsTab = useCallback(
    (tab: CaseStatsStripTab) => {
      switch (tab) {
        case 'metadata':
          setActiveTab(CaseDetailsTabValues.METADATA);
          break;
        case 'runs':
          setActiveTab(CaseDetailsTabValues.RUNS);
          break;
        case 'files':
          setActiveTab(CaseDetailsTabValues.FILES);
          break;
      }
    },
    [setActiveTab]
  );

  // Scroll to top of tabs when active tab changes, but only on genuine user-initiated tab changes, not on initial mount or Strict Mode remount.
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
      <CasesDetailsAppShellHeader />
      <div className='px-6'>
        <CaseHeader />

        <div className='mt-4 grid gap-4 lg:grid-cols-[280px_1fr]'>
          <CaseDetailsRail columns={1} className='hidden lg:block' />

          <div className='min-w-0'>
            <CaseDetailsRail className='mb-4 lg:hidden' collapsedByDefault />

            <div className='mb-4'>
              <CaseStatsStrip onSelectTab={handleSelectStatsTab} />
            </div>

            <div className='mb-4'>
              <LifecycleStepper />
            </div>

            <div ref={tabsRef}>
              <CaseDetailsTabs />
            </div>

            <div>
              {/* {activeTab === CaseDetailsTabValues.OVERVIEW && (
                <div className='text-sm text-gray-500 dark:text-gray-400'>
                  Overview coming soon.
                </div>
              )} */}
              {activeTab === CaseDetailsTabValues.METADATA && <CaseDetailsLinkedLibrariesTab />}

              {activeTab === CaseDetailsTabValues.RUNS && <CaseDetailsRunsTab />}

              {activeTab === CaseDetailsTabValues.FILES && (
                <div className='text-sm text-gray-500 dark:text-gray-400'>Files coming soon.</div>
              )}
              {activeTab === CaseDetailsTabValues.PENDING && <CaseDetailsPendingEntitiesTab />}
              {activeTab === CaseDetailsTabValues.STATES && <CaseDetailsStatesTable />}
            </div>
          </div>
        </div>
      </div>
    </CaseDetailsProvider>
  );
}
