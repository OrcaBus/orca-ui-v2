import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RefreshCw, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';
import { DialogFrame } from '@/components/modals/DialogFrame';
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

  return (
    <Form {...form}>
      <DialogFrame
        isOpen={isOpen}
        onClose={handleClose}
        title='Rerun Workflow'
        description={workflowRunName}
        icon={<RefreshCw className='h-5 w-5' />}
        size='lg'
        footer={
          <>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            >
              Close
            </button>
            {isValid && (
              <button
                type='submit'
                form='workflow-run-rerun-form'
                disabled={isSubmitting || !isFormValid}
                className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
              >
                <RefreshCw className={`h-4 w-4 ${isSubmitting ? 'animate-spin' : ''}`} />
                {isSubmitting ? 'Triggering...' : 'Rerun'}
              </button>
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
                      <RNASUMDatasetSelect
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
                    The &apos;Mark as deprecated&apos; option is only available for RNAsum workflow
                    runs.
                  </p>
                </div>
              )}

              <div className='h-px bg-neutral-100 dark:bg-[#2d3540]' />

              <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                Are you sure you want to rerun this workflow?
              </p>
            </div>
          )}
        </form>
      </DialogFrame>
    </Form>
  );
}
