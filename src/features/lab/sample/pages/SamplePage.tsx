import { useMemo } from 'react';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useSampleQueryParams } from '../hooks/useSampleQueryParams';
import { SamplesTable } from '../components';
import { SAMPLE_FILTER_FIELDS } from '../utils/sampleFilterFields';
import { buildSampleActiveFilterBadges } from '../utils/buildSampleFilterBadges';

export function SamplePage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useSampleQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildSampleActiveFilterBadges({
        filterFields: SAMPLE_FILTER_FIELDS,
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  return (
    <>
      <div>
        <AdvancedFilterBar
          searchValue={search}
          onSearchChange={(search) => setSearchQuery(search)}
          searchPlaceholder='Search by Sample ID, External Sample ID, Library ID...'
          filterFields={SAMPLE_FILTER_FIELDS}
          filterValues={filterValues}
          onFiltersChange={(values) => setFilterValues(values)}
          activeFilterBadges={activeFilterBadges}
          onClearAll={clearAllFilters}
          filterHelpText='* Text inputs support multiple values with comma separation (e.g., "L000001,L000002").'
          columns={4}
        />

        <SamplesTable />
      </div>
    </>
  );
}
