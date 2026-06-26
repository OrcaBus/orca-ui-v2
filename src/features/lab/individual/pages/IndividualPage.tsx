import { useMemo } from 'react';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { IndividualsTable } from '../components';
import { useIndividualQueryParams } from '../hooks/useIndividualQueryParams';
import { buildIndividualActiveFilterBadges } from '../utils/buildIndividualFilterBadges';
import { INDIVIDUAL_FILTER_FIELDS } from '../utils/individualFilterFields';

export function IndividualPage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useIndividualQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildIndividualActiveFilterBadges({
        filterFields: INDIVIDUAL_FILTER_FIELDS,
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  return (
    <div>
      <AdvancedFilterBar
        searchValue={search}
        onSearchChange={(search) => setSearchQuery(search)}
        searchPlaceholder='Search by Individual ID...'
        filterFields={INDIVIDUAL_FILTER_FIELDS}
        filterValues={filterValues}
        onFiltersChange={(values) => setFilterValues(values)}
        activeFilterBadges={activeFilterBadges}
        onClearAll={clearAllFilters}
        filterHelpText='* Text inputs support multiple values with comma separation (e.g., "L000001,L000002").'
        columns={2}
      />

      <IndividualsTable />
    </div>
  );
}
