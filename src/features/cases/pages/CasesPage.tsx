import { useMemo } from 'react';
import { Briefcase } from 'lucide-react';
import { FilterBar } from '@/components/tables/FilterBar';
import { Select } from '@/components/ui/Select';
import { useAppShellHeader } from '@/context/app-shell-context';
import { useCasesPageQueryParams } from '../hooks/useCasesPageQueryParams';
import { buildCasesActiveFilterBadges } from '../utils/buildCasesFilterBadges';
import { CasesListTable, CasesInfoDrawer } from '../components';

const CASE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Types' },
  { value: 'wgts', label: 'WGTS' },
  { value: 'cttso', label: 'ctTSO' },
  { value: 'wgs_n', label: 'WGS-N' },
];

export function CasesPage() {
  const {
    search: searchQuery,
    setSearchQuery,
    caseTypeFilter,
    setCaseTypeFilter,
    clearAllFilters,
    isInfoDrawerOpen,
    openInfoDrawer,
    closeInfoDrawer,
  } = useCasesPageQueryParams();

  const activeFilterBadges = useMemo(
    () =>
      buildCasesActiveFilterBadges({
        search: searchQuery,
        setSearchQuery,
        caseTypeFilter,
        setCaseTypeFilter,
      }),
    [searchQuery, caseTypeFilter, setSearchQuery, setCaseTypeFilter]
  );

  const headerConfig = useMemo(
    () => ({
      mode: 'main' as const,
      title: 'Cases',
      icon: <Briefcase className='h-6 w-6' />,
      info: {
        onOpen: openInfoDrawer,
      },
    }),
    [openInfoDrawer]
  );

  useAppShellHeader(headerConfig);

  return (
    <>
      <div className='px-6'>
        <FilterBar
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder='Search request ID, alias, study, study ID, or UR number...'
          searchLabel='Search cases'
          searchId='cases-filter-search'
          filters={
            <>
              <Select
                value={caseTypeFilter}
                onChange={setCaseTypeFilter}
                options={CASE_TYPE_OPTIONS}
              />
            </>
          }
          activeFilterBadges={activeFilterBadges}
          onClearAll={activeFilterBadges?.length > 0 ? clearAllFilters : undefined}
        />

        <CasesListTable />
      </div>

      <CasesInfoDrawer isOpen={isInfoDrawerOpen} onClose={closeInfoDrawer} />
    </>
  );
}
