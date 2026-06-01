import { useState, useMemo } from 'react';
import { useParams } from 'react-router';
import { Link as LinkIcon, ListFilter, ArrowLeft, Search } from 'lucide-react';
import { toast } from 'sonner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { DEFAULT_NON_PAGINATE_PAGE_SIZE } from '@/utils/constants';
import { useWorkflowRunListModel } from '@/features/runs/api/workflows.api';
import { useCaseUnlinkEntityModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { CaseDetailsLinkWorkflowRunsModal } from './CaseDetailsLinkWorkflowRunsModal';
import { CaseDetailsLinkedWorkflowRunsTable } from './CaseDetailsLinkedWorkflowRunsTable';
import { CaseDetailsLinkedWorkflowRunFilesTable } from './CaseDetailsLinkedWorkflowRunFilesTable';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowTypeGroup = {
  key: string; // lowercase, used for matching
  name: string; // original case, used for display
  count: number;
};

// ---------------------------------------------------------------------------
// Workflow Type Button (left panel)
// ---------------------------------------------------------------------------

function WorkflowTypeButton({
  isSelected,
  label,
  count,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  count?: number;
  onClick: () => void;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`w-full border-l-2 px-4 py-3.5 text-left transition-colors ${
        isSelected
          ? 'border-l-blue-400 bg-white dark:bg-[#1e252e]'
          : 'border-l-transparent hover:border-l-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
      }`}
    >
      <div className='flex items-center justify-between gap-2'>
        <span
          className={`truncate text-sm font-semibold ${
            isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'
          }`}
        >
          {label}
        </span>
        {count !== undefined && (
          <span className='shrink-0 rounded-full bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-700 dark:text-neutral-400'>
            {count}
          </span>
        )}
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Tab Component
// ---------------------------------------------------------------------------

export function CaseDetailsLinkedWorkflowRunsTab() {
  const { caseDetail, refresh } = useCaseDetailsContext();
  const { caseOrcabusId } = useParams<{ caseOrcabusId: string }>();

  const [selectedWorkflowTypeKey, setSelectedWorkflowTypeKey] = useState<string | null>(null);
  const [selectedPortalRunId, setSelectedPortalRunId] = useState<string | null>(null);
  const [runSearch, setRunSearch] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Collect all linked workflow run orcabusIds from case external entities.
  const wfrOrcabusIdArray = useMemo(() => {
    const ids: string[] = [];
    caseDetail?.externalEntitySet.forEach((link) => {
      if (
        link.externalEntity.serviceName === 'workflow' &&
        link.externalEntity.type === 'workflow_run'
      ) {
        ids.push(link.externalEntity.orcabusId);
      }
    });
    return ids;
  }, [caseDetail]);

  const {
    data: workflowRunsData,
    isLoading: isLoadingWorkflowRuns,
    isRefetching: isRefetchingWorkflowRuns,
    isError: isErrorWorkflowRuns,
    error: workflowRunsError,
    refetch: refetchWorkflowRuns,
  } = useWorkflowRunListModel({
    params: {
      query: {
        rowsPerPage: DEFAULT_NON_PAGINATE_PAGE_SIZE,
        orcabusId: wfrOrcabusIdArray,
      },
    },
    reactQuery: {
      enabled: wfrOrcabusIdArray.length > 0,
    },
  });

  const linkedWorkflowRuns = useMemo(
    () => workflowRunsData?.results ?? [],
    [workflowRunsData?.results]
  );

  // Group runs by workflow.name (case-insensitive).
  const workflowTypeGroups: WorkflowTypeGroup[] = useMemo(() => {
    const map = new Map<string, WorkflowTypeGroup>();
    for (const run of linkedWorkflowRuns) {
      const key = run.workflow.name.toLowerCase();
      if (map.has(key)) {
        map.get(key)!.count += 1;
      } else {
        map.set(key, { key, name: run.workflow.name, count: 1 });
      }
    }
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [linkedWorkflowRuns]);

  // Runs to display in the right panel: filtered by type, then by search.
  const displayedRuns = useMemo(() => {
    let runs = linkedWorkflowRuns;
    if (selectedWorkflowTypeKey) {
      runs = runs.filter((r) => r.workflow.name.toLowerCase() === selectedWorkflowTypeKey);
    }
    if (runSearch.trim()) {
      const q = runSearch.trim().toLowerCase();
      runs = runs.filter(
        (r) =>
          (r.workflowRunName ?? '').toLowerCase().includes(q) ||
          r.portalRunId.toLowerCase().includes(q)
      );
    }
    return runs;
  }, [linkedWorkflowRuns, selectedWorkflowTypeKey, runSearch]);

  const unlinkMutation = useCaseUnlinkEntityModel();

  const handleUnlink = (wfrOrcabusId: string) => {
    if (!caseOrcabusId) return;
    unlinkMutation.mutate(
      {
        params: {
          path: {
            orcabusId: caseOrcabusId,
            externalEntityOrcabusId: wfrOrcabusId,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success('Workflow run unlinked');
          if (selectedPortalRunId) setSelectedPortalRunId(null);
          refresh();
        },
        onError: () => {
          toast.error('Failed to unlink workflow run');
        },
      }
    );
  };

  const handleSelectWorkflowType = (key: string | null) => {
    setSelectedWorkflowTypeKey(key);
    setSelectedPortalRunId(null);
    setRunSearch('');
  };

  const isFilesView = !!selectedPortalRunId;

  const rightPanelTitle = isFilesView ? 'Files' : 'Workflow Runs';
  const rightPanelDescription = isFilesView
    ? `Portal Run ID: ${selectedPortalRunId}`
    : selectedWorkflowTypeKey
      ? `Workflow type: ${workflowTypeGroups.find((g) => g.key === selectedWorkflowTypeKey)?.name ?? selectedWorkflowTypeKey}`
      : 'All linked workflow runs for this case.';

  if (isErrorWorkflowRuns) {
    return (
      <>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
            Linked Workflow Runs
          </h3>
          <button
            onClick={() => setIsLinkModalOpen(true)}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            <LinkIcon className='h-4 w-4' />
            Link Workflow Runs
          </button>
        </div>
        <ApiErrorState error={workflowRunsError} onRetry={() => void refetchWorkflowRuns()} />
        <CaseDetailsLinkWorkflowRunsModal
          isOpen={isLinkModalOpen}
          alreadyLinkedIds={wfrOrcabusIdArray}
          onClose={() => setIsLinkModalOpen(false)}
          onSuccess={() => {
            setIsLinkModalOpen(false);
            refresh();
          }}
        />
      </>
    );
  }

  return (
    <>
      {/* Top bar */}
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
          Linked Workflow Runs
        </h3>
        <button
          onClick={() => setIsLinkModalOpen(true)}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <LinkIcon className='h-4 w-4' />
          Link Workflow Runs
        </button>
      </div>

      {/* Two-panel layout */}
      <div
        className='flex overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'
        style={{ minHeight: '480px' }}
      >
        {/* Left panel — workflow type list */}
        <div className='flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#0d1117]'>
          <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
            <h3 className='text-sm font-semibold text-neutral-900 dark:text-white'>
              Workflow Types
            </h3>
            <ListFilter className='h-4 w-4 text-neutral-400 dark:text-[#6b7a8d]' />
          </div>
          <div className='flex-1 overflow-y-auto'>
            <WorkflowTypeButton
              isSelected={!selectedWorkflowTypeKey}
              label='All'
              count={linkedWorkflowRuns.length}
              onClick={() => handleSelectWorkflowType(null)}
            />
            {isLoadingWorkflowRuns && workflowTypeGroups.length === 0 && (
              <div className='px-4 py-4 text-sm text-neutral-500 dark:text-[#8892a2]'>
                Loading workflow types...
              </div>
            )}
            {!isLoadingWorkflowRuns && workflowTypeGroups.length === 0 && (
              <div className='px-4 py-4 text-sm text-neutral-500 dark:text-[#8892a2]'>
                No workflow runs linked yet.
              </div>
            )}
            {workflowTypeGroups.map((group) => (
              <WorkflowTypeButton
                key={group.key}
                isSelected={selectedWorkflowTypeKey === group.key}
                label={group.name}
                count={group.count}
                onClick={() => handleSelectWorkflowType(group.key)}
              />
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className='flex min-w-0 flex-1 flex-col'>
          {/* Right panel header */}
          <div className='border-b border-neutral-200 px-5 py-4 dark:border-[#2d3540]'>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <h3 className='text-base font-semibold text-neutral-900 dark:text-white'>
                  {rightPanelTitle}
                </h3>
                <p className='mt-1 truncate text-xs text-neutral-500 dark:text-[#8892a2]'>
                  {rightPanelDescription}
                </p>
              </div>
              {isFilesView && (
                <button
                  type='button'
                  onClick={() => setSelectedPortalRunId(null)}
                  className='inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
                >
                  <ArrowLeft className='h-3.5 w-3.5' aria-hidden='true' />
                  Back to workflow runs
                </button>
              )}
            </div>
            {/* Search bar — runs view only */}
            {!isFilesView && (
              <div className='relative mt-4'>
                <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
                <input
                  type='text'
                  value={runSearch}
                  onChange={(e) => setRunSearch(e.target.value)}
                  placeholder='Search by run name or portal run ID...'
                  className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-4 pl-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-[#1e252e] dark:text-neutral-100 dark:placeholder:text-[#9dabb9] dark:focus:ring-blue-500'
                />
              </div>
            )}
          </div>

          {/* Right panel content */}
          <div className='min-h-0 flex-1 overflow-auto p-4'>
            {isFilesView ? (
              <CaseDetailsLinkedWorkflowRunFilesTable
                key={selectedPortalRunId}
                portalRunId={selectedPortalRunId ?? ''}
              />
            ) : (
              <CaseDetailsLinkedWorkflowRunsTable
                key={selectedWorkflowTypeKey ?? 'all'}
                runs={displayedRuns}
                isLoading={isLoadingWorkflowRuns || isRefetchingWorkflowRuns}
                emptyDescription={
                  runSearch
                    ? 'No runs match your search.'
                    : wfrOrcabusIdArray.length === 0
                      ? 'No workflow runs have been linked to this case yet.'
                      : 'No workflow runs found for this workflow type.'
                }
                onViewFiles={setSelectedPortalRunId}
                onUnlink={handleUnlink}
                unlinkIsPending={unlinkMutation.isPending}
              />
            )}
          </div>
        </div>
      </div>

      <CaseDetailsLinkWorkflowRunsModal
        isOpen={isLinkModalOpen}
        alreadyLinkedIds={wfrOrcabusIdArray}
        onClose={() => setIsLinkModalOpen(false)}
        onSuccess={() => {
          setIsLinkModalOpen(false);
          refresh();
        }}
      />
    </>
  );
}
