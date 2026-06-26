import { useMemo } from 'react';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useProjectQueryParams } from '../hooks/useProjectQueryParams';
import { ProjectsTable } from '../components';
import { PROJECT_FILTER_FIELDS } from '../utils/projectFilterFields';
import { buildProjectActiveFilterBadges } from '../utils/buildProjectFilterBadges';

export function ProjectPage() {
  const { search, setSearchQuery, filterValues, setFilterValues, clearAllFilters } =
    useProjectQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildProjectActiveFilterBadges({
        filterFields: PROJECT_FILTER_FIELDS,
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
          searchPlaceholder='Search by Project ID, Name, Contact ID...'
          filterFields={PROJECT_FILTER_FIELDS}
          filterValues={filterValues}
          onFiltersChange={(values) => setFilterValues(values)}
          activeFilterBadges={activeFilterBadges}
          onClearAll={clearAllFilters}
          filterHelpText='* Text inputs support multiple values with comma separation (e.g., "L000001,L000002").'
          columns={3}
        />

        <ProjectsTable />
      </div>
    </>
  );
}
