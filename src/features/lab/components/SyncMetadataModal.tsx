import { useState } from 'react';
import { RefreshCw, Upload, FileSpreadsheet, Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface SyncMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SyncMetadataModal({ isOpen, onClose }: SyncMetadataModalProps) {
  const [syncMethod, setSyncMethod] = useState<'google' | 'csv'>('google');
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState('');

  const handleClose = () => {
    if (!isSyncing) {
      setSyncError('');
      setGoogleSheetUrl('');
      setCsvFile(null);
      onClose();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setSyncError('');
      } else {
        setSyncError('Please select a valid CSV file');
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setCsvFile(file);
        setSyncError('');
      } else {
        setSyncError('Please select a valid CSV file');
      }
    }
  };

  const handleStartSync = () => {
    setSyncError('');

    if (syncMethod === 'google' && !googleSheetUrl.trim()) {
      setSyncError('Please enter a Google Sheet URL');
      return;
    }
    if (syncMethod === 'csv' && !csvFile) {
      setSyncError('Please select a CSV file');
      return;
    }

    setIsSyncing(true);

    setTimeout(() => {
      setIsSyncing(false);
      onClose();
      toast.success('Metadata synced');
      setGoogleSheetUrl('');
      setCsvFile(null);
      setSyncError('');
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div
        className='absolute inset-0 bg-black/50 dark:bg-black/60'
        onClick={handleClose}
        aria-hidden
      />

      <div
        className='relative w-full max-w-lg rounded-lg border border-neutral-200 bg-white shadow-xl dark:border-[#2d3540] dark:bg-[#111418]'
        role='dialog'
        aria-modal='true'
        aria-labelledby='sync-metadata-title'
      >
        <div className='border-b border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <h2
            id='sync-metadata-title'
            className='text-lg font-semibold text-neutral-900 dark:text-slate-100'
          >
            Sync Metadata
          </h2>
        </div>

        <div className='space-y-5 p-6'>
          <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
            Sync library metadata from external sources. Choose a method below.
          </p>

          <div className='space-y-4'>
            <div
              className={`rounded-lg border p-4 transition-colors ${
                syncMethod === 'google'
                  ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
              }`}
            >
              <label className='flex cursor-pointer items-start gap-3'>
                <input
                  type='radio'
                  name='syncMethod'
                  value='google'
                  checked={syncMethod === 'google'}
                  onChange={() => setSyncMethod('google')}
                  disabled={isSyncing}
                  className='mt-0.5 h-4 w-4 border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-[#2d3540] dark:text-[#137fec] dark:focus:ring-[#137fec]'
                />
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <FileSpreadsheet className='h-5 w-5 text-neutral-700 dark:text-[#9dabb9]' />
                    <span className='font-medium text-neutral-900 dark:text-slate-100'>
                      Google Tracking Sheet
                    </span>
                  </div>
                  <p className='mb-3 text-sm text-neutral-600 dark:text-[#9dabb9]'>
                    Pull the latest tracking sheet data from a Google Sheet URL
                  </p>
                  {syncMethod === 'google' && (
                    <input
                      type='text'
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      placeholder='https://docs.google.com/spreadsheets/d/...'
                      disabled={isSyncing}
                      className='w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-100 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec] dark:disabled:bg-[#2d3540]/50'
                    />
                  )}
                </div>
              </label>
            </div>

            <div
              className={`rounded-lg border p-4 transition-colors ${
                syncMethod === 'csv'
                  ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                  : 'border-neutral-200 hover:border-neutral-300 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
              }`}
            >
              <label className='flex cursor-pointer items-start gap-3'>
                <input
                  type='radio'
                  name='syncMethod'
                  value='csv'
                  checked={syncMethod === 'csv'}
                  onChange={() => setSyncMethod('csv')}
                  disabled={isSyncing}
                  className='mt-0.5 h-4 w-4 border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-[#2d3540] dark:text-[#137fec] dark:focus:ring-[#137fec]'
                />
                <div className='flex-1'>
                  <div className='mb-2 flex items-center gap-2'>
                    <Upload className='h-5 w-5 text-neutral-700 dark:text-[#9dabb9]' />
                    <span className='font-medium text-neutral-900 dark:text-slate-100'>
                      CSV via Presigned Upload
                    </span>
                  </div>
                  <p className='mb-3 text-sm text-neutral-600 dark:text-[#9dabb9]'>
                    Upload a CSV file using a presigned upload flow
                  </p>
                  {syncMethod === 'csv' && (
                    <div>
                      <input
                        type='file'
                        id='csv-file-input'
                        accept='.csv'
                        onChange={handleFileSelect}
                        disabled={isSyncing}
                        className='hidden'
                      />

                      {!csvFile ? (
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`rounded-md border-2 border-dashed p-6 text-center transition-colors ${
                            isDragging
                              ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                              : 'border-neutral-300 hover:border-neutral-400 dark:border-[#2d3540] dark:hover:border-[#3d4550]'
                          } ${isSyncing ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                          onClick={() =>
                            !isSyncing && document.getElementById('csv-file-input')?.click()
                          }
                        >
                          <Upload className='mx-auto mb-2 h-8 w-8 text-neutral-400 dark:text-[#9dabb9]' />
                          <p className='mb-1 text-sm text-neutral-600 dark:text-[#9dabb9]'>
                            Drop CSV file here or click to browse
                          </p>
                          <p className='text-xs text-neutral-500 dark:text-[#9dabb9]/80'>
                            Accepts .csv files only
                          </p>
                        </div>
                      ) : (
                        <div className='flex items-center justify-between rounded-md border border-neutral-200 bg-neutral-50 p-3 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                          <div className='flex items-center gap-2'>
                            <Check className='h-4 w-4 text-green-600 dark:text-green-400' />
                            <span className='text-sm text-neutral-900 dark:text-slate-100'>
                              {csvFile.name}
                            </span>
                          </div>
                          {!isSyncing && (
                            <button
                              onClick={() => setCsvFile(null)}
                              type='button'
                              className='text-neutral-500 hover:text-neutral-700 dark:text-[#9dabb9] dark:hover:text-slate-100'
                              aria-label='Remove file'
                            >
                              <X className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          {syncError && (
            <div className='rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10'>
              <p className='text-sm text-red-800 dark:text-red-400'>{syncError}</p>
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-2 border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-[#2d3540] dark:bg-[#1e252e]'>
          <button
            type='button'
            onClick={handleClose}
            disabled={isSyncing}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <button
            type='button'
            onClick={() => void handleStartSync()}
            disabled={isSyncing}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            {isSyncing ? (
              <>
                <Loader2 className='h-4 w-4 animate-spin' />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className='h-4 w-4' />
                Start Sync
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
