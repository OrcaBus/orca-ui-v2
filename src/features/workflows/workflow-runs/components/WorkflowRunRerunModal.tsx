import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, X, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { RNASUMSelect } from './RNASUMSelect';

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
    formState: { isSubmitting, isValid: isFormValid },
  } = form;

  const selectedDataset = useWatch({ control, name: 'dataset' });
  const isRNAsum = workflowName.toUpperCase() === 'RNASUM';

  useEffect(() => {
    if (isOpen) reset(getDefaultValues());
  }, [isOpen, reset]);

  const handleFormSubmit = async (data: RerunFormValues) => {
    try {
      await onSubmit(data);
      toast.success('Workflow rerun triggered successfully');
      reset(getDefaultValues());
      onClose();
    } catch {
      toast.error('Failed to trigger workflow rerun');
    }
  };

  const handleClose = () => {
    reset(getDefaultValues());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-xl rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        {/* Header */}
        <div className='flex items-start justify-between border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <div className='flex items-center gap-2.5'>
            <RefreshCw className='h-5 w-5 text-blue-600 dark:text-blue-400' />
            <div>
              <h2 className='text-base font-semibold text-neutral-900 dark:text-white'>
                Rerun Workflow
              </h2>
              <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
                {workflowRunName}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <Form {...form}>
          <form onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)} className='p-6'>
            {!isValid ? (
              /* ── Not eligible for rerun ── */
              <div className='rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/20'>
                <div className='flex items-start gap-2.5'>
                  <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-500 dark:text-red-400' />
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
                <FormField
                  control={control}
                  name='dataset'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
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
                      </FormLabel>
                      <FormControl>
                        <RNASUMSelect
                          availableOptions={allowedDatasetChoice}
                          selectedValue={field.value || null}
                          onChange={field.onChange}
                          placeholder='Search datasets…'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className='h-px bg-neutral-100 dark:bg-[#2d3540]' />

                {/* Mark as deprecated */}
                {isRNAsum ? (
                  <FormField
                    control={control}
                    name='markAsDeprecated'
                    render={({ field }) => (
                      <FormItem>
                        <div className='flex items-start gap-3'>
                          <FormControl>
                            <input
                              type='checkbox'
                              id='rerun-mark-deprecated'
                              checked={field.value}
                              onChange={field.onChange}
                              disabled={!selectedDataset}
                              className='mt-0.5 h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e]'
                            />
                          </FormControl>
                          <div>
                            <FormLabel htmlFor='rerun-mark-deprecated'>
                              Mark the current run as &apos;DEPRECATED&apos;
                            </FormLabel>
                            <p className='mt-0.5 text-xs text-neutral-500 dark:text-[#9dabb9]'>
                              This action is irreversible and will mark this workflow run as
                              deprecated.
                            </p>
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className='flex items-start gap-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                    <Info className='mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500' />
                    <p className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                      The &apos;Mark as deprecated&apos; option is only available for RNAsum
                      workflow runs.
                    </p>
                  </div>
                )}

                <div className='h-px bg-neutral-100 dark:bg-[#2d3540]' />

                <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                  Are you sure you want to rerun this workflow?
                </p>
              </div>
            )}

            {/* Footer */}
            <div className='mt-6 flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
              >
                Close
              </button>
              {isValid && (
                <button
                  type='submit'
                  disabled={isSubmitting || !isFormValid}
                  className='flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#137fec] dark:hover:bg-blue-600'
                >
                  <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                  {isSubmitting ? 'Triggering…' : 'Rerun'}
                </button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
