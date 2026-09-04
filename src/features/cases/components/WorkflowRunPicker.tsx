import { useState, useMemo, type ReactNode } from 'react';
import { ListFilter, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { useCaseLinkedWorkflowRuns } from '../hooks/useCaseLinkedWorkflowRuns';
import { CaseDetailsLinkedWorkflowRunsTable } from './CaseDetailsLinkedWorkflowRunsTable';
import { type WorkflowRunListModel } from '@/features/runs/shared/api/workflows.api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowTypeGroup = {
  key: string; // lowercase, used for matching
  name: string; // original case, used for display
  count: number;
};

export interface WorkflowRunPickerProps {
  /** Currently selected workflow-type group key (lowercase), or `null` for "All". */
  selectedWorkflowTypeKey: string | null;
  /** Called when the curator picks a workflow-type group (or "All" → `null`). */
  onSelectWorkflowType: (key: string | null) => void;
  /** Currently selected run's portal run id, or `null` when no run is selected. */
  selectedPortalRunId: string | null;
  /** Called when the curator selects a run (its files) or clears the selection. */
  onSelectPortalRunId: (portalRunId: string | null) => void;
  /**
   * Optional unlink affordance. When provided (Runs tab), each run row renders an
   * unlink control that invokes this callback. When omitted (Files tab), the picker
   * is read-only and renders no link/unlink affordance.
   */
  onUnlink?: (run: WorkflowRunListModel) => void;
  /** Whether an unlink mutation is currently pending (disables unlink controls). */
  unlinkIsPending?: boolean;
  /**
   * Optional render prop for the content shown once a run is selected. When provided
   * and a run is selected, the right panel renders this instead of the runs table
   * (used by the Runs tab to show the per-run files table inline). Callers that omit
   * this (e.g. the Files tab renders the files table itself, elsewhere) keep the runs
   * table visible.
   */
  renderSelectedRun?: (portalRunId: string) => ReactNode;
}

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
    <Button
      variant='ghost'
      size='inline'
      type='button'
      aria-pressed={isSelected}
      onClick={onClick}
      className={`h-9 w-full justify-start rounded-none border-l-2 px-4 py-1.5 text-left transition-colors ${
        isSelected
          ? 'border-l-blue-400 bg-white hover:bg-white dark:bg-[#1e252e] dark:hover:bg-[#1e252e]'
          : 'border-l-transparent hover:border-l-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
      }`}
    >
      <div className='flex w-full min-w-0 items-center justify-between gap-2'>
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
    </Button>
  );
}

// ---------------------------------------------------------------------------
// WorkflowRunPicker
// ---------------------------------------------------------------------------

/**
 * Shared two-panel workflow-run selector: a left-hand workflow-type list and a
 * right-hand list of the runs for the selected type. Consumes the shared
 * `useCaseLinkedWorkflowRuns` hook for its data and exposes a fully controlled
 * selection interface (selected workflow-type group + selected run) so callers own
 * the selection state.
 *
 * Both the Runs tab and the Files tab reuse this picker to choose which linked
 * workflow run is active. The Runs tab passes `onUnlink`/`renderSelectedRun` to keep
 * its link/unlink affordances and inline files drill-down; a caller that omits those
 * props (Files tab) renders a read-only selector.
 */
export function WorkflowRunPicker({
  selectedWorkflowTypeKey,
  onSelectWorkflowType,
  selectedPortalRunId,
  onSelectPortalRunId,
  onUnlink,
  unlinkIsPending = false,
  renderSelectedRun,
}: WorkflowRunPickerProps) {
  const [runSearch, setRunSearch] = useState('');

  const {
    wfrOrcabusIdArray,
    linkedWorkflowRuns,
    isLoading: isLoadingWorkflowRuns,
    isRefetching: isRefetchingWorkflowRuns,
    isError: isErrorWorkflowRuns,
    error: workflowRunsError,
    refetch: refetchWorkflowRuns,
  } = useCaseLinkedWorkflowRuns();

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

  const handleSelectWorkflowType = (key: string | null) => {
    onSelectWorkflowType(key);
    onSelectPortalRunId(null);
    setRunSearch('');
  };

  const isFilesView = !!selectedPortalRunId && !!renderSelectedRun;

  const rightPanelTitle = isFilesView ? 'Files' : 'Workflow Runs';
  const rightPanelDescription = isFilesView
    ? `Portal Run ID: ${selectedPortalRunId}`
    : selectedWorkflowTypeKey
      ? `Workflow type: ${workflowTypeGroups.find((g) => g.key === selectedWorkflowTypeKey)?.name ?? selectedWorkflowTypeKey}`
      : 'All linked workflow runs for this case.';

  if (isErrorWorkflowRuns) {
    return <ApiErrorState error={workflowRunsError} onRetry={() => void refetchWorkflowRuns()} />;
  }

  return (
    <div
      className='flex overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ minHeight: '480px' }}
    >
      {/* Left panel — workflow type list */}
      <div className='flex w-64 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#0d1117]'>
        <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-white'>Workflow Types</h3>
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
              <Button
                variant='ghost'
                type='button'
                onClick={() => onSelectPortalRunId(null)}
                className='inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
              >
                <ArrowLeft className='h-3.5 w-3.5' aria-hidden='true' />
                Back to workflow runs
              </Button>
            )}
          </div>
          {/* Search bar — runs view only */}
          {!isFilesView && (
            <div className='relative mt-4'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]' />
              <Input
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
          {isFilesView && selectedPortalRunId ? (
            renderSelectedRun?.(selectedPortalRunId)
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
              onViewFiles={onSelectPortalRunId}
              onUnlink={onUnlink}
              unlinkIsPending={unlinkIsPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}
