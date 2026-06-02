import { useMemo } from 'react';
import { LibraryBig } from 'lucide-react';
import { useAppShellHeader } from '@/context/app-shell-context';
import { AdvancedFilterBar } from '@/components/tables/AdvancedFilterBar';
import { useLabPageQueryParams } from '../hooks/useLabPageQueryParams';
import { LabInfoDrawer, LibrariesTable } from '../components';
import { LAB_FILTER_FIELDS } from '../utils/labFilterFields';
import { buildLabActiveFilterBadges } from '../utils/buildLabFilterBadges';

export function LabPage() {
  const {
    search,
    setSearchQuery,
    filterValues,
    setFilterValues,
    clearAllFilters,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useLabPageQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildLabActiveFilterBadges({
        filterFields: LAB_FILTER_FIELDS,
        search,
        setSearchQuery,
        filterValues,
        setFilterValues,
      }),
    [search, filterValues, setSearchQuery, setFilterValues]
  );

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Lab Metadata',
      icon: <LibraryBig className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='p-6'>
        <AdvancedFilterBar
          searchValue={search}
          onSearchChange={(search) => setSearchQuery(search)}
          searchPlaceholder='Search by Library ID, project...'
          filterFields={LAB_FILTER_FIELDS}
          filterValues={filterValues}
          onFiltersChange={(values) => setFilterValues(values)}
          activeFilterBadges={activeFilterBadges}
          onClearAll={clearAllFilters}
        />

        <LibrariesTable />
      </div>

      <LabInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
