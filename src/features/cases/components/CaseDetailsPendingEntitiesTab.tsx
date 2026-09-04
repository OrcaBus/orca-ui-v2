import { Clock } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { PillTag } from '@/components/ui/PillTag';
import { useTablePagination } from '@/components/tables/useTablePagination';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { EMPTY_CASE_VALUE } from '../utils/caseDisplay';
import { type PendingExternalEntityModel } from '../api/cases.api';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';

// ---------------------------------------------------------------------------
// Table
// ---------------------------------------------------------------------------

interface CaseDetailsPendingEntitiesTableProps {
  entities: PendingExternalEntityModel[];
}

function CaseDetailsPendingEntitiesTable({ entities }: CaseDetailsPendingEntitiesTableProps) {
  const pagination = useTablePagination(1, DEFAULT_PAGE_SIZE, entities.length);

  const columns: Column<PendingExternalEntityModel>[] = [
    {
      key: 'alias',
      header: 'Alias',
      sortable: true,
      render: (entity) => (
        <span className='font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100'>
          {entity.alias ?? EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (entity) =>
        entity.type ? (
          <PillTag variant='purple' size='sm'>
            {entity.type}
          </PillTag>
        ) : (
          <span className='text-neutral-400'>{EMPTY_CASE_VALUE}</span>
        ),
    },
    {
      key: 'serviceName',
      header: 'Service',
      sortable: true,
      render: (entity) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {entity.serviceName ?? EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <PillTag variant='amber' size='sm'>
          Pending
        </PillTag>
      ),
    },
  ];

  if (entities.length === 0) {
    return (
      <div className='flex min-h-60 items-center justify-center rounded-xl border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
        <EmptyState
          icon={Clock}
          title='No pending entities'
          description='Every entity referenced by this case has been resolved in the metadata system.'
        />
      </div>
    );
  }

  return (
    <DataTable
      data={entities}
      columns={columns}
      emptyMessage='No pending entities found.'
      paginationProps={entities.length > DEFAULT_PAGE_SIZE ? pagination : undefined}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Tab Component
// ---------------------------------------------------------------------------

/**
 * Pending tab — lists entities referenced by this case's REDCap sync that do
 * not yet exist in the metadata system (or another originating microservice).
 * Once the metadata service confirms an entity's existence, it resolves into
 * an `ExternalEntity` and automatically moves to the Metadata tab as a linked
 * entity, disappearing from this list.
 */
export function CaseDetailsPendingEntitiesTab() {
  const { caseDetail } = useCaseDetailsContext();

  const pendingEntities = caseDetail?.pendingExternalEntities ?? [];

  return (
    <>
      <div className='mb-4'>
        <h3 className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>
          Pending Entities
        </h3>
        <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
          Entities referenced from REDCap that do not yet exist in the metadata system. They will
          automatically move to the Metadata tab once resolved.
        </p>
      </div>

      <CaseDetailsPendingEntitiesTable entities={pendingEntities} />
    </>
  );
}
