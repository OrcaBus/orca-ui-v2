import { Input } from '@/components/ui/Input';
import { useState, type Dispatch, type KeyboardEvent, type SetStateAction } from 'react';
import { Folder, Search, SlidersHorizontal, X, ChevronUp, Filter } from 'lucide-react';
import { WORKFLOW_PATTERNS, FILE_EXTENSIONS } from '@/utils/constants';
import { useFilesListQueryParams, type FilterOp } from '../hooks/useFilesListQueryParams';
import { PillTag } from '@/components/ui/PillTag';
import { Button } from '@/components/ui/Button';
import { useDebouncedSearchInput } from '@/hooks/useDebouncedSearchInput';
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

// OR / AND are mutually exclusive modes, so this is a segmented control rather than a switch.
export function FilesKeyOpToggle({
  value,
  onChange,
}: {
  value: FilterOp;
  onChange: (op: FilterOp) => void;
}) {
  const base =
    'h-7 min-w-10 justify-center rounded-none px-2 py-1 text-xs font-medium transition-colors focus-visible:z-10 focus-visible:ring-1';
  const active =
    'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-[#137fec]/15 dark:text-blue-300 dark:hover:bg-[#137fec]/25';
  const inactive =
    'bg-white text-neutral-500 hover:bg-neutral-50 dark:bg-[#1e252e] dark:text-neutral-400 dark:hover:bg-[#252d38]';
  return (
    <div
      role='group'
      aria-label='S3 key pattern matching mode'
      className='inline-flex overflow-hidden rounded-md border border-neutral-200 dark:border-[#2d3540]'
    >
      <Button
        variant='ghost'
        size='inline'
        type='button'
        aria-pressed={value === 'or'}
        className={`${base} ${value === 'or' ? active : inactive}`}
        onClick={() => onChange('or')}
      >
        OR
      </Button>
      <Button
        variant='ghost'
        size='inline'
        type='button'
        aria-pressed={value === 'and'}
        className={`${base} ${value === 'and' ? active : inactive} border-l border-neutral-200 dark:border-[#2d3540]`}
        onClick={() => onChange('and')}
      >
        AND
      </Button>
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
    <div className='space-y-3'>
      <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
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
          <Input
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
        <div className='mb-1 flex items-center justify-between gap-3'>
          <label
            htmlFor='adv-s3Key'
            className='text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'
          >
            S3 Key Pattern
          </label>
          <FilesKeyOpToggle
            value={tempValues.keyOp}
            onChange={(op) => setTempValues((prev) => ({ ...prev, keyOp: op }))}
          />
        </div>
        <div className='focus-within:border-ring focus-within:ring-ring/40 flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-sm text-neutral-900 focus-within:ring-1 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100'>
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
          <Input
            type='text'
            id='adv-s3Key'
            value={tempValues.keyDraft}
            onChange={(e) => setTempValues((prev) => ({ ...prev, keyDraft: e.target.value }))}
            onKeyDown={handleKeyDraftKeyDown}
            onBlur={commitKeyDraft}
            placeholder='Enter S3 key pattern (wildcard supported)'
            className='h-auto min-h-6 min-w-64 flex-1 rounded-none border-0 bg-transparent px-1 py-0 text-sm text-neutral-900 placeholder-neutral-400 shadow-none focus-visible:border-transparent focus-visible:ring-0 dark:bg-transparent dark:text-slate-100 dark:placeholder-[#9dabb9]'
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

  const { inputRef, handleInputChange, resetInput, clearInput } = useDebouncedSearchInput({
    value: searchValue,
    onChange: setSearch,
    delayMs: 400,
  });

  // Draft state for the accordion — only committed on "Apply"
  const [tempValues, setTempValues] = useState<AdvancedFilterDraft>(() =>
    createDraftFromFilters(filters)
  );

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
    resetInput('');
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
        clearInput();
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
    'h-9 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-0 text-sm text-neutral-900 shadow-none placeholder-neutral-400 focus:border-ring focus:ring-1 focus:ring-ring/40 focus:outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/40 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9]';
  const labelClass =
    'mb-1 block text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]';

  return (
    <div className='mb-4 rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      {/* Search bar row */}
      <div className='flex items-center gap-2 px-3 py-2.5'>
        <div className='relative flex-1'>
          <label htmlFor='files-general-search' className='sr-only'>
            Search files
          </label>
          <Search
            className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
          <Input
            ref={inputRef}
            id='files-general-search'
            type='text'
            placeholder='Search by portal run ID, bucket, or S3 key…'
            defaultValue={searchValue}
            onChange={handleInputChange}
            className='peer w-full border-slate-200 bg-slate-50 py-0 pr-9 pl-10 text-sm text-neutral-900 placeholder-neutral-400 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9]'
          />
          <Button
            variant='ghost'
            size='tableIcon'
            type='button'
            onClick={clearInput}
            className='absolute top-1/2 right-2 -translate-y-1/2 text-neutral-400 peer-placeholder-shown:hidden hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white'
            aria-label='Clear search'
          >
            <X className='h-4 w-4' aria-hidden='true' />
          </Button>
        </div>

        <Button
          variant='ghost'
          type='button'
          onClick={handleToggleOpen}
          className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
            hasActiveFilters
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
          }`}
        >
          <SlidersHorizontal className='h-4 w-4' />
          More Filters
          {hasActiveFilters && (
            <span className='bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs'>
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Advanced Filters Accordion */}
      {isOpen && (
        <div>
          <Button
            variant='ghost'
            size='inline'
            type='button'
            onClick={() => setIsOpen(false)}
            className='h-9 w-full justify-start gap-1.5 rounded-none border-t border-slate-200 bg-slate-50 px-3 py-1.5 text-left text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:border-[#2d3540] dark:bg-[#1e252e]/50 dark:text-[#9dabb9] dark:hover:text-white'
          >
            <ChevronUp className='h-4 w-4' />
            Advanced Filters
          </Button>

          <div className='px-3 py-3'>
            {/* Field inputs */}
            <FilesAdvancedFilterFields
              tempValues={tempValues}
              setTempValues={setTempValues}
              inputClass={inputClass}
              labelClass={labelClass}
            />

            {/* Shortcut Filters */}
            <div className='mt-3 border-t border-dashed border-neutral-100 pt-3 dark:border-[#2d3540]'>
              <div className='mb-2.5 flex items-center gap-2'>
                <Folder className='h-4 w-4 text-neutral-500 dark:text-[#9dabb9]' />
                <h3 className='text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:text-[#9dabb9]'>
                  Shortcut Filters
                </h3>
              </div>

              <div className='mb-2.5'>
                <div className='mb-1.5 flex items-center gap-2'>
                  <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
                    Workflow Patterns
                  </span>
                  <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                    (click to set S3 key pattern)
                  </span>
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  {WORKFLOW_PATTERNS.map((pattern) => {
                    const isActive = tempValues.keys.includes(pattern);
                    return (
                      <Button
                        variant='ghost'
                        size='inline'
                        key={pattern}
                        type='button'
                        onClick={() =>
                          setTempValues((prev) => ({
                            ...prev,
                            keys: appendKeyPattern(prev.keys, pattern),
                          }))
                        }
                        className={`h-7 rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900'
                        }`}
                        title={`Set S3 key pattern to: ${pattern}`}
                      >
                        {pattern}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className='mb-1.5 flex items-center gap-2'>
                  <span className='text-xs font-medium text-neutral-600 dark:text-neutral-400'>
                    File Extensions
                  </span>
                  <span className='text-xs text-neutral-400 dark:text-neutral-500'>
                    (click to append to pattern)
                  </span>
                </div>
                <div className='flex flex-wrap gap-1.5'>
                  {FILE_EXTENSIONS.map((extension) => {
                    const isActive = tempValues.keys.includes(extension);
                    return (
                      <Button
                        variant='ghost'
                        size='inline'
                        key={extension}
                        type='button'
                        onClick={() =>
                          setTempValues((prev) => ({
                            ...prev,
                            keys: appendKeyPattern(prev.keys, extension),
                          }))
                        }
                        className={`h-7 rounded-md px-2 py-1 font-mono text-xs transition-colors ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900'
                        }`}
                        title={`Append extension: ${extension}`}
                      >
                        {extension}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Apply / Reset */}
            <div className='mt-3 flex items-center justify-end gap-2 border-t border-dashed border-neutral-100 pt-3 dark:border-[#2d3540]'>
              <Button
                variant='ghost'
                size='sm'
                type='button'
                onClick={handleReset}
                className='text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-[#9dabb9] dark:hover:text-white'
              >
                Reset
              </Button>
              <Button size='sm' type='button' onClick={handleApply}>
                <Filter />
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Active Filter Badges */}
      {activeBadges.length > 0 && (
        <div className='flex flex-wrap items-center gap-1.5 border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]/50'>
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
          <Button
            variant='ghost'
            size='inline'
            type='button'
            onClick={handleClearAll}
            className='ml-auto shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-[#137fec] dark:hover:text-blue-300'
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
