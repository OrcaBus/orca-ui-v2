import { Button } from '@/components/ui/Button';
import { Copy } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import { toast } from 'sonner';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import { getQualityVariant } from '../utils/libraryDisplay';

export function LibraryDetailsPageHeader() {
  const { libraryDetail } = useLibraryDetails();

  const handleCopyOrcabusId = () => {
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
        {/* Quality is Library's closest analog to the status/state indicator
            every sibling entity page (Case, Workflow Run, Sequence Run,
            Analysis Run) places beside its title. */}
        {libraryDetail?.quality && (
          <PillTag variant={getQualityVariant(libraryDetail.quality)} size='sm'>
            {libraryDetail.quality}
          </PillTag>
        )}
      </div>
      <div className='flex items-center gap-4 text-sm text-neutral-600 dark:text-[#9dabb9]'>
        {libraryDetail?.sample?.sampleId && <span>Sample ID: {libraryDetail.sample.sampleId}</span>}
        <span className='text-neutral-300 dark:text-[#2d3540]'>|</span>
        <span className='flex items-center gap-1.5'>
          Orcabus ID: <span className='font-mono'>{libraryDetail?.orcabusId ?? '—'}</span>
          {libraryDetail?.orcabusId && (
            <Button
              variant='ghost'
              type='button'
              onClick={handleCopyOrcabusId}
              aria-label='Copy Orcabus ID'
              className='rounded p-0.5 transition-colors hover:bg-neutral-200 dark:hover:bg-[#2d3540]'
            >
              <Copy className='h-3.5 w-3.5 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white' />
            </Button>
          )}
        </span>
      </div>
    </div>
  );
}
