import { useState, useCallback } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadSampleSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, comment: string) => Promise<void>;
}

export function UploadSampleSheetModal({ isOpen, onClose, onSubmit }: UploadSampleSheetModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadComment, setUploadComment] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = useCallback(() => {
    if (isUploading) return;
    setUploadFile(null);
    setUploadComment('');
    setIsDragging(false);
    onClose();
  }, [onClose, isUploading]);

  const handleSubmit = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      await onSubmit(uploadFile, uploadComment);
      setUploadFile(null);
      setUploadComment('');
      handleClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) setUploadFile(files[0]);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='w-full max-w-md rounded-lg bg-white shadow-xl dark:bg-neutral-900'>
        <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <h3 className='text-lg font-semibold text-neutral-900 dark:text-neutral-100'>
            Upload Sample Sheet
          </h3>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className='text-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed dark:hover:text-white'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        <div className='space-y-4 px-6 py-4'>
          <div>
            <label className='mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              File <span className='text-red-500'>*</span>
            </label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
                  : uploadFile
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/30'
                    : 'border-neutral-300 hover:border-neutral-400 dark:border-neutral-600 dark:hover:border-neutral-500'
              }`}
            >
              {uploadFile ? (
                <div className='space-y-2'>
                  <FileText className='mx-auto h-8 w-8 text-green-600 dark:text-green-400' />
                  <p className='text-sm font-medium text-neutral-900 dark:text-neutral-100'>
                    {uploadFile.name}
                  </p>
                  <p className='text-xs text-neutral-500 dark:text-neutral-400'>
                    {(uploadFile.size / 1024).toFixed(1)} KB
                  </p>
                  <button
                    onClick={() => setUploadFile(null)}
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
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files && files.length > 0) setUploadFile(files[0]);
                        }}
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
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Comment (Optional)
            </label>
            <textarea
              value={uploadComment}
              onChange={(e) => setUploadComment(e.target.value)}
              placeholder='Add notes about this sample sheet...'
              rows={3}
              className='w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100'
              disabled={isUploading}
            />
          </div>
        </div>

        <div className='flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-neutral-700'>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className='rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-600 dark:text-neutral-200 dark:hover:bg-neutral-800'
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!uploadFile || isUploading}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            {isUploading ? (
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
      </div>
    </div>
  );
}
