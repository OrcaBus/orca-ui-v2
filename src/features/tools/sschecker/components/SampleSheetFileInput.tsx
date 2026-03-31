import { useRef, useState } from 'react';
import { FileText, UploadCloud } from 'lucide-react';

interface SampleSheetFileInputProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileClear: () => void;
}

export function SampleSheetFileInput({
  selectedFile,
  onFileSelect,
  onFileClear,
}: SampleSheetFileInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.tsv'))) {
      onFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleClear = () => {
    onFileClear();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (selectedFile) {
    return (
      <div className='flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2.5 dark:border-green-700 dark:bg-green-950'>
        <FileText className='h-4 w-4 shrink-0 text-green-600 dark:text-green-400' />
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium text-green-900 dark:text-green-100'>
            {selectedFile.name}
          </p>
          <p className='text-xs text-green-600 dark:text-green-400'>
            {(selectedFile.size / 1024).toFixed(1)} KB
          </p>
        </div>
        <button
          type='button'
          onClick={handleClear}
          className='shrink-0 text-xs text-neutral-500 underline hover:text-neutral-800 dark:hover:text-neutral-200'
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          fileInputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleFileDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`cursor-pointer rounded-lg border-2 border-dashed p-5 text-center transition-colors ${
        isDragging
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800'
      }`}
    >
      <UploadCloud className='mx-auto mb-2 h-8 w-8 text-slate-400' />
      <p className='text-sm text-neutral-600 dark:text-neutral-400'>
        <span className='font-medium text-blue-600 dark:text-blue-400'>Click to upload</span> or
        drag and drop
      </p>
      <p className='mt-1 text-xs text-neutral-400 dark:text-neutral-500'>CSV or TSV files only</p>
      <input
        ref={fileInputRef}
        type='file'
        accept='.csv,.tsv'
        onChange={handleFileInputChange}
        className='hidden'
        aria-label='Select sample sheet file (CSV or TSV)'
      />
    </div>
  );
}
