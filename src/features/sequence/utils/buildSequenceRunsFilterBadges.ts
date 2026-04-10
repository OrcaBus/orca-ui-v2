import type { FilterBadge } from '@/components/tables/FilterBar';
import type { SequenceStatus } from '../hooks/useSequenceQueryParams';

const STATUS_LABELS: Record<SequenceStatus, string> = {
  STARTED: 'Started',
  FAILED: 'Failed',
  SUCCEEDED: 'Succeeded',
  ABORTED: 'Aborted',
  RESOLVED: 'Resolved',
  DEPRECATED: 'Deprecated',
};

export interface BuildSequenceRunsFilterBadgesParams {
  search: string;
  setSearchQuery: (value: string) => void;
  statusFilter: SequenceStatus | 'all';
  setStatusFilter: (status: SequenceStatus | 'all') => void;
  startTimeFrom: string;
  setStartTimeFrom: (value: string) => void;
  startTimeTo: string;
  setStartTimeTo: (value: string) => void;
}

/**
 * Build active filter badges for Sequence runs search + filter state.
 */
export function buildSequenceRunsFilterBadges({
  search,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  startTimeFrom,
  setStartTimeFrom,
  startTimeTo,
  setStartTimeTo,
}: BuildSequenceRunsFilterBadgesParams): FilterBadge[] {
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

  if (statusFilter !== 'all') {
    badges.push({
      id: 'status',
      type: 'filter',
      label: 'Status',
      value: STATUS_LABELS[statusFilter],
      onRemove: () => setStatusFilter('all'),
    });
  }

  if (startTimeFrom) {
    badges.push({
      id: 'startTimeFrom',
      type: 'range',
      label: 'From',
      value: startTimeFrom,
      onRemove: () => setStartTimeFrom(''),
    });
  }

  if (startTimeTo) {
    badges.push({
      id: 'startTimeTo',
      type: 'range',
      label: 'To',
      value: startTimeTo,
      onRemove: () => setStartTimeTo(''),
    });
  }

  return badges;
}
