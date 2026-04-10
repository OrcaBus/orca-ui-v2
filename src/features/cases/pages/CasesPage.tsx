import { useMemo, useState } from 'react';
import { Briefcase, Plus, Sparkles } from 'lucide-react';
import { FilterBar, type FilterBadge } from '../../../components/tables/FilterBar';
import { Select } from '../../../components/ui/Select';
import { PageHeader } from '../../../components/layout/PageHeader';
import { toast } from 'sonner';
import { getCases, getLibraries } from '../api/cases.api';
import { useCasesQueryParams } from '../hooks/useCasesQueryParams';
import {
  CasesTable,
  CaseSummaryDrawer,
  DeleteCaseConfirmDialog,
  AddCaseModal,
  AutoGenerateCasesModal,
} from '../components';
import type { AddCaseFormValues } from '../components/AddCaseModal';
import type { Case } from '../types/case.types';

const CASE_TYPE_LABELS: Record<string, string> = {
  clinical: 'Clinical',
  research: 'Research',
  validation: 'Validation',
  qc: 'QC',
};

export function CasesPage() {
  const cases = getCases();
  const libraries = getLibraries();

  const {
    searchQuery,
    setSearchQuery,
    caseTypeFilter,
    setCaseTypeFilter,
    dateFromFilter,
    setDateFromFilter,
    dateToFilter,
    setDateToFilter,
    clearAllFilters,
    filteredCases,
    selectedCase,
    setSelectedCase,
  } = useCasesQueryParams({
    cases,
    libraries: libraries.map((l) => ({ id: l.id, name: l.name })),
  });

  const [deleteConfirmCase, setDeleteConfirmCase] = useState<Case | null>(null);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAutoGenerateModal, setShowAutoGenerateModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCreateCase = (_values: AddCaseFormValues) => {
    toast.success('Case created');
    setShowAddCaseModal(false);
  };

  const activeFilterBadges = useMemo((): FilterBadge[] => {
    const badges: FilterBadge[] = [];
    if (searchQuery) {
      badges.push({
        id: 'search',
        type: 'search',
        label: 'Search',
        value: searchQuery,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (caseTypeFilter && caseTypeFilter !== 'all') {
      const typeLabels = caseTypeFilter
        .split(',')
        .map((t) => t.trim())
        .map((t) => CASE_TYPE_LABELS[t] ?? t);
      badges.push({
        id: 'caseType',
        type: 'filter',
        label: 'Type',
        value: typeLabels.join(', '),
        onRemove: () => setCaseTypeFilter('all'),
      });
    }
    if (dateFromFilter) {
      badges.push({
        id: 'dateFrom',
        type: 'range',
        label: 'From',
        value: dateFromFilter,
        onRemove: () => setDateFromFilter(''),
      });
    }
    if (dateToFilter) {
      badges.push({
        id: 'dateTo',
        type: 'range',
        label: 'To',
        value: dateToFilter,
        onRemove: () => setDateToFilter(''),
      });
    }
    return badges;
  }, [
    searchQuery,
    caseTypeFilter,
    dateFromFilter,
    dateToFilter,
    setSearchQuery,
    setCaseTypeFilter,
    setDateFromFilter,
    setDateToFilter,
  ]);

  const handleClearAllFilters = () => {
    clearAllFilters();
    console.log('clearAllFilters');
  };

  const getLinkedLibrariesForCase = (case_: Case) =>
    libraries.filter((lib) => case_.linkedLibraries.includes(lib.id));

  const handleAutoGenerate = () => {
    setIsGenerating(true);
    setShowAutoGenerateModal(false);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Cases generated');
    }, 2000);
  };

  const handleDeleteConfirm = () => {
    setDeleteConfirmCase(null);
    toast.success('Case deleted successfully!');
  };

  return (
    <div className='min-h-screen bg-white p-6 dark:bg-[#101922]'>
      <PageHeader
        title='Cases'
        description='Manage lab cases and link libraries, workflow runs, and files.'
        icon={<Briefcase className='h-6 w-6' />}
        actions={
          <div className='flex items-center gap-2'>
            <button
              className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:hover:bg-[#2d3540]'
              onClick={() => setShowAutoGenerateModal(true)}
            >
              <Sparkles className='h-4 w-4' />
              Auto-generate Cases
            </button>
            <button
              className='flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
              onClick={() => setShowAddCaseModal(true)}
            >
              <Plus className='h-4 w-4' />
              Add New Case
            </button>
          </div>
        }
      />

      <FilterBar
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by case title, alias, or library ID...'
        searchLabel='Search cases'
        searchId='cases-filter-search'
        filters={
          <>
            <Select
              value={caseTypeFilter}
              onChange={setCaseTypeFilter}
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'clinical', label: 'Clinical' },
                { value: 'research', label: 'Research' },
                { value: 'validation', label: 'Validation' },
                { value: 'qc', label: 'QC' },
              ]}
            />
            <div className='flex items-center gap-2'>
              <label
                htmlFor='cases-date-from'
                className='text-sm text-neutral-600 dark:text-[#9dabb9]'
              >
                From:
              </label>
              <input
                id='cases-date-from'
                type='date'
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className='rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label
                htmlFor='cases-date-to'
                className='text-sm text-neutral-600 dark:text-[#9dabb9]'
              >
                To:
              </label>
              <input
                id='cases-date-to'
                type='date'
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className='rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]'
              />
            </div>
          </>
        }
        activeFilterBadges={activeFilterBadges}
        onClearAll={activeFilterBadges?.length > 0 ? handleClearAllFilters : undefined}
      />

      <CasesTable
        data={filteredCases}
        onViewLinked={setSelectedCase}
        onDelete={setDeleteConfirmCase}
        emptyMessage='No cases found'
      />

      {selectedCase && (
        <CaseSummaryDrawer
          case_={selectedCase}
          linkedLibraries={getLinkedLibrariesForCase(selectedCase).map((lib) => ({
            id: lib.id,
            name: lib.name,
            type: lib.type,
            status: lib.status,
          }))}
          onClose={() => setSelectedCase(null)}
        />
      )}

      {deleteConfirmCase && (
        <DeleteCaseConfirmDialog
          case_={deleteConfirmCase}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirmCase(null)}
        />
      )}

      <AddCaseModal
        key={showAddCaseModal ? 'open' : 'closed'}
        isOpen={showAddCaseModal}
        libraries={libraries.map((l) => ({ id: l.id, name: l.name }))}
        onClose={() => setShowAddCaseModal(false)}
        onSubmit={handleCreateCase}
      />

      <AutoGenerateCasesModal
        isOpen={showAutoGenerateModal}
        isGenerating={isGenerating}
        onClose={() => setShowAutoGenerateModal(false)}
        onConfirm={handleAutoGenerate}
      />
    </div>
  );
}
