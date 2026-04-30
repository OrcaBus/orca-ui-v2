import { useCallback } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-context';
import { useSequenceRunAddSampleSheetModel } from '../api/sequence.api';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const uploadSchema = z.object({
  file: z.instanceof(File, { message: 'Please select a file' }),
  comment: z.string().min(1, { message: 'Comment is required' }),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

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
    if (selectedFile) setValue('file', selectedFile, { shouldValidate: true });
  };

  const onSubmit = async (data: UploadFormValues) => {
    const formData = new FormData();
    formData.append('instrument_run_id', instrumentRunId ?? '');
    formData.append('created_by', user?.email ?? '');
    formData.append('file', data.file);
    formData.append('comment', data.comment ?? '');

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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileChange(files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-900'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <h3 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Upload Sample Sheet
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className='text-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed dark:hover:text-white'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={(e) => void handleSubmit(onSubmit)(e)}>
          <div className='space-y-4 px-6 py-4'>
            {/* File drop zone */}
            <div>
              <label className='mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                File <span className='text-red-500'>*</span>
              </label>
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                  file
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : errors.file
                      ? 'border-red-400 bg-red-50 dark:bg-red-950/20'
                      : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500'
                }`}
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
                      onClick={() => reset({ file: undefined as unknown as File, comment: '' })}
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
                      <label className='cursor-pointer text-blue-600 hover:underline dark:text-blue-400'>
                        browse
                        <input
                          type='file'
                          {...register('file')}
                          onChange={(e) => handleFileChange(e.target.files?.[0])}
                          className='hidden'
                          accept='.csv,.xlsx'
                        />
                      </label>
                    </p>
                    <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                      CSV or XLSX files only
                    </p>
                  </div>
                )}
              </div>
              {errors.file && <p className='mt-1 text-xs text-red-500'>{errors.file.message}</p>}
            </div>

            {/* Comment */}
            <div>
              <label className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                Comment <span className='text-red-500'>*</span>
              </label>
              <textarea
                {...register('comment')}
                placeholder='Add notes about this sample sheet...'
                rows={3}
                disabled={isSubmitting}
                className={`w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-100 ${
                  errors.comment
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-neutral-300 dark:border-neutral-600'
                }`}
              />
              {errors.comment && (
                <p className='mt-1 text-xs text-red-500'>{errors.comment.message}</p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700'>
            <button
              type='button'
              onClick={handleClose}
              disabled={isSubmitting}
              className='rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
            >
              {isSubmitting ? (
                <>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className='h-4 w-4' />
                  Upload
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
