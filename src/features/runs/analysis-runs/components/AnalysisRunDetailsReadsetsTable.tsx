import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Copy, Check } from 'lucide-react';
import { SimpleTable, SimpleTableColumn } from '@/components/tables/SimpleTable';
import { useAnalysisRunDetailsContext } from '../context/AnalysisRunDetailsContext';
import type { Readset } from '@/features/runs/shared/api/workflows.api';
import { toast } from 'sonner';

export function AnalysisRunDetailsReadsetsTable() {
  const navigate = useNavigate();
  const { analysisRunDetail, isLoadingAnalysisRunDetail } = useAnalysisRunDetailsContext();
  const readsets = analysisRunDetail?.readsets || [];
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(key);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const columns: SimpleTableColumn<Readset>[] = [
    {
      key: 'rgid',
      header: 'RGID',
      render: (rs) => (
        <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>{rs.rgid}</span>
      ),
    },
    {
      key: 'libraryId',
      header: 'Library ID',
      render: (rs) => (
        <button
          onClick={() => {
            void navigate(`/lab/libraries/${rs.libraryOrcabusId}`);
          }}
          className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
        >
          {rs.libraryId}
        </button>
      ),
    },
    {
      key: 'orcabusId',
      header: 'Readset Orcabus ID',
      render: (rs) => (
        <div className='flex items-center gap-2'>
          <span className='font-mono text-sm text-neutral-600 dark:text-neutral-400'>
            {rs.orcabusId}
          </span>
          <button
            type='button'
            onClick={() => void handleCopy(rs.orcabusId, rs.orcabusId)}
            className='rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800'
          >
            {copiedId === rs.orcabusId ? (
              <Check className='h-3.5 w-3.5 text-green-600 dark:text-green-400' />
            ) : (
              <Copy className='h-3.5 w-3.5 text-neutral-400' />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columns}
      data={readsets}
      emptyMessage='No readsets available'
      isLoading={isLoadingAnalysisRunDetail}
    />
  );
}
