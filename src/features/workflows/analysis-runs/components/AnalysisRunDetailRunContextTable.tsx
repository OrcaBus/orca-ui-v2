import { SimpleTable, SimpleTableColumn } from '@/components/tables/SimpleTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { PillTag } from '@/components/ui/PillTag';
import { useAnalysisRunDetailContext } from '../context/AnalysisRunDetailContext';
import type { RunContext } from '@/features/workflows/api/workflows.api';

export function AnalysisRunDetailRunContextTable() {
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailContext();
  const runContexts = analysisRunDetail?.contexts || [];

  const columns: SimpleTableColumn<RunContext>[] = [
    {
      key: 'name',
      header: 'Context Name',
      render: (ctx) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{ctx.name}</span>
      ),
    },
    {
      key: 'usecase',
      header: 'Use Case',
      render: (ctx) => <PillTag variant='blue'>{ctx.usecase}</PillTag>,
    },
    {
      key: 'description',
      header: 'Description',
      render: (ctx) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {ctx.description || '-'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (ctx) => <StatusBadge status={ctx.status} />,
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={runContexts}
      emptyMessage='No run context data available'
      isLoading={isLoadingAnalysisRunDetail}
    />
  );
}
