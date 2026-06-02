/**
 * Workflow Run Details Page
 *
 * Integrates the Timeline and tabbed content. Tab selection is driven
 * by the `tab` query param (e.g. ?tab=libraries).
 */

import { useMemo, useRef, useEffect } from 'react';
import { useAppShellHeader } from '@/context/app-shell-context';
import {
  WorkflowRunDetailsPageHeader,
  WorkflowRunDetailsOverviewCard,
  WorkflowRunDetailsLibrariesTable,
  WorkflowRunDetailsRunContextTable,
  WorkflowRunDetailsReadsetsTable,
  WorkflowRunDetailsTimeline,
  WorkflowRunDetailsTabs,
} from '../components';
import {
  WorkflowRunDetailsProvider,
  useWorkflowRunDetailsContext,
} from '../context/WorkflowRunDetailsContext';
import {
  useWorkflowRunDetailsTab,
  WorkflowRunDetailsTabValues,
} from '../hooks/useWorkflowRunDetailsTab';

function WorkflowRunDetailsAppShellHeader() {
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();
  const headerConfig = useMemo(
    () => ({
      mode: 'detail' as const,
      breadcrumbs: [
        { label: 'Runs', href: '/runs' },
        { label: 'Workflow Runs', href: '/runs/workflow-runs' },
        {
          label: workflowRunDetail?.workflowRunName || 'Loading...',
          isLoading: isLoadingWorkflowRunDetail,
        },
      ],
    }),
    [isLoadingWorkflowRunDetail, workflowRunDetail?.workflowRunName]
  );

  useAppShellHeader(headerConfig);
  return null;
}

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
      <WorkflowRunDetailsAppShellHeader />
      <div className='px-6'>
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
