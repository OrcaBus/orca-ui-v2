import { useMemo } from 'react';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useLibraryQueryParams } from '../hooks/useLibraryQueryParams';
import { LibrariesTable } from '../components';
import { LIBRARY_FILTER_FIELDS } from '../utils/libraryFilterFields';
import { buildLibraryActiveFilterBadges } from '../utils/buildLibraryFilterBadges';

export function LibraryPage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useLibraryQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildLibraryActiveFilterBadges({
        filterFields: LIBRARY_FILTER_FIELDS,
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
          searchPlaceholder='Search by Library ID, project...'
          filterFields={LIBRARY_FILTER_FIELDS}
          filterValues={filterValues}
          onFiltersChange={(values) => setFilterValues(values)}
          activeFilterBadges={activeFilterBadges}
          onClearAll={clearAllFilters}
        />

        <LibrariesTable />
      </div>
    </>
  );
}
