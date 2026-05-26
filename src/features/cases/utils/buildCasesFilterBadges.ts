import type { FilterBadge } from '@/components/tables/FilterBar';
import type { CaseTypeEnum } from '../api/cases.api';

const CASE_TYPE_LABELS: Record<CaseTypeEnum, string> = {
  wgts: 'WGTS',
  cttso: 'ctTSO',
  wgs_n: 'WGS-N',
};

export interface BuildCasesFilterBadgesParams {
  search: string;
  setSearchQuery: (value: string) => void;
  caseTypeFilter: string;
  setCaseTypeFilter: (value: string) => void;
}

/**
 * Build active filter badges for FilterBar from cases search + filter state.
 * Badge type drives PillTag variant: search → neutral, filter → blue.
 */
export function buildCasesActiveFilterBadges({
  search,
  setSearchQuery,
  caseTypeFilter,
  setCaseTypeFilter,
}: BuildCasesFilterBadgesParams): FilterBadge[] {
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

  if (caseTypeFilter && caseTypeFilter !== 'all') {
    const typeLabels = caseTypeFilter
      .split(',')
      .map((t) => t.trim())
      .map((t) => CASE_TYPE_LABELS[t as CaseTypeEnum] ?? t);

    badges.push({
      id: 'caseType',
      type: 'filter',
      label: 'Type',
      value: typeLabels.join(', '),
      onRemove: () => setCaseTypeFilter('all'),
    });
  }

  return badges;
}
