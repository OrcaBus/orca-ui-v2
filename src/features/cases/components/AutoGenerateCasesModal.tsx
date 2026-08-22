import { Info, Loader2, Sparkles } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';

interface AutoGenerateCasesModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AutoGenerateCasesModal({
  isOpen,
  isGenerating,
  onClose,
  onConfirm,
}: AutoGenerateCasesModalProps) {
  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Auto-generate Cases'
      closeDisabled={isGenerating}
      footer={
        <>
          <Button
            variant='ghost'
            type='button'
            onClick={onClose}
            disabled={isGenerating}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </Button>
          <Button type='button' onClick={onConfirm} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className='animate-spin' />
                Generating...
              </>
            ) : (
              <>
                <Sparkles />
                Generate
              </>
            )}
          </Button>
        </>
      }
    >
      <div className='space-y-4'>
        <p className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
          This will automatically generate new cases based on predefined logic. The system will
          analyze existing data and create cases according to configured rules.
        </p>

        <div className='flex gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-500/10'>
          <Info className='mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400' />
          <p className='text-sm text-blue-900 dark:text-blue-100'>
            Please review the generated cases after completion to ensure they meet your
            requirements.
          </p>
        </div>
      </div>
    </DialogFrame>
  );
}
