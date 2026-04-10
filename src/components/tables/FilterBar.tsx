import { ReactNode, useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { PillTag } from '../ui/PillTag';
import { useDebounce } from '@/hooks/useDebounce';

function formatBadgeDisplay(badge: FilterBadge): string {
  const valueStr = Array.isArray(badge.value)
    ? badge.value.filter(Boolean).join(', ')
    : String(badge.value ?? '');
  return valueStr ? `${badge.label}: ${valueStr}` : badge.label;
}

/** Badge type drives PillTag variant: search → neutral, others → blue. */
export interface FilterBadge {
  id: string;
  type: 'search' | 'range' | 'filter';
  label: string;
  value: string | string[];
  onRemove: () => void;
}

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  /** Debounce delay for search input in ms. Default 400. */
  searchDebounceMs?: number;
  searchPlaceholder?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  showBadgesSection?: boolean;
  activeFilterBadges?: FilterBadge[];
  onClearAll?: () => void;
  searchLabel?: string;
  searchId?: string;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchDebounceMs = 400,
  searchPlaceholder = 'Search...',
  filters,
  actions,
  showBadgesSection = true,
  activeFilterBadges,
  onClearAll,
  searchLabel = 'Search',
  searchId = 'filter-bar-search',
}: FilterBarProps) {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const debouncedSearchValue = useDebounce(localSearchValue, searchDebounceMs);
  const prevDebouncedRef = useRef(debouncedSearchValue);

  // Keep local input synced when parent search changes externally (URL/nav/clear all).
  useEffect(() => {
    setLocalSearchValue(searchValue);
  }, [searchValue]);

  // Only push to parent when the debounce timer actually fired (debouncedSearchValue
  // changed). A ref guards against re-running when other deps like searchValue change
  // in the same effect cycle — which would see stale localSearchValue and re-apply
  // the old query before the sync effect's setState has flushed.
  useEffect(() => {
    if (debouncedSearchValue === prevDebouncedRef.current) return;
    prevDebouncedRef.current = debouncedSearchValue;
    if (debouncedSearchValue === searchValue) return;
    onSearchChange(debouncedSearchValue);
  }, [debouncedSearchValue, searchValue, onSearchChange]);

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else {
      setLocalSearchValue('');
      onSearchChange('');
    }
  };
  return (
    <div className='mb-4 rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='flex items-center gap-3 p-3'>
        <div className='relative flex-1'>
          <label htmlFor={searchId} className='sr-only'>
            {searchLabel}
          </label>
          <Search
            className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
          <input
            id={searchId}
            type='text'
            value={localSearchValue}
            onChange={(e) => setLocalSearchValue(e.target.value)}
            placeholder={searchPlaceholder}
            className='w-full rounded-md border border-neutral-300 bg-white py-2 pr-10 pl-10 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {localSearchValue && (
            <button
              type='button'
              onClick={() => {
                setLocalSearchValue('');
                onSearchChange('');
              }}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white'
              aria-label='Clear search'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          )}
        </div>
        {filters && <div className='flex items-center gap-2'>{filters}</div>}
        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>

      {showBadgesSection && activeFilterBadges && activeFilterBadges.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#2d3540] dark:bg-[#1e252e]/50'>
          <span className='mr-1 shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-[#9dabb9]'>
            Active:
          </span>
          {activeFilterBadges?.map((badge) => (
            <PillTag
              key={badge.id}
              variant={badge.type === 'search' ? 'neutral' : 'blue'}
              onRemove={badge.onRemove}
            >
              {formatBadgeDisplay(badge)}
            </PillTag>
          ))}
          {(activeFilterBadges?.length ?? 0) > 0 && onClearAll && (
            <button
              type='button'
              onClick={handleClearAll}
              className='ml-auto shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-[#137fec] dark:hover:text-blue-300'
            >
              Clear all
            </button>
          )}
        </div>
      )}
    </div>
  );
}
