import type { FilterBadge } from '@/components/tables/AdvancedFilterBar';
import type { FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

function isRangeField(
  field: FilterFieldConfig
): field is Extract<FilterFieldConfig, { type: 'range' }> {
  return field.type === 'range';
}

export interface BuildProjectFilterBadgesParams {
  filterFields: FilterFieldConfig[];
  search: string;
  setSearchQuery: (value: string) => void;
  filterValues: Record<string, string>;
  setFilterValues: (values: Record<string, string>) => void;
}

/**
 * Build active filter badges for AdvancedFilterBar from project search + filter state.
 */
export function buildProjectActiveFilterBadges({
  filterFields,
  search,
  setSearchQuery,
  filterValues,
  setFilterValues,
}: BuildProjectFilterBadgesParams): FilterBadge[] {
  const badges: FilterBadge[] = [];

  if (search) {
    badges.push({
      id: 'search',
      type: 'search',
      label: 'Search',
      value: search,
      onRemove: () => setSearchQuery(''),
    });
  }

  for (const field of filterFields) {
    if (isRangeField(field)) {
      const min = filterValues[field.minKey] ?? '';
      const max = filterValues[field.maxKey] ?? '';
      if (!min && !max) continue;

      const displayLabel = field.formatBadge
        ? field.formatBadge(min, max)
        : `${field.label}: ${min || '0'} - ${max || 'infinity'}`;

      badges.push({
        id: `range-${field.minKey}-${field.maxKey}`,
        type: 'range',
        label: displayLabel,
        value: '',
        onRemove: () => {
          setFilterValues({
            ...filterValues,
            [field.minKey]: '',
            [field.maxKey]: '',
          });
        },
      });
    } else {
      const value = filterValues[field.key] ?? '';
      if (!value) continue;

      badges.push({
        id: `filter-${field.key}`,
        type: 'filter',
        label: field.label,
        value,
        onRemove: () => {
          setFilterValues({
            ...filterValues,
            [field.key]: '',
          });
        },
      });
    }
  }

  return badges;
}
