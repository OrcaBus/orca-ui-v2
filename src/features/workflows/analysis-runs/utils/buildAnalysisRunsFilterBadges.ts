import type { FilterBadge } from '@/components/tables/FilterBar';
import type { AnalysisRunsFilterPatch } from '../hooks/useAnalysisRunsQueryParams';

const PARAM_STATUS = 'arStatus';
const PARAM_TYPE = 'arType';
const PARAM_FROM = 'arFrom';
const PARAM_TO = 'arTo';

export interface BuildAnalysisRunsFilterBadgesParams {
  search: string;
  setSearchQuery: (value: string) => void;
  filterValues: Record<string, string>;
  setFilterValues: (patch: AnalysisRunsFilterPatch) => void;
}

function splitTypes(arType: string): string[] {
  return arType
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Build active filter badges for FilterBar from analysis runs search + filter state.
 */
export function buildAnalysisRunsFilterBadges({
  search,
  setSearchQuery,
  filterValues,
  setFilterValues,
}: BuildAnalysisRunsFilterBadgesParams): FilterBadge[] {
  const badges: FilterBadge[] = [];

  if (search && search !== '') {
    badges.push({
      id: 'search',
      type: 'search',
      label: 'Search',
      value: search,
      onRemove: () => setSearchQuery(''),
    });
  }

  const status = filterValues[PARAM_STATUS] ?? '';
  if (status && status !== 'all') {
    badges.push({
      id: 'status',
      type: 'filter',
      label: 'Status',
      value: status.charAt(0).toUpperCase() + status.slice(1),
      onRemove: () => setFilterValues({ arStatus: '' }),
    });
  }

  splitTypes(filterValues[PARAM_TYPE] ?? '').forEach((t) => {
    badges.push({
      id: `${PARAM_TYPE}-${t}`,
      type: 'filter',
      label: 'Type',
      value: t,
      onRemove: () => {
        const rest = splitTypes(filterValues[PARAM_TYPE] ?? '').filter((x) => x !== t);
        setFilterValues({ arType: rest });
      },
    });
  });

  if (filterValues[PARAM_FROM]) {
    badges.push({
      id: PARAM_FROM,
      type: 'range',
      label: 'From',
      value: filterValues[PARAM_FROM],
      onRemove: () => setFilterValues({ arFrom: '' }),
    });
  }

  if (filterValues[PARAM_TO]) {
    badges.push({
      id: PARAM_TO,
      type: 'range',
      label: 'To',
      value: filterValues[PARAM_TO],
      onRemove: () => setFilterValues({ arTo: '' }),
    });
  }

  return badges;
}
