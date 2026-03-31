import { useCallback, useMemo } from 'react';
import { Eye } from 'lucide-react';
import { mockWorkflowTypes, WorkflowTypeDefinition } from '@/data/mockData';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { DataTable, Column } from '@/components/tables/DataTable';
import { StatusCard } from '@/components/ui/StatusCard';
import { PillTag } from '@/components/ui/PillTag';
import { WorkflowTypeDetailsDrawer } from '../components/WorkflowTypeDetailsDrawer';
import { getValidationStateIcon } from '../../shared/utils/statusIcons';
import { useQueryParams } from '@/hooks/useQueryParams';
import { useWorkflowTypeDetailDrawer } from '../hooks/useWorkflowTypeDetailDrawer';
import {
  useWorkflowTypesQueryParams,
  type ValidationState,
} from '../hooks/useWorkflowTypesQueryParams';

const WT_VALIDATION_STATE_CARDS: Array<{
  label: string;
  state: ValidationState;
  variant: 'success' | 'error' | 'warning' | 'neutral' | 'info';
}> = [
  { label: 'Validated', state: 'validated', variant: 'success' },
  { label: 'Unvalidated', state: 'unvalidated', variant: 'warning' },
  { label: 'Deprecated', state: 'deprecated', variant: 'neutral' },
  { label: 'Failed', state: 'failed', variant: 'error' },
];

const EXECUTION_ENGINE_OPTIONS = [
  { value: 'all', label: 'All Execution Engines' },
  { value: 'Unknown', label: 'Unknown' },
  { value: 'ICA', label: 'ICA' },
  { value: 'SEQERA', label: 'SEQERA' },
  { value: 'AWS_BATCH', label: 'AWS_BATCH' },
  { value: 'AWS_ECS', label: 'AWS_ECS' },
  { value: 'AWS_EKS', label: 'AWS_EKS' },
];

export function WorkflowTypesPage() {
  const { pagination, setParams } = useQueryParams({
    paginationKeys: ['page', 'rowsPerPage'],
  });
  const { detailId, openDetail, closeDetail } = useWorkflowTypeDetailDrawer();
  const {
    search,
    setSearch,
    validationState,
    setValidationState,
    typeName,
    setTypeName,
    executionEngine,
    setExecutionEngine,
    clearAllFilters,
    activeFilterBadges,
    filteredWorkflowTypes,
    workflowTypeNames,
  } = useWorkflowTypesQueryParams({ workflowTypes: mockWorkflowTypes });

  const handleValidationStateCardClick = useCallback(
    (state: ValidationState) => setValidationState(validationState === state ? 'all' : state),
    [validationState, setValidationState]
  );

  const selectedWorkflowType = useMemo(
    () => (detailId ? (mockWorkflowTypes.find((wt) => wt.id === detailId) ?? null) : null),
    [detailId]
  );

  const columns: Column<WorkflowTypeDefinition>[] = useMemo(
    () => [
      {
        key: 'name',
        header: 'Workflow Name',
        sortable: true,
        render: (wt) => (
          <div className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
            {wt.name}
          </div>
        ),
      },
      {
        key: 'version',
        header: 'Version',
        sortable: true,
        render: (wt) => (
          <div className='text-sm text-neutral-900 dark:text-neutral-100'>{wt.version}</div>
        ),
      },
      {
        key: 'codeVersion',
        header: 'Code Version',
        sortable: true,
        render: (wt) => (
          <div className='font-mono text-sm text-neutral-600 dark:text-neutral-400'>
            {wt.codeVersion}
          </div>
        ),
      },
      {
        key: 'executionEngine',
        header: 'Execution Engine',
        sortable: true,
        render: (wt) => (
          <PillTag
            variant={
              wt.executionEngine === 'ICA'
                ? 'blue'
                : wt.executionEngine === 'SEQERA'
                  ? 'purple'
                  : wt.executionEngine === 'AWS_BATCH'
                    ? 'green'
                    : wt.executionEngine === 'AWS_ECS'
                      ? 'amber'
                      : wt.executionEngine === 'AWS_EKS'
                        ? 'green'
                        : 'neutral'
            }
          >
            {wt.executionEngine}
          </PillTag>
        ),
      },
      {
        key: 'executionEnginePipelineId',
        header: 'Execution Engine Pipeline ID',
        sortable: true,
        render: (wt) => (
          <div className='max-w-xs truncate font-mono text-sm text-neutral-500'>
            {wt.executionEnginePipelineId}
          </div>
        ),
      },
      {
        key: 'validationState',
        header: 'Validation State',
        sortable: true,
        render: (wt) => {
          const variantMap = {
            validated: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            unvalidated: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            deprecated: 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
            failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          };
          return (
            <span
              className={`rounded px-2 py-1 text-xs font-medium ${variantMap[wt.validationState]}`}
            >
              {wt.validationState.toUpperCase()}
            </span>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        sortable: false,
        render: (wt) => (
          <div className='flex items-center gap-2'>
            <button
              onClick={() => openDetail(wt.id)}
              className='rounded p-1.5 text-neutral-600 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:text-neutral-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
              title='View workflow details & history'
            >
              <Eye className='h-4 w-4' />
            </button>
          </div>
        ),
      },
    ],
    [openDetail]
  );

  return (
    <div>
      <div className='mb-6 grid grid-cols-4 gap-4'>
        {WT_VALIDATION_STATE_CARDS.map((card) => {
          const count = mockWorkflowTypes.filter((wt) => wt.validationState === card.state).length;
          const percentage =
            mockWorkflowTypes.length > 0 ? Math.round((count / mockWorkflowTypes.length) * 100) : 0;
          return (
            <StatusCard
              key={card.state}
              label={card.label}
              value={count}
              percentage={percentage}
              icon={getValidationStateIcon(card.state)}
              variant={card.variant}
              selected={validationState === card.state}
              onClick={() => handleValidationStateCardClick(card.state)}
            />
          );
        })}
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        placeholder='Search by workflow name, ID, version…'
        filters={
          <>
            <Select
              value={typeName}
              onChange={setTypeName}
              options={[
                { value: 'all', label: 'All Workflow Types' },
                ...workflowTypeNames.map((name) => ({ value: name, label: name })),
              ]}
            />
            <Select
              value={executionEngine}
              onChange={setExecutionEngine}
              options={EXECUTION_ENGINE_OPTIONS}
            />
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges.length > 0 ? clearAllFilters : undefined}
      />

      <DataTable
        data={filteredWorkflowTypes}
        columns={columns}
        paginationProps={{
          page: pagination.page,
          pageSize: pagination.rowsPerPage,
          onPageChange: (p) => setParams({ page: p === 1 ? undefined : p }),
          onPageSizeChange: (size) => setParams({ rowsPerPage: size, page: undefined }),
          totalItems: filteredWorkflowTypes.length,
        }}
      />

      {selectedWorkflowType && (
        <WorkflowTypeDetailsDrawer workflowType={selectedWorkflowType} onClose={closeDetail} />
      )}
    </div>
  );
}
