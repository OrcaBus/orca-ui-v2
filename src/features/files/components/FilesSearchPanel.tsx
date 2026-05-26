import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
} from 'react';
import { Folder, Search, SlidersHorizontal, X, ChevronUp, Filter } from 'lucide-react';
import { WORKFLOW_PATTERNS, FILE_EXTENSIONS } from '@/utils/constants';
import { useFilesListQueryParams, type FilterOp } from '../hooks/useFilesListQueryParams';
import { PillTag } from '@/components/ui/PillTag';
import { useDebounce } from '@/hooks/useDebounce';
import { FilesBucketSelect } from './FilesBucketSelect';
import { appendKeyPattern, removeKeyPattern } from '../utils/keyPatterns';

interface AdvancedFilterDraft {
  portalRunId: string;
  buckets: string[];
  keys: string[];
  keyDraft: string;
  keyOp: FilterOp;
}

function createDraftFromFilters(filters: {
  portalRunIds: string[];
  buckets: string[];
  keys: string[];
  keyOp: FilterOp;
}): AdvancedFilterDraft {
  return {
    portalRunId: filters.portalRunIds[0] ?? '',
    buckets: filters.buckets,
    keys: filters.keys,
    keyDraft: '',
    keyOp: filters.keyOp,
  };
}

function createClearedDraft(): AdvancedFilterDraft {
  return {
    portalRunId: '',
    buckets: [],
    keys: [],
    keyDraft: '',
    keyOp: 'and',
  };
}

// Compact AND / OR toggle used next to multi-value filter fields
function OpToggle({ value, onChange }: { value: FilterOp; onChange: (op: FilterOp) => void }) {
  const base =
    'px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500';
  const active = 'bg-blue-600 text-white dark:bg-[#137fec]';
  const inactive =
    'bg-white text-neutral-500 hover:bg-neutral-50 dark:bg-[#1e252e] dark:text-neutral-400 dark:hover:bg-[#252d38]';
  return (
    <div className='inline-flex overflow-hidden rounded border border-neutral-200 dark:border-[#2d3540]'>
      <button
        type='button'
        className={`${base} ${value === 'or' ? active : inactive}`}
        onClick={() => onChange('or')}
      >
        OR
      </button>
      <button
        type='button'
        className={`${base} ${value === 'and' ? active : inactive} border-l border-neutral-200 dark:border-[#2d3540]`}
        onClick={() => onChange('and')}
      >
        AND
      </button>
    </div>
  );
}

interface FilesAdvancedFilterFieldsProps {
  tempValues: AdvancedFilterDraft;
  setTempValues: Dispatch<SetStateAction<AdvancedFilterDraft>>;
  inputClass: string;
  labelClass: string;
}

export function FilesAdvancedFilterFields({
  tempValues,
  setTempValues,
  inputClass,
  labelClass,
}: FilesAdvancedFilterFieldsProps) {
  const commitKeyDraft = () => {
    setTempValues((prev) => ({
      ...prev,
      keys: appendKeyPattern(prev.keys, prev.keyDraft),
      keyDraft: '',
    }));
  };

  const handleKeyDraftKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      commitKeyDraft();
      return;
    }

    if (e.key === 'Backspace' && tempValues.keyDraft === '' && tempValues.keys.length > 0) {
      setTempValues((prev) => ({
        ...prev,
        keys: removeKeyPattern(prev.keys, prev.keys.length - 1),
      }));
    }
  };

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Bucket */}
        <div>
          <label className={labelClass} htmlFor='adv-bucket'>
            Bucket Name
          </label>
          <FilesBucketSelect
            values={tempValues.buckets}
            onChange={(buckets) => setTempValues((prev) => ({ ...prev, buckets }))}
            triggerClassName={inputClass}
          />
        </div>

        {/* Portal Run ID */}
        <div>
          <label htmlFor='adv-portalRunId' className={labelClass}>
            Portal Run ID
          </label>
          <input
            type='text'
            id='adv-portalRunId'
            value={tempValues.portalRunId}
            onChange={(e) => setTempValues((prev) => ({ ...prev, portalRunId: e.target.value }))}
            placeholder='Filter by portal run ID'
            className={inputClass}
          />
        </div>
      </div>

      {/* S3 Key Pattern */}
      <div>
        <div className='mb-1.5 flex items-center justify-between'>
          <label
            htmlFor='adv-s3Key'
            className='text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'
          >
            S3 Key Pattern
          </label>
          <OpToggle
            value={tempValues.keyOp}
            onChange={(op) => setTempValues((prev) => ({ ...prev, keyOp: op }))}
          />
        </div>
        <div className='flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-neutral-900 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus-within:ring-[#137fec]'>
          {tempValues.keys.map((key, index) => (
            <PillTag
              key={`${key}-${index}`}
              variant='blue'
              onRemove={() =>
                setTempValues((prev) => ({
                  ...prev,
                  keys: removeKeyPattern(prev.keys, index),
                }))
              }
            >
              {key}
            </PillTag>
          ))}
          <input
            type='text'
            id='adv-s3Key'
            value={tempValues.keyDraft}
            onChange={(e) => setTempValues((prev) => ({ ...prev, keyDraft: e.target.value }))}
            onKeyDown={handleKeyDraftKeyDown}
            onBlur={commitKeyDraft}
            placeholder='Enter S3 key pattern (wildcard supported)'
            className='min-w-64 flex-1 bg-transparent px-1 py-0.5 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:text-slate-100 dark:placeholder-[#9dabb9]'
          />
        </div>
      </div>
    </div>
  );
}

export function FilesSearchPanel() {
  const {
    search: searchValue,
    filters,
    setSearch,
    setFilters,
    clearAll,
  } = useFilesListQueryParams();

  const [isOpen, setIsOpen] = useState(false);

  // Local (uncontrolled) general search — debounced before committing to URL
  const [localSearch, setLocalSearch] = useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 400);
  const prevDebouncedRef = useRef(debouncedSearch);

  // Draft state for the accordion — only committed on "Apply"
  const [tempValues, setTempValues] = useState<AdvancedFilterDraft>(() =>
    createDraftFromFilters(filters)
  );

  // Sync local search input when external clear resets it
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Auto-search when debounced value changes
  useEffect(() => {
    if (debouncedSearch === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedSearch;
    if (debouncedSearch === searchValue) return;
    setSearch(debouncedSearch);
  }, [debouncedSearch, searchValue, setSearch]);

  // Sync draft from committed filters when opening the accordion
  const handleToggleOpen = () => {
    if (!isOpen) {
      setTempValues(createDraftFromFilters(filters));
    }
    setIsOpen(!isOpen);
  };

  const handleApply = () => {
    const keys = appendKeyPattern(tempValues.keys, tempValues.keyDraft);
    setTempValues((prev) => ({ ...prev, keys, keyDraft: '' }));
    setFilters({
      portalRunIds: tempValues.portalRunId.trim() ? [tempValues.portalRunId.trim()] : [],
      keys,
      keyOp: tempValues.keyOp,
      buckets: tempValues.buckets,
    });
  };

  const handleReset = () => {
    const cleared = createClearedDraft();
    setTempValues(cleared);
    setFilters({ portalRunIds: [], keys: [], keyOp: 'and', buckets: [] });
  };

  const handleClearAll = () => {
    setLocalSearch('');
    setTempValues(createClearedDraft());
    clearAll();
  };

  // ── Active filter badges ──────────────────────────────────────────────────

  const activeBadges: {
    id: string;
    type: 'search' | 'filter';
    label: string;
    value: string;
    onRemove: () => void;
  }[] = [];

  if (searchValue.trim()) {
    activeBadges.push({
      id: 'search',
      type: 'search',
      label: 'Search',
      value: searchValue,
      onRemove: () => {
        setLocalSearch('');
        setSearch('');
      },
    });
  }

  filters.portalRunIds.forEach((id, i) => {
    activeBadges.push({
      id: `portalRunId-${i}`,
      type: 'filter',
      label: 'Portal Run ID',
      value: id,
      onRemove: () => {
        const portalRunIds = filters.portalRunIds.filter((_, j) => j !== i);
        setTempValues((prev) => ({ ...prev, portalRunId: portalRunIds[0] ?? '' }));
        setFilters({ portalRunIds });
      },
    });
  });

  filters.buckets.forEach((bucket, i) => {
    activeBadges.push({
      id: `bucket-${i}`,
      type: 'filter',
      label: 'Bucket',
      value: bucket,
      onRemove: () => {
        const buckets = filters.buckets.filter((_, j) => j !== i);
        setTempValues((prev) => ({
          ...prev,
          buckets: prev.buckets.filter((value) => value !== bucket),
        }));
        setFilters({ buckets });
      },
    });
  });

  filters.keys.forEach((key, i) => {
    activeBadges.push({
      id: `key-${i}`,
      type: 'filter',
      label: 'S3 Key',
      value: key,
      onRemove: () => {
        const keys = filters.keys.filter((_, j) => j !== i);
        setTempValues((prev) => ({
          ...prev,
          keys: prev.keys.filter((value) => value !== key),
        }));
        setFilters({ keys });
      },
    });
  });

  const activeCount = activeBadges.filter((b) => b.type === 'filter').length;
  const hasActiveFilters = activeCount > 0;

  const inputClass =
    'h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-0 text-sm text-neutral-900 shadow-none placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]';
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
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className='w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-10 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {localSearch && (
            <button
              type='button'
              onClick={() => {
                setLocalSearch('');
                setSearch('');
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
            <FilesAdvancedFilterFields
              tempValues={tempValues}
              setTempValues={setTempValues}
              inputClass={inputClass}
              labelClass={labelClass}
            />

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
                    const isActive = tempValues.keys.includes(pattern);
                    return (
                      <button
                        key={pattern}
                        type='button'
                        onClick={() =>
                          setTempValues((prev) => ({
                            ...prev,
                            keys: appendKeyPattern(prev.keys, pattern),
                          }))
                        }
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
                    const isActive = tempValues.keys.includes(extension);
                    return (
                      <button
                        key={extension}
                        type='button'
                        onClick={() =>
                          setTempValues((prev) => ({
                            ...prev,
                            keys: appendKeyPattern(prev.keys, extension),
                          }))
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
