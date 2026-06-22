import { Copy } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { toast } from 'sonner';
import { useLibraryDetails } from '../context/LibraryDetailsContext';

export function LibraryDetailsPageHeader() {
  const { libraryDetail } = useLibraryDetails();

  const handleCopyOrcabusId = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    void navigator.clipboard.writeText(libraryDetail?.orcabusId ?? '');
    toast.success('Orcabus ID copied to clipboard');
  };

  const displayName = libraryDetail?.libraryId ?? '—';

  return (
    <div className='my-4 flex flex-col items-start gap-1'>
      <div className='flex items-center gap-3'>
        <h1 className='text-xl font-semibold text-neutral-900 dark:text-white'>{displayName}</h1>
        {libraryDetail?.type && (
          <PillTag variant='blue' size='sm'>
            {libraryDetail.type}
          </PillTag>
        )}
      </div>
      <div className='flex items-center gap-4 text-sm text-neutral-600 dark:text-[#9dabb9]'>
        {libraryDetail?.sample?.sampleId && <span>Sample ID: {libraryDetail.sample.sampleId}</span>}
        <span className='text-neutral-300 dark:text-[#2d3540]'>|</span>
        <span className='flex items-center gap-1.5'>
          Orcabus ID: <span className='font-mono'>{libraryDetail?.orcabusId ?? '—'}</span>
          {libraryDetail?.orcabusId && (
            <span
              role='button'
              tabIndex={0}
              onClick={handleCopyOrcabusId}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCopyOrcabusId(e);
              }}
              className='rounded p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-[#2d3540]'
            >
              <Copy className='h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white' />
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
