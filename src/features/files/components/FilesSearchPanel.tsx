import { useEffect, useRef, useState } from 'react';
import { Folder, Search, SlidersHorizontal, X, ChevronUp, Filter } from 'lucide-react';
import { WORKFLOW_PATTERNS, FILE_EXTENSIONS } from '../constants';
import type { UseFilesSearchReturn } from '../hooks/useFilesSearch';
import { PillTag } from '@/components/ui/PillTag';
import { useDebounce } from '@/hooks/useDebounce';

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
    generalSearch: committedGeneralSearch,
    portalRunId: committedPortalRunId,
    bucketName: committedBucketName,
    s3KeyPattern: committedS3KeyPattern,
    executeSearch,
    handleClear,
  } = search;

  const [isOpen, setIsOpen] = useState(false);

  // Local (uncontrolled) general search — debounced before committing to hook
  const [localGeneralSearch, setLocalGeneralSearch] = useState(committedGeneralSearch);
  const debouncedGeneralSearch = useDebounce(localGeneralSearch, 400);
  const prevDebouncedRef = useRef(debouncedGeneralSearch);

  // Draft state for the accordion — only committed on "Apply"
  const [tempValues, setTempValues] = useState({
    portalRunId: committedPortalRunId,
    bucketName: committedBucketName,
    s3KeyPattern: committedS3KeyPattern,
  });

  // Sync local input when external clear resets generalSearch
  useEffect(() => {
    setLocalGeneralSearch(committedGeneralSearch);
  }, [committedGeneralSearch]);

  // Auto-search when debounced value actually changes
  useEffect(() => {
    if (debouncedGeneralSearch === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedGeneralSearch;
    if (debouncedGeneralSearch === committedGeneralSearch) return;
    executeSearch({
      generalSearch: debouncedGeneralSearch,
      portalRunId: committedPortalRunId,
      bucketName: committedBucketName,
      s3KeyPattern: committedS3KeyPattern,
    });
  }, [
    debouncedGeneralSearch,
    committedGeneralSearch,
    committedPortalRunId,
    committedBucketName,
    committedS3KeyPattern,
    executeSearch,
  ]);

  // Sync draft from committed values when opening the accordion
  const handleToggleOpen = () => {
    if (!isOpen) {
      setTempValues({
        portalRunId: committedPortalRunId,
        bucketName: committedBucketName,
        s3KeyPattern: committedS3KeyPattern,
      });
    }
    setIsOpen(!isOpen);
  };

  const handleTempChange = (key: keyof typeof tempValues, value: string) => {
    setTempValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    executeSearch({
      generalSearch: committedGeneralSearch,
      ...tempValues,
    });
  };

  const handleReset = () => {
    const cleared = { portalRunId: '', bucketName: '', s3KeyPattern: '' };
    setTempValues(cleared);
    executeSearch({ generalSearch: committedGeneralSearch, ...cleared });
  };

  const handleClearAll = () => {
    setLocalGeneralSearch('');
    handleClear();
  };

  // ── Active filter badges ──────────────────────────────────────────────────

  const activeBadges: {
    id: string;
    type: 'search' | 'filter';
    label: string;
    value: string;
    onRemove: () => void;
  }[] = [];

  if (committedGeneralSearch) {
    activeBadges.push({
      id: 'general',
      type: 'search',
      label: 'Search',
      value: committedGeneralSearch,
      onRemove: () => {
        setLocalGeneralSearch('');
        executeSearch({
          generalSearch: '',
          portalRunId: committedPortalRunId,
          bucketName: committedBucketName,
          s3KeyPattern: committedS3KeyPattern,
        });
      },
    });
  }
  if (committedPortalRunId) {
    activeBadges.push({
      id: 'portalRunId',
      type: 'filter',
      label: 'Portal Run ID',
      value: committedPortalRunId,
      onRemove: () =>
        executeSearch({
          generalSearch: committedGeneralSearch,
          portalRunId: '',
          bucketName: committedBucketName,
          s3KeyPattern: committedS3KeyPattern,
        }),
    });
  }
  if (committedBucketName) {
    activeBadges.push({
      id: 'bucketName',
      type: 'filter',
      label: 'Bucket',
      value: committedBucketName,
      onRemove: () =>
        executeSearch({
          generalSearch: committedGeneralSearch,
          portalRunId: committedPortalRunId,
          bucketName: '',
          s3KeyPattern: committedS3KeyPattern,
        }),
    });
  }
  if (committedS3KeyPattern) {
    activeBadges.push({
      id: 's3KeyPattern',
      type: 'filter',
      label: 'S3 Key',
      value: committedS3KeyPattern,
      onRemove: () =>
        executeSearch({
          generalSearch: committedGeneralSearch,
          portalRunId: committedPortalRunId,
          bucketName: committedBucketName,
          s3KeyPattern: '',
        }),
    });
  }

  const activeCount = activeBadges.filter((b) => b.type === 'filter').length;
  const hasActiveFilters = activeCount > 0;

  const inputClass =
    'h-10 w-full rounded-md border border-neutral-300 bg-slate-50 px-3 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]';
  const labelClass =
    'mb-1.5 block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]';

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      {/* Search bar row */}
      <div className='flex items-center gap-3 px-4 py-3'>
        <div className='relative flex-1'>
          <label htmlFor='files-general-search' className='sr-only'>
            Search files
          </label>
          <Search
            className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
          <input
            id='files-general-search'
            type='text'
            placeholder='Search by portal run ID, bucket, or S3 key…'
            value={localGeneralSearch}
            onChange={(e) => setLocalGeneralSearch(e.target.value)}
            className='w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-10 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {localGeneralSearch && (
            <button
              type='button'
              onClick={() => {
                setLocalGeneralSearch('');
                executeSearch({
                  generalSearch: '',
                  portalRunId: committedPortalRunId,
                  bucketName: committedBucketName,
                  s3KeyPattern: committedS3KeyPattern,
                });
              }}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white'
              aria-label='Clear search'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          )}
        </div>

        <button
          type='button'
          onClick={handleToggleOpen}
          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            hasActiveFilters
              ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-[#137fec] dark:bg-[#137fec]/10 dark:text-[#137fec]'
              : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
          }`}
        >
          <SlidersHorizontal className='h-4 w-4' />
          More Filters
          {hasActiveFilters && (
            <span className='rounded-full bg-blue-600 px-1.5 py-0.5 text-xs text-white dark:bg-[#137fec]'>
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters Accordion */}
      {isOpen && (
        <div>
          <button
            type='button'
            onClick={() => setIsOpen(false)}
            className='flex w-full items-center gap-1.5 border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:border-[#2d3540] dark:bg-[#1e252e]/50 dark:text-[#9dabb9] dark:hover:text-white'
          >
            <ChevronUp className='h-4 w-4' />
            Advanced Filters
          </button>

          <div className='px-4 py-3'>
            {/* Field inputs */}
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              <div>
                <label htmlFor='adv-portalRunId' className={labelClass}>
                  Portal Run ID
                </label>
                <input
                  type='text'
                  id='adv-portalRunId'
                  value={tempValues.portalRunId}
                  onChange={(e) => handleTempChange('portalRunId', e.target.value)}
                  placeholder='Filter by portal run ID'
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor='adv-bucketName' className={labelClass}>
                  Bucket Name
                </label>
                <input
                  type='text'
                  id='adv-bucketName'
                  value={tempValues.bucketName}
                  onChange={(e) => handleTempChange('bucketName', e.target.value)}
                  placeholder='Filter by bucket name'
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor='adv-s3KeyPattern' className={labelClass}>
                  S3 Key Pattern
                </label>
                <input
                  type='text'
                  id='adv-s3KeyPattern'
                  value={tempValues.s3KeyPattern}
                  onChange={(e) => handleTempChange('s3KeyPattern', e.target.value)}
                  placeholder='e.g. /123456/ or *.bam (supports *)'
                  className={inputClass}
                />
              </div>
            </div>

            {/* Shortcut Filters */}
            <div className='mt-4 border-t border-dashed border-neutral-100 pt-3 dark:border-[#2d3540]'>
              <div className='mb-3 flex items-center gap-2'>
                <Folder className='h-4 w-4 text-neutral-500 dark:text-[#9dabb9]' />
                <h3 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-[#9dabb9]'>
                  Shortcut Filters
                </h3>
              </div>

              <div className='mb-3'>
                <div className='mb-2 flex items-center gap-2'>
                  <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
                    Workflow Patterns
                  </span>
                  <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                    (click to set S3 key pattern)
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {WORKFLOW_PATTERNS.map((pattern) => {
                    const isActive = tempValues.s3KeyPattern === pattern;
                    return (
                      <button
                        key={pattern}
                        type='button'
                        onClick={() => handleTempChange('s3KeyPattern', pattern)}
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
                  <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                    (click to append to pattern)
                  </span>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {FILE_EXTENSIONS.map((extension) => {
                    const isActive = tempValues.s3KeyPattern.includes(extension);
                    return (
                      <button
                        key={extension}
                        type='button'
                        onClick={() =>
                          handleTempChange(
                            's3KeyPattern',
                            appendOrSetPattern(tempValues.s3KeyPattern, extension)
                          )
                        }
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

            {/* Apply / Reset */}
            <div className='mt-4 flex items-center justify-end gap-3 border-t border-dashed border-neutral-100 pt-3 dark:border-[#2d3540]'>
              <button
                type='button'
                onClick={handleReset}
                className='px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-[#9dabb9] dark:hover:text-white'
              >
                Reset
              </button>
              <button
                type='button'
                onClick={handleApply}
                className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-700'
              >
                <Filter className='h-3.5 w-3.5' />
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeBadges.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#2d3540] dark:bg-[#1e252e]/50'>
          <span className='mr-1 shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-[#9dabb9]'>
            Active:
          </span>
          {activeBadges.map((badge) => (
            <PillTag
              key={badge.id}
              variant={badge.type === 'search' ? 'neutral' : 'blue'}
              onRemove={badge.onRemove}
            >
              {`${badge.label}: ${badge.value}`}
            </PillTag>
          ))}
          <button
            type='button'
            onClick={handleClearAll}
            className='ml-auto shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-[#137fec] dark:hover:text-blue-300'
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
