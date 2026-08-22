import { Button } from '@/components/ui/Button';
import { ArrowLeft, ListFilter, WorkflowIcon, type LucideIcon } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterBar } from '@/components/tables/FilterBar';
import {
  LibraryDetailsWorkflowRunsProvider,
  useLibraryDetailsWorkflowRuns,
  type LibraryDetailsWorkflowTypeGroup,
} from '../context/LibraryDetailsWorkflowRunsContext';
import {
  useLibraryDetailsWorkflowRunsQueryParams,
  type LibraryDetailsWorkflowRunsQueryParamsState,
} from '../hooks/useLibraryDetailsWorkflowRunsQueryParams';
import { LibraryDetailsWorkflowRunFilesTable } from './LibraryDetailsWorkflowRunFilesTable';
import { LibraryDetailsWorkflowRunsTable } from './LibraryDetailsWorkflowRunsTable';

function EmptyPanel({
  icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className='flex min-h-90 items-center justify-center p-8'>
      <EmptyState icon={icon} title={title} description={description} />
    </div>
  );
}

function WorkflowTypeButton({
  isSelected,
  label,
  onClick,
}: {
  isSelected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant='ghost'
      type='button'
      onClick={onClick}
      className={`w-full border-l-2 px-4 py-3.5 text-left transition-colors ${
        isSelected
          ? 'border-l-blue-400 bg-white dark:bg-[#1e252e]'
          : 'border-l-transparent hover:border-l-gray-400 hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
      }`}
    >
      <div
        className={`truncate text-sm font-semibold ${
          isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-neutral-900 dark:text-white'
        }`}
      >
        {label}
      </div>
    </Button>
  );
}

function WorkflowTypeList({
  groups,
  selectedGroup,
  isAllSelected,
  isLoading,
  isError,
  onSelectAll,
  onSelectGroup,
  onRetry,
}: {
  groups: LibraryDetailsWorkflowTypeGroup[];
  selectedGroup: LibraryDetailsWorkflowTypeGroup | null;
  isAllSelected: boolean;
  isLoading: boolean;
  isError: boolean;
  onSelectAll: () => void;
  onSelectGroup: (group: LibraryDetailsWorkflowTypeGroup) => void;
  onRetry: () => void;
}) {
  return (
    <div className='flex-1 overflow-y-auto'>
      <WorkflowTypeButton isSelected={isAllSelected} label='All' onClick={onSelectAll} />

      {isLoading && groups.length === 0 && (
        <div className='px-4 py-4 text-sm text-neutral-500 dark:text-[#8892a2]'>
          Loading workflow types...
        </div>
      )}

      {isError && (
        <div className='space-y-2 px-4 py-4 text-sm text-neutral-500 dark:text-[#8892a2]'>
          <p>Workflow types could not be loaded.</p>
          <Button
            variant='ghost'
            type='button'
            onClick={onRetry}
            className='font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && groups.length === 0 && (
        <div className='px-4 py-4 text-sm text-neutral-500 dark:text-[#8892a2]'>
          No workflow types found.
        </div>
      )}

      {groups.map((group) => (
        <WorkflowTypeButton
          key={group.key}
          isSelected={selectedGroup?.key === group.key}
          label={group.name}
          onClick={() => onSelectGroup(group)}
        />
      ))}
    </div>
  );
}

function LibraryDetailsWorkflowRunsTabContent() {
  const {
    workflowTypeGroups,
    selectedWorkflowTypeGroup,
    isAllWorkflowTypes,
    isSelectedWorkflowTypePending,
    isLoadingWorkflowTypes,
    isErrorWorkflowTypes,
    refetchWorkflowTypes,
  } = useLibraryDetailsWorkflowRuns();

  const workflowRunsQueryParams: LibraryDetailsWorkflowRunsQueryParamsState =
    useLibraryDetailsWorkflowRunsQueryParams();

  const {
    portalRunId,
    workflowRunSearch,
    workflowRunFileSearch,
    setWorkflowTypeName,
    clearWorkflowType,
    clearPortalRunId,
    setWorkflowRunSearchQuery,
    setWorkflowRunFileSearchQuery,
  } = workflowRunsQueryParams;

  const isFilesView = !!portalRunId;
  const rightPanelTitle = isFilesView ? 'Files' : 'Workflow Runs';
  const rightPanelDescription = isFilesView
    ? `Portal Run ID: ${portalRunId}`
    : selectedWorkflowTypeGroup
      ? `Workflow type: ${selectedWorkflowTypeGroup.name}`
      : 'All workflow types for this library.';
  const searchValue = isFilesView ? workflowRunFileSearch : workflowRunSearch;
  const searchPlaceholder = isFilesView
    ? 'Search files for this portal run...'
    : 'Search by workflow run name, portal run ID...';
  const setSearchQuery = isFilesView ? setWorkflowRunFileSearchQuery : setWorkflowRunSearchQuery;

  const renderRightPanelContent = () => {
    if (isSelectedWorkflowTypePending) {
      return (
        <EmptyPanel
          icon={WorkflowIcon}
          title='Loading workflow type'
          description='Workflow runs will load when the selected workflow type is ready.'
        />
      );
    }

    return isFilesView ? (
      <LibraryDetailsWorkflowRunFilesTable />
    ) : (
      <LibraryDetailsWorkflowRunsTable />
    );
  };

  return (
    <div
      className='flex overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'
      style={{ minHeight: '480px' }}
    >
      {/* left panel */}
      <div className='flex w-72 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#0d1117]'>
        <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
          <h3 className='text-sm font-semibold text-neutral-900 dark:text-white'>Workflow Types</h3>
          <ListFilter className='h-4 w-4 text-neutral-400 dark:text-[#6b7a8d]' />
        </div>
        <WorkflowTypeList
          groups={workflowTypeGroups}
          selectedGroup={selectedWorkflowTypeGroup}
          isAllSelected={isAllWorkflowTypes}
          isLoading={isLoadingWorkflowTypes}
          isError={isErrorWorkflowTypes}
          onSelectAll={clearWorkflowType}
          onSelectGroup={(group) => setWorkflowTypeName(group.name)}
          onRetry={refetchWorkflowTypes}
        />
      </div>

      <div className='flex min-w-0 flex-1 flex-col'>
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
                onClick={clearPortalRunId}
                className='inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8] dark:hover:bg-[#2d3540]'
              >
                <ArrowLeft className='h-3.5 w-3.5' aria-hidden='true' />
                Back to workflow runs
              </Button>
            )}
          </div>
          <div className='mt-4'>
            <FilterBar
              searchValue={searchValue}
              onSearchChange={setSearchQuery}
              searchPlaceholder={searchPlaceholder}
              showBadgesSection={false}
              searchId={
                isFilesView ? 'library-workflow-run-files-search' : 'library-workflow-runs-search'
              }
            />
          </div>
        </div>

        <div className='min-h-0 flex-1 overflow-auto p-4'>{renderRightPanelContent()}</div>
      </div>
    </div>
  );
}

export function LibraryDetailsWorkflowRunsTab() {
  return (
    <LibraryDetailsWorkflowRunsProvider>
      <LibraryDetailsWorkflowRunsTabContent />
    </LibraryDetailsWorkflowRunsProvider>
  );
}
