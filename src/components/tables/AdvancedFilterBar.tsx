import { useState, ReactNode } from 'react';
import { Search, X, SlidersHorizontal, ChevronUp, Filter } from 'lucide-react';
import { PillTag } from '../ui/PillTag';
import { MultiSelect } from '../ui/MultiSelect';

interface TextFilterField {
  type?: 'text' | 'number';
  key: string;
  label: string;
  placeholder?: string;
}

interface RangeFilterField {
  type: 'range';
  label: string;
  minKey: string;
  maxKey: string;
  minPlaceholder?: string;
  maxPlaceholder?: string;
  /** Optional formatter for the active filter badge (e.g. "Coverage: 30x – 100x"). */
  formatBadge?: (min: string, max: string) => string;
}

interface SelectFilterField {
  type: 'select';
  label: string;
  key: string;
  options: { label: string; value: string }[];
}

interface MultiSelectFilterField {
  type: 'multi-select';
  label: string;
  key: string;
  options: { label: string; value: string }[];
}

interface DateFilterField {
  type: 'date';
  label: string;
  key: string;
  placeholder?: string;
}

/** Badge type drives PillTag variant: search → neutral, others → blue. */
export interface FilterBadge {
  id: string;
  type: 'search' | 'range' | 'filter';
  label: string;
  value: string | string[];
  onRemove: () => void;
}

function formatBadgeDisplay(badge: FilterBadge): string {
  const valueStr = Array.isArray(badge.value)
    ? badge.value.filter(Boolean).join(', ')
    : String(badge.value ?? '');
  return valueStr ? `${badge.label}: ${valueStr}` : badge.label;
}

export type FilterFieldConfig =
  | TextFilterField
  | RangeFilterField
  | SelectFilterField
  | MultiSelectFilterField
  | DateFilterField;

/**
 * Controlled filter bar: parent owns source of truth (e.g. URL params).
 * Pass current search + filter values and change handlers; filter edits are drafted in the panel and committed on Apply.
 */
interface AdvancedFilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterFields: FilterFieldConfig[];
  /** Committed filter values (from parent state / URL). Used as initial draft when panel opens. */
  filterValues: Record<string, string>;
  onFiltersChange: (values: Record<string, string | string[]>) => void;
  activeFilterBadges: FilterBadge[];
  onClearAll?: () => void;
  actions?: ReactNode;
  columns?: number;
}

function isRangeField(field: FilterFieldConfig): field is RangeFilterField {
  return field.type === 'range';
}

function getFieldKeys(field: FilterFieldConfig): string[] {
  if (isRangeField(field)) return [field.minKey, field.maxKey];
  return [field.key];
}

function getAllKeys(fields: FilterFieldConfig[]): string[] {
  return fields.flatMap(getFieldKeys);
}

export function AdvancedFilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterFields,
  filterValues,
  onFiltersChange,
  activeFilterBadges,
  onClearAll,
  actions,
  columns = 6,
}: AdvancedFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Draft state for the expandable panel: edits apply only on "Apply", so we don't commit every keystroke to parent/URL.
  const [tempValues, setTempValues] = useState<Record<string, string>>(() => ({ ...filterValues }));

  // Sync draft from committed values when opening the panel.
  const handleToggleOpen = () => {
    if (!isOpen) setTempValues({ ...filterValues });
    setIsOpen(!isOpen);
  };

  const activeCount = activeFilterBadges.length;
  const hasActiveFilters = activeCount > 0;

  const handleTempChange = (key: string, value: string) => {
    setTempValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    onFiltersChange(tempValues);
  };

  const handleReset = () => {
    const cleared: Record<string, string> = {};
    getAllKeys(filterFields).forEach((key) => (cleared[key] = ''));
    setTempValues(cleared);
    onFiltersChange(cleared);
  };

  const handleClearAll = () => {
    handleReset();
    onSearchChange('');
    onClearAll?.();
  };

  const gridClass = `grid gap-4 grid-cols-${columns}`;
  const filterControlClass =
    'h-10 w-full rounded-md border border-neutral-300 bg-slate-50 px-3 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]';

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      {/* Search + More Filters */}
      <div className='flex items-center gap-3 px-4 py-3'>
        <div className='relative flex-1'>
          <label htmlFor='advanced-filter-search' className='sr-only'>
            Search
          </label>
          <Search
            className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
          <input
            id='advanced-filter-search'
            type='text'
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className='w-full rounded-md border border-slate-200 bg-slate-50 py-2 pr-10 pl-10 text-sm text-neutral-900 placeholder-neutral-400 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:placeholder-[#9dabb9] dark:focus:ring-[#137fec]'
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className='absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:text-white'
              aria-label='Clear search'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          )}
        </div>

        <button
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

        {actions && <div className='flex items-center gap-2'>{actions}</div>}
      </div>

      {/* Advanced Filters Accordion */}
      {isOpen && (
        <div>
          <button
            onClick={() => setIsOpen(false)}
            className='flex w-full items-center gap-1.5 border-t border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:border-[#2d3540] dark:bg-[#1e252e]/50 dark:text-[#9dabb9] dark:hover:text-white'
          >
            <ChevronUp className='h-4 w-4' />
            Advanced Filters
          </button>

          <div className='px-4 py-3'>
            <div
              className={gridClass}
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {filterFields.map((field) => {
                if (isRangeField(field)) {
                  return (
                    <div key={`${field.minKey}-${field.maxKey}`}>
                      <label className='mb-1.5 block text-xs! font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
                        {field.label}
                      </label>
                      <div className='flex items-center gap-1.5'>
                        <input
                          type='number'
                          value={tempValues[field.minKey] ?? ''}
                          onChange={(e) => handleTempChange(field.minKey, e.target.value)}
                          placeholder={field.minPlaceholder ?? 'Min'}
                          className={filterControlClass}
                        />
                        <span className='text-sm text-neutral-400 dark:text-[#9dabb9]/60'>–</span>
                        <input
                          type='number'
                          value={tempValues[field.maxKey] ?? ''}
                          onChange={(e) => handleTempChange(field.maxKey, e.target.value)}
                          placeholder={field.maxPlaceholder ?? 'Max'}
                          className={filterControlClass}
                        />
                      </div>
                    </div>
                  );
                }

                if (field.type === 'multi-select') {
                  const values = (tempValues[field.key] ?? '')
                    .split(',')
                    .map((v) => v.trim())
                    .filter(Boolean);

                  return (
                    <div key={field.key}>
                      <label className='mb-1.5 block text-xs! font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
                        {field.label}
                      </label>
                      <MultiSelect
                        values={values}
                        options={field.options}
                        onChange={(next) => handleTempChange(field.key, next.join(','))}
                        placeholder='All'
                        triggerClassName='h-10 rounded-md border-neutral-300 bg-slate-50 px-3 py-0 text-neutral-900 shadow-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100'
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.key}>
                      <label className='mb-1.5 block text-xs! font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
                        {field.label}
                      </label>
                      <select
                        value={tempValues[field.key] ?? ''}
                        onChange={(e) => handleTempChange(field.key, e.target.value)}
                        className={filterControlClass}
                      >
                        <option value=''>All</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.key}>
                    <label className='mb-1.5 block text-xs! font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
                      {field.label}
                    </label>
                    <input
                      type={field.type ?? 'text'}
                      value={tempValues[field.key] ?? ''}
                      onChange={(e) => handleTempChange(field.key, e.target.value)}
                      placeholder={'placeholder' in field ? (field.placeholder ?? 'All') : 'All'}
                      className={filterControlClass}
                    />
                  </div>
                );
              })}
            </div>

            <div className='mt-4 flex items-center justify-end gap-3 border-t border-dashed border-neutral-100 pt-3 dark:border-[#2d3540]'>
              <button
                onClick={handleReset}
                className='px-4 py-2 text-sm text-neutral-600 transition-colors hover:text-neutral-900 dark:text-[#9dabb9] dark:hover:text-white'
              >
                Reset
              </button>
              <button
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

      {/* Active Filter Badges — rendered from props by badge type */}
      {activeFilterBadges.length > 0 && (
        <div className='flex flex-wrap items-center gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 dark:border-[#2d3540] dark:bg-[#1e252e]/50'>
          <span className='mr-1 shrink-0 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-[#9dabb9]'>
            Active:
          </span>

          {activeFilterBadges.map((badge) => (
            <PillTag
              key={badge.id}
              variant={badge.type === 'search' ? 'neutral' : 'blue'}
              onRemove={badge.onRemove}
            >
              {formatBadgeDisplay(badge)}
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
