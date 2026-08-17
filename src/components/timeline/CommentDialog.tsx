import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { formatDateTimeLocalInputValue } from '@/utils/timeFormat';
import { TimelineCommentSeverityEnum, type CommentFormData } from './timeline.type';
import { TimelineDialogFrame } from './TimelineDialogFrame';

const commentSchema = z.object({
  timestamp: z.string().min(1, 'Timestamp is required'),
  comment: z
    .string()
    .min(1, 'Comment is required')
    .max(2000, 'Comment must be less than 2000 characters'),
  severity: z.enum(['DEBUG', 'INFO', 'WARNING', 'ERROR']),
});

export interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CommentFormData) => Promise<void>;
  initialValues?: Partial<CommentFormData>;
  mode?: 'create' | 'edit';
  title?: string;
  submitLabel?: string;
  hideTimestamp?: boolean;
  hideSeverity?: boolean;
  actorEmail?: string;
  actorTimestamp?: string;
}

function getDefaultValues(initialValues?: Partial<CommentFormData>): CommentFormData {
  const parsedInitialValues = commentSchema.partial().safeParse(initialValues);
  const safeInitialValues = parsedInitialValues.success ? parsedInitialValues.data : {};

  return {
    timestamp:
      safeInitialValues.timestamp ?? formatDateTimeLocalInputValue(new Date().toISOString()) ?? '',
    comment: safeInitialValues.comment ?? '',
    severity: safeInitialValues.severity ?? TimelineCommentSeverityEnum.INFO,
  };
}

export function CommentDialog({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  mode = 'create',
  title,
  submitLabel,
  hideTimestamp = false,
  hideSeverity = false,
  actorEmail,
  actorTimestamp,
}: CommentDialogProps) {
  const form = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: getDefaultValues(initialValues),
    mode: 'onChange',
  });

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  const commentValue = useWatch({
    control,
    name: 'comment',
    defaultValue: getDefaultValues(initialValues).comment,
  });

  useEffect(() => {
    if (isOpen && !isSubmitting) {
      reset(getDefaultValues(initialValues));
    }
  }, [initialValues, isOpen, isSubmitting, reset]);

  const isSubmitDisabled = isSubmitting || commentValue.trim().length === 0;
  const dialogTitle = title ?? (mode === 'edit' ? 'Edit Comment' : 'Add a new comment');
  const actionLabel = submitLabel ?? (mode === 'edit' ? 'Save Comment' : 'Add Comment');

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      await onSubmit(data);
      toast.success(
        mode === 'edit' ? 'Comment updated successfully' : 'Comment added successfully'
      );
      onClose();
    } catch (error) {
      toast.error(mode === 'edit' ? 'Failed to update comment' : 'Failed to add comment');
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <TimelineDialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={dialogTitle}
      icon={<MessageCircle className='h-5 w-5' />}
      actorEmail={actorEmail}
      actorTimestamp={actorTimestamp}
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            className={cn(
              'cursor-pointer rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            )}
          >
            Close
          </button>
          <Button type='submit' form='timeline-comment-form' disabled={isSubmitDisabled}>
            {isSubmitting ? 'Saving...' : actionLabel}
          </Button>
        </>
      }
    >
      <form
        id='timeline-comment-form'
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
        className='space-y-5'
      >
        {hideTimestamp && <input type='hidden' {...register('timestamp')} />}
        {hideSeverity && <input type='hidden' {...register('severity')} />}

        {!hideTimestamp && (
          <div className='space-y-2'>
            <label
              htmlFor='timeline-comment-timestamp'
              className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              Timestamp
            </label>
            <input
              id='timeline-comment-timestamp'
              type='datetime-local'
              aria-invalid={!!errors.timestamp}
              aria-describedby={errors.timestamp ? 'timeline-comment-timestamp-error' : undefined}
              {...register('timestamp')}
              className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
            />
            {errors.timestamp && (
              <p
                id='timeline-comment-timestamp-error'
                className='text-sm font-medium text-red-500 dark:text-red-400'
              >
                {errors.timestamp.message}
              </p>
            )}
          </div>
        )}

        {!hideSeverity && (
          <div className='space-y-2'>
            <label
              htmlFor='timeline-comment-severity'
              className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
            >
              Severity
            </label>
            <select
              id='timeline-comment-severity'
              aria-invalid={!!errors.severity}
              aria-describedby={errors.severity ? 'timeline-comment-severity-error' : undefined}
              {...register('severity')}
              className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
            >
              <option value={TimelineCommentSeverityEnum.DEBUG}>Debug</option>
              <option value={TimelineCommentSeverityEnum.INFO}>Info</option>
              <option value={TimelineCommentSeverityEnum.WARNING}>Warning</option>
              <option value={TimelineCommentSeverityEnum.ERROR}>Error</option>
            </select>
            {errors.severity && (
              <p
                id='timeline-comment-severity-error'
                className='text-sm font-medium text-red-500 dark:text-red-400'
              >
                {errors.severity.message}
              </p>
            )}
          </div>
        )}

        <div className='space-y-2'>
          <label
            htmlFor='timeline-comment-comment'
            className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            Comment
          </label>
          <textarea
            id='timeline-comment-comment'
            rows={5}
            aria-invalid={!!errors.comment}
            aria-describedby={errors.comment ? 'timeline-comment-comment-error' : undefined}
            {...register('comment')}
            placeholder='Write your comment here...'
            className='min-h-35 w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {errors.comment && (
            <p
              id='timeline-comment-comment-error'
              className='text-sm font-medium text-red-500 dark:text-red-400'
            >
              {errors.comment.message}
            </p>
          )}
        </div>
      </form>
    </TimelineDialogFrame>
  );
}
