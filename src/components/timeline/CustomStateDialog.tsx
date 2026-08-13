import { useEffect } from 'react';
import { CirclePlus } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { formatDateTimeLocalInputValue } from '@/utils/timeFormat';
import { TimelineDialogFrame } from './TimelineDialogFrame';

const customStateSchema = z.object({
  stateName: z.string().min(1, 'Please select a state'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  comment: z.string().max(2000, 'Comment must be less than 2000 characters'),
});

const requiredCommentCustomStateSchema = customStateSchema.extend({
  comment: z
    .string()
    .trim()
    .min(1, 'Comment is required')
    .max(2000, 'Comment must be less than 2000 characters'),
});

type CustomStateFormData = z.infer<typeof customStateSchema>;

export interface CustomStateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomStateFormData) => Promise<void>;
  availableStates?: Array<{ value: string; label: string }>;
  initialValues?: Partial<CustomStateFormData>;
  mode?: 'create' | 'edit';
  title?: string;
  submitLabel?: string;
  hideTimestamp?: boolean;
  hideComment?: boolean;
  requireComment?: boolean;
  actorEmail?: string;
  actorTimestamp?: string;
}

function getDefaultValues(initialValues?: Partial<CustomStateFormData>): CustomStateFormData {
  return {
    stateName: initialValues?.stateName ?? '',
    timestamp:
      initialValues?.timestamp ?? formatDateTimeLocalInputValue(new Date().toISOString()) ?? '',
    comment: initialValues?.comment ?? '',
  };
}

export function CustomStateDialog({
  isOpen,
  onClose,
  onSubmit,
  availableStates = [],
  initialValues,
  mode = 'create',
  title,
  submitLabel,
  hideTimestamp = false,
  hideComment = false,
  requireComment = false,
  actorEmail,
  actorTimestamp,
}: CustomStateDialogProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CustomStateFormData>({
    resolver: zodResolver(requireComment ? requiredCommentCustomStateSchema : customStateSchema),
    defaultValues: getDefaultValues(initialValues),
    mode: 'onChange',
  });

  const selectedStateName = useWatch({
    control,
    name: 'stateName',
    defaultValue: getDefaultValues(initialValues).stateName,
  });

  useEffect(() => {
    if (isOpen && !isSubmitting) {
      reset(getDefaultValues(initialValues));
    }
  }, [initialValues, isOpen, isSubmitting, reset]);

  const usesProvidedStateOptions = Array.isArray(availableStates);
  const hasSelectableStates = (availableStates?.length ?? 0) > 0;
  const shouldShowStateWarning = usesProvidedStateOptions && !hasSelectableStates;
  const isSubmitDisabled =
    isSubmitting || shouldShowStateWarning || selectedStateName.trim().length === 0;

  const dialogTitle = title ?? (mode === 'edit' ? 'Edit State' : 'Add New State');
  const actionLabel = submitLabel ?? (mode === 'edit' ? 'Save State' : 'Add State');

  const handleFormSubmit = async (data: CustomStateFormData) => {
    try {
      await onSubmit(data);
      toast.success(
        mode === 'edit' ? 'Custom state updated successfully' : 'Custom state added successfully'
      );
      onClose();
    } catch (error) {
      toast.error(mode === 'edit' ? 'Failed to update custom state' : 'Failed to add custom state');
      console.error('Error submitting custom state:', error);
    }
  };

  return (
    <TimelineDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      icon={<CirclePlus className='h-5 w-5' />}
      actorEmail={actorEmail}
      actorTimestamp={actorTimestamp}
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            className={cn(
              'rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            )}
          >
            Close
          </button>
          <button
            type='submit'
            form='timeline-custom-state-form'
            disabled={isSubmitDisabled}
            className={cn(
              'rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
              'hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
            )}
          >
            {isSubmitting ? 'Saving...' : actionLabel}
          </button>
        </>
      }
    >
      <form
        id='timeline-custom-state-form'
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
        className='space-y-5'
      >
        {hideTimestamp && <input type='hidden' {...register('timestamp')} />}
        {hideComment && <input type='hidden' {...register('comment')} />}

        {!hideTimestamp && (
          <div className='space-y-2'>
            <label
              htmlFor='timestamp'
              className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              Timestamp
            </label>
            <input
              id='timestamp'
              type='datetime-local'
              {...register('timestamp')}
              className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
            />
            {errors.timestamp && (
              <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                {errors.timestamp.message}
              </p>
            )}
          </div>
        )}

        {usesProvidedStateOptions ? (
          hasSelectableStates ? (
            <div className='space-y-3'>
              <input type='hidden' {...register('stateName')} />
              <p className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                Please select the state status:
              </p>
              <div className='space-y-2'>
                {availableStates?.map((state) => {
                  const isSelected = selectedStateName === state.value;

                  return (
                    <button
                      key={state.value}
                      type='button'
                      onClick={() =>
                        setValue('stateName', state.value, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        })
                      }
                      className={cn(
                        'flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm transition-colors',
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                          : 'border-neutral-200 hover:border-neutral-300 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-0.5 h-4 w-4 rounded-full border',
                          isSelected ? 'border-blue-600 bg-blue-600' : 'border-neutral-300',
                          'dark:border-[#2d3540]'
                        )}
                      />
                      <span className='font-medium text-neutral-900 dark:text-slate-100'>
                        {state.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.stateName && (
                <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                  {errors.stateName.message}
                </p>
              )}
            </div>
          ) : (
            <p className='text-base font-medium text-red-500 dark:text-red-400'>
              Warning: No valid state options found for the current run.
            </p>
          )
        ) : (
          <div className='space-y-2'>
            <label
              htmlFor='stateName'
              className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              State Name
            </label>
            <input
              id='stateName'
              type='text'
              {...register('stateName')}
              placeholder='Enter a state...'
              className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
            />
            {errors.stateName && (
              <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                {errors.stateName.message}
              </p>
            )}
          </div>
        )}

        {!hideComment && (
          <div className='space-y-2'>
            <label
              htmlFor='comment'
              className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              Comment
              {requireComment && <span className='text-destructive'> *</span>}
            </label>
            <textarea
              id='comment'
              rows={5}
              {...register('comment')}
              required={requireComment}
              placeholder='Write your state comment here...'
              className='min-h-35 w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
            />
            {errors.comment && (
              <p className='text-sm font-medium text-red-500 dark:text-red-400'>
                {errors.comment.message}
              </p>
            )}
          </div>
        )}
      </form>
    </TimelineDialogFrame>
  );
}
