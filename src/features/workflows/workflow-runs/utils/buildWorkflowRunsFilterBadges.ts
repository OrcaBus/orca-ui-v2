import type { FilterBadge } from '@/components/tables/FilterBar';
import type { WorkflowRunsFilterPatch } from '../hooks/useWorkflowRunsQueryParams';

const PARAM_STATUS = 'wfStatus';
const PARAM_TYPE = 'wfType';
const PARAM_FROM = 'wfFrom';
const PARAM_TO = 'wfTo';

export interface BuildWorkflowRunsFilterBadgesParams {
  search: string;
  setSearchQuery: (value: string) => void;
  filterValues: Record<string, string>;
  setFilterValues: (patch: WorkflowRunsFilterPatch) => void;
}

function splitTypes(wfType: string): string[] {
  return wfType
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
}

/**
 * Build active filter badges for FilterBar from workflow runs search + filter state.
 */
export function buildWorkflowRunsFilterBadges({
  search,
  setSearchQuery,
  filterValues,
  setFilterValues,
}: BuildWorkflowRunsFilterBadgesParams): FilterBadge[] {
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
      onRemove: () => setFilterValues({ wfStatus: '' }),
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
        setFilterValues({ wfType: rest });
      },
    });
  });

  if (filterValues[PARAM_FROM]) {
    badges.push({
      id: PARAM_FROM,
      type: 'range',
      label: 'From',
      value: filterValues[PARAM_FROM],
      onRemove: () => setFilterValues({ wfFrom: '' }),
    });
  }

  if (filterValues[PARAM_TO]) {
    badges.push({
      id: PARAM_TO,
      type: 'range',
      label: 'To',
      value: filterValues[PARAM_TO],
      onRemove: () => setFilterValues({ wfTo: '' }),
    });
  }

  return badges;
}
