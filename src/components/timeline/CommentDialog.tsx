import { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import { TimelineCommentSeverityEnum, type CommentFormData } from './timeline.type';
import { TimelineDialogFrame } from './TimelineDialogFrame';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/form/form';

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
    timestamp: safeInitialValues.timestamp ?? new Date().toISOString().slice(0, 16),
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
    formState: { isSubmitting },
  } = form;

  const commentValue = useWatch({
    control,
    name: 'comment',
    defaultValue: getDefaultValues(initialValues).comment,
  });

  useEffect(() => {
    if (isOpen) {
      reset(getDefaultValues(initialValues));
    }
  }, [initialValues, isOpen, reset]);

  const isSubmitDisabled = isSubmitting || commentValue.trim().length === 0;
  const dialogTitle = title ?? (mode === 'edit' ? 'Edit Comment' : 'Add a new comment');
  const actionLabel = submitLabel ?? (mode === 'edit' ? 'Save Comment' : 'Add Comment');

  const handleFormSubmit = async (data: CommentFormData) => {
    try {
      await onSubmit(data);
      toast.success(
        mode === 'edit' ? 'Comment updated successfully' : 'Comment added successfully'
      );
      reset(getDefaultValues(initialValues));
      onClose();
    } catch (error) {
      toast.error(mode === 'edit' ? 'Failed to update comment' : 'Failed to add comment');
      console.error('Error submitting comment:', error);
    }
  };

  const handleClose = () => {
    reset(getDefaultValues(initialValues));
    onClose();
  };

  return (
    <Form {...form}>
      <TimelineDialogFrame
        isOpen={isOpen}
        onClose={handleClose}
        title={dialogTitle}
        icon={<MessageCircle className='h-5 w-5' />}
        actorEmail={actorEmail}
        actorTimestamp={actorTimestamp}
        footer={
          <>
            <button
              type='button'
              onClick={handleClose}
              className={cn(
                'cursor-pointer rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
                'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
                'focus:ring-2 focus:ring-blue-500 focus:outline-none',
                'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
              )}
            >
              Close
            </button>
            <button
              type='submit'
              form='timeline-comment-form'
              disabled={isSubmitDisabled}
              className={cn(
                'cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors',
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
          id='timeline-comment-form'
          onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
          className='space-y-5'
        >
          {hideTimestamp && <input type='hidden' {...register('timestamp')} />}
          {hideSeverity && <input type='hidden' {...register('severity')} />}

          {!hideTimestamp && (
            <FormField
              control={control}
              name='timestamp'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timestamp</FormLabel>
                  <FormControl>
                    <input
                      type='datetime-local'
                      {...field}
                      className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {!hideSeverity && (
            <FormField
              control={control}
              name='severity'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Severity</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
                    >
                      <option value={TimelineCommentSeverityEnum.DEBUG}>Debug</option>
                      <option value={TimelineCommentSeverityEnum.INFO}>Info</option>
                      <option value={TimelineCommentSeverityEnum.WARNING}>Warning</option>
                      <option value={TimelineCommentSeverityEnum.ERROR}>Error</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={control}
            name='comment'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comment</FormLabel>
                <FormControl>
                  <textarea
                    rows={5}
                    {...field}
                    placeholder='Write your comment here...'
                    className='min-h-35 w-full resize-none rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm placeholder:text-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </TimelineDialogFrame>
    </Form>
  );
}
