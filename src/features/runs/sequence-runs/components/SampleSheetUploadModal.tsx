import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router';
import { useAuthContext } from '@/context/auth-context';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { useSequenceRunAddSampleSheetModel } from '../../shared/api/sequence.api';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const uploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  comment: z.string().trim().min(1, { message: 'Comment is required' }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;
const SAMPLE_SHEET_UPLOAD_FORM_ID = 'sample-sheet-upload-form';
const SAMPLE_SHEET_FILE_INPUT_ID = 'sample-sheet-file';
const SAMPLE_SHEET_FILE_DESCRIPTION_ID = 'sample-sheet-file-description';
const SAMPLE_SHEET_COMMENT_ID = 'sample-sheet-comment';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SampleSheetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SampleSheetUploadModal({
  isOpen,
  onClose,
  onSuccess,
}: SampleSheetUploadModalProps) {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();
  const { user } = useAuthContext();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    resetField,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { comment: '' },
  });

  const file = useWatch({ control, name: 'file' });

  const { mutateAsync: uploadSampleSheet } = useSequenceRunAddSampleSheetModel();

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    reset();
    onClose();
  }, [isSubmitting, onClose, reset]);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) {
      resetField('file');
      return;
    }

    setValue('file', selectedFile, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  const handleClearFile = () => {
    resetField('file');
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!instrumentRunId) {
      toast.error('Instrument run ID is missing');
      return;
    }

    if (!user?.email) {
      toast.error('User email is missing');
      return;
    }

    const formData = new FormData();
    formData.append('instrument_run_id', instrumentRunId);
    formData.append('created_by', user.email);
    formData.append('file', data.file);
    formData.append('comment', data.comment);

    try {
      await uploadSampleSheet({
        body: formData as unknown as {
          file: string;
          instrumentRunId: string;
          createdBy: string;
          comment: string;
        },
      });
      toast.success('Sample sheet uploaded successfully');
      reset();
      onSuccess?.();
      onClose();
    } catch {
      toast.error('Failed to upload sample sheet');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileChange(files[0]);
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title='Upload Sample Sheet'
      description='Upload a CSV sample sheet for this instrument run.'
      icon={<Upload className='h-5 w-5' />}
      size='md'
      closeLabel='Close upload sample sheet dialog'
      closeDisabled={isSubmitting}
      footer={
        <>
          <button
            type='button'
            onClick={handleClose}
            disabled={isSubmitting}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <Button type='submit' form={SAMPLE_SHEET_UPLOAD_FORM_ID} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                Uploading...
              </>
            ) : (
              <>
                <Upload />
                Upload
              </>
            )}
          </Button>
        </>
      }
    >
      <form
        id={SAMPLE_SHEET_UPLOAD_FORM_ID}
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className='space-y-5'
      >
        {/* File drop zone */}
        <div>
          <label
            htmlFor={SAMPLE_SHEET_FILE_INPUT_ID}
            className='mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            File <span className='text-red-500'>*</span>
          </label>
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            aria-describedby={
              errors.file
                ? `${SAMPLE_SHEET_FILE_DESCRIPTION_ID} ${SAMPLE_SHEET_FILE_INPUT_ID}-error`
                : SAMPLE_SHEET_FILE_DESCRIPTION_ID
            }
            className={cn(
              'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
              file
                ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                : errors.file
                  ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                  : 'border-neutral-300 hover:border-neutral-400 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
            )}
          >
            {file ? (
              <div className='space-y-2'>
                <FileText className='mx-auto h-8 w-8 text-green-600 dark:text-green-400' />
                <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                  {file.name}
                </p>
                <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <button
                  type='button'
                  onClick={handleClearFile}
                  disabled={isSubmitting}
                  className='text-xs text-blue-600 hover:underline dark:text-blue-400'
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className='space-y-2'>
                <Upload className='mx-auto h-8 w-8 text-neutral-400 dark:text-[#9dabb9]' />
                <p className='text-sm text-neutral-600 dark:text-neutral-400'>
                  Drag and drop your file here, or{' '}
                  <label
                    htmlFor={SAMPLE_SHEET_FILE_INPUT_ID}
                    className='cursor-pointer text-blue-600 hover:underline dark:text-blue-400'
                  >
                    browse
                    <input
                      id={SAMPLE_SHEET_FILE_INPUT_ID}
                      type='file'
                      {...register('file')}
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      className='hidden'
                      accept='.csv'
                      disabled={isSubmitting}
                      aria-invalid={!!errors.file}
                      aria-describedby={
                        errors.file
                          ? `${SAMPLE_SHEET_FILE_DESCRIPTION_ID} ${SAMPLE_SHEET_FILE_INPUT_ID}-error`
                          : SAMPLE_SHEET_FILE_DESCRIPTION_ID
                      }
                    />
                  </label>
                </p>
                <p
                  id={SAMPLE_SHEET_FILE_DESCRIPTION_ID}
                  className='text-xs text-neutral-500 dark:text-neutral-400'
                >
                  CSV files only
                </p>
              </div>
            )}
          </div>
          {errors.file && (
            <p id={`${SAMPLE_SHEET_FILE_INPUT_ID}-error`} className='mt-1 text-xs text-red-500'>
              {errors.file.message}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label
            htmlFor={SAMPLE_SHEET_COMMENT_ID}
            className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            Comment <span className='text-red-500'>*</span>
          </label>
          <textarea
            id={SAMPLE_SHEET_COMMENT_ID}
            {...register('comment')}
            placeholder='Add notes about this sample sheet...'
            rows={3}
            disabled={isSubmitting}
            aria-invalid={!!errors.comment}
            aria-describedby={errors.comment ? `${SAMPLE_SHEET_COMMENT_ID}-error` : undefined}
            className={cn(
              'w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-[#1e252e] dark:text-slate-100',
              errors.comment
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-300 dark:border-[#2d3540]'
            )}
          />
          {errors.comment && (
            <p id={`${SAMPLE_SHEET_COMMENT_ID}-error`} className='mt-1 text-xs text-red-500'>
              {errors.comment.message}
            </p>
          )}
        </div>
      </form>
    </DialogFrame>
  );
}
