import { useMemo } from 'react';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useSubjectQueryParams } from '../hooks/useSubjectQueryParams';
import { SubjectsTable } from '../components';
import { SUBJECT_FILTER_FIELDS } from '../utils/subjectFilterFields';
import { buildSubjectActiveFilterBadges } from '../utils/buildSubjectFilterBadges';

export function SubjectPage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useSubjectQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildSubjectActiveFilterBadges({
        filterFields: SUBJECT_FILTER_FIELDS,
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
          searchPlaceholder='Search by Subject ID, Individual ID, Library ID...'
          filterFields={SUBJECT_FILTER_FIELDS}
          filterValues={filterValues}
          onFiltersChange={(values) => setFilterValues(values)}
          activeFilterBadges={activeFilterBadges}
          onClearAll={clearAllFilters}
          filterHelpText='* Text inputs support multiple values with comma separation (e.g., "L000001,L000002").'
          columns={4}
        />

        <SubjectsTable />
      </div>
    </>
  );
}
