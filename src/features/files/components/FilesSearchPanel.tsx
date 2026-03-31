import { Folder, Search } from 'lucide-react';
import { WORKFLOW_PATTERNS, FILE_EXTENSIONS } from '../constants';
import type { UseFilesSearchReturn } from '../hooks/useFilesSearch';

export interface FilesSearchPanelProps {
  search: UseFilesSearchReturn;
}

function appendOrSetPattern(current: string, extension: string): string {
  if (!current.trim()) return extension;
  const withoutExtension = current.replace(/\*\.[a-zA-Z0-9.]+$/, '').trim();
  return withoutExtension ? `${withoutExtension}${extension}` : extension;
}

export function FilesSearchPanel({ search }: FilesSearchPanelProps) {
  const {
    portalRunId,
    setPortalRunId,
    bucketName,
    setBucketName,
    s3KeyPattern,
    setS3KeyPattern,
    searchError,
    canSearch,
    handleSearch,
    handleClear,
  } = search;

  const handleWorkflowPatternClick = (pattern: string) => setS3KeyPattern(pattern);
  const handleExtensionClick = (extension: string) =>
    setS3KeyPattern(appendOrSetPattern(s3KeyPattern, extension));

  const inputClass =
    'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100';
  const labelClass = 'mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300';

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900'>
      <div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div>
          <label htmlFor='portalRunId' className={labelClass}>
            Portal Run ID
          </label>
          <input
            type='text'
            id='portalRunId'
            value={portalRunId}
            onChange={(e) => setPortalRunId(e.target.value)}
            placeholder='Portal Run ID (optional)'
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor='bucketName' className={labelClass}>
            Bucket Name
          </label>
          <input
            type='text'
            id='bucketName'
            value={bucketName}
            onChange={(e) => setBucketName(e.target.value)}
            placeholder='Bucket name (optional)'
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor='s3KeyPattern' className={labelClass}>
            S3 Key Pattern
          </label>
          <input
            type='text'
            id='s3KeyPattern'
            value={s3KeyPattern}
            onChange={(e) => setS3KeyPattern(e.target.value)}
            placeholder='S3 key pattern (supports * wildcard), e.g. /123456/'
            className={inputClass}
          />
        </div>
      </div>

      {searchError && (
        <p className='mb-4 text-sm text-red-600 dark:text-red-400' role='alert'>
          {searchError}
        </p>
      )}

      <div className='mb-4'>
        <p className='text-xs text-neutral-500 dark:text-neutral-400'>
          Provide at least one of the fields above to search. Use an asterisk (*) in S3 Key Pattern
          as a wildcard.
        </p>
      </div>

      <div className='mb-4 border-t border-neutral-200 pt-4 dark:border-neutral-700'>
        <div className='mb-3 flex items-center gap-2'>
          <Folder className='h-4 w-4 text-neutral-500 dark:text-neutral-400' />
          <h3 className='text-sm font-semibold text-neutral-700 dark:text-neutral-300'>
            Shortcut Filters
          </h3>
        </div>

        <div className='mb-4'>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
              Workflow Patterns
            </span>
            <span className='text-xs text-neutral-500 dark:text-neutral-500'>
              (click to set S3 key pattern)
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {WORKFLOW_PATTERNS.map((pattern) => {
              const isActive = s3KeyPattern === pattern;
              return (
                <button
                  key={pattern}
                  type='button'
                  onClick={() => handleWorkflowPatternClick(pattern)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900'
                  }`}
                  title={`Set S3 key pattern to: ${pattern}`}
                >
                  {pattern}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className='mb-2 flex items-center gap-2'>
            <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
              File Extensions
            </span>
            <span className='text-xs text-neutral-500 dark:text-neutral-500'>
              (click to append to pattern)
            </span>
          </div>
          <div className='flex flex-wrap gap-2'>
            {FILE_EXTENSIONS.map((extension) => {
              const isActive = s3KeyPattern.includes(extension);
              return (
                <button
                  key={extension}
                  type='button'
                  onClick={() => handleExtensionClick(extension)}
                  className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
                  }`}
                  title={`Append extension: ${extension}`}
                >
                  {extension}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={handleSearch}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50'
          disabled={!canSearch}
        >
          <Search className='h-4 w-4' />
          Search
        </button>
        <button
          type='button'
          onClick={handleClear}
          className='rounded-md bg-neutral-100 px-4 py-2 font-medium text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
        >
          Clear
        </button>
      </div>
    </div>
  );
}
