import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { RNASUMDatasetSelect } from './RNASUMDatasetSelect';

// ─── Schema (private) ──────────────────────────────────────────────────────

const rerunFormSchema = z.object({
  dataset: z.string().min(1, 'Please select a dataset'),
  markAsDeprecated: z.boolean(),
});

export type RerunFormValues = z.infer<typeof rerunFormSchema>;

function getDefaultValues(): RerunFormValues {
  return { dataset: '', markAsDeprecated: false };
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface WorkflowRunRerunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: RerunFormValues) => Promise<void>;
  workflowRunName: string;
  workflowName: string;
  isValid: boolean;
  allowedDatasetChoice: string[];
  validWorkflows: string[];
  canMarkAsDeprecated: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────

export function WorkflowRunRerunModal({
  isOpen,
  onClose,
  onSubmit,
  workflowRunName,
  workflowName,
  isValid,
  allowedDatasetChoice,
  validWorkflows,
  canMarkAsDeprecated,
}: WorkflowRunRerunModalProps) {
  const form = useForm<RerunFormValues>({
    resolver: zodResolver(rerunFormSchema),
    defaultValues: getDefaultValues(),
    mode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid: isFormValid },
  } = form;

  const selectedDataset = useWatch({ control, name: 'dataset' });
  const isRNAsum = workflowName.toUpperCase() === 'RNASUM';

  useEffect(() => {
    if (isOpen && !isSubmitting) {
      reset(getDefaultValues());
    }
  }, [isOpen, isSubmitting, reset]);

  const handleFormSubmit = async (data: RerunFormValues) => {
    try {
      await onSubmit(data);
      toast.success('Workflow rerun triggered successfully');
      onClose();
    } catch {
      toast.error('Failed to trigger workflow rerun');
    }
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Rerun Workflow'
      description={workflowRunName}
      icon={<RefreshCw className='h-5 w-5' />}
      size='lg'
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          >
            Close
          </button>
          {isValid && (
            <Button
              type='submit'
              form='workflow-run-rerun-form'
              disabled={isSubmitting || !isFormValid}
            >
              <RefreshCw className={isSubmitting ? 'animate-spin' : ''} />
              {isSubmitting ? 'Triggering...' : 'Rerun'}
            </Button>
          )}
        </>
      }
    >
      <form
        id='workflow-run-rerun-form'
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
        className='space-y-5'
      >
        {!isValid ? (
          /* ── Not eligible for rerun ── */
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20'>
            <div className='flex items-start gap-2.5'>
              <AlertTriangle className='text-destructive mt-0.5 h-4 w-4 shrink-0' />
              <div className='space-y-1'>
                <p className='text-sm font-medium text-red-700 dark:text-red-400'>
                  This workflow run is not eligible for rerun.
                </p>
                {validWorkflows.length > 0 && (
                  <p className='text-xs text-red-600 dark:text-red-500'>
                    Only the following workflow types support rerun:{' '}
                    <span className='font-medium'>{validWorkflows.join(', ')}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ── Valid — show configuration ── */
          <div className='space-y-5'>
            {/* Dataset selector */}
            <Controller
              control={control}
              name='dataset'
              render={({ field }) => (
                <div className='space-y-2'>
                  <label
                    htmlFor='workflow-run-rerun-dataset'
                    className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                  >
                    Please select the{' '}
                    <a
                      href='https://github.com/umccr/RNAsum/blob/master/TCGA_projects_summary.md'
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-600 hover:underline dark:text-blue-400'
                    >
                      TCGA
                    </a>{' '}
                    dataset to rerun <span className='text-destructive'>*</span>
                  </label>
                  <RNASUMDatasetSelect
                    inputId='workflow-run-rerun-dataset'
                    ariaInvalid={!!errors.dataset}
                    ariaDescribedBy={
                      errors.dataset ? 'workflow-run-rerun-dataset-error' : undefined
                    }
                    availableOptions={allowedDatasetChoice}
                    selectedValue={field.value || null}
                    onChange={field.onChange}
                    placeholder='Search datasets…'
                  />
                  {errors.dataset && (
                    <p
                      id='workflow-run-rerun-dataset-error'
                      className='text-destructive text-sm font-medium'
                    >
                      {errors.dataset.message}
                    </p>
                  )}
                </div>
              )}
            />

            <div className='h-px bg-neutral-100 dark:bg-[#2d3540]' />

            {/* Mark as deprecated */}
            {isRNAsum ? (
              <Controller
                control={control}
                name='markAsDeprecated'
                render={({ field }) => (
                  <div className='flex items-start gap-3'>
                    <input
                      type='checkbox'
                      id='rerun-mark-deprecated'
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={!selectedDataset || !canMarkAsDeprecated}
                      className='mt-0.5 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e]'
                    />
                    <div>
                      <label
                        htmlFor='rerun-mark-deprecated'
                        className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                      >
                        Mark the current run as &apos;DEPRECATED&apos;
                      </label>
                      <p className='mt-0.5 text-xs text-neutral-500 dark:text-[#9dabb9]'>
                        {canMarkAsDeprecated
                          ? 'This action is irreversible and will mark this workflow run as deprecated.'
                          : 'Deprecation is not available for the current workflow state.'}
                      </p>
                    </div>
                  </div>
                )}
              />
            ) : (
              <div className='flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                <Info className='mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500' />
                <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                  The &apos;Mark as deprecated&apos; option is only available for RNAsum workflow
                  runs.
                </p>
              </div>
            )}

            <div className='h-px bg-neutral-100 dark:bg-[#2d3540]' />

            <p className='text-destructive text-sm font-medium'>
              Are you sure you want to rerun this workflow?
            </p>
          </div>
        )}
      </form>
    </DialogFrame>
  );
}
