import { useNavigate } from 'react-router';
import { FileText, Info } from 'lucide-react';
import { PillTag } from '@/components/ui/PillTag';
import type { PillTagVariant } from '@/components/ui/PillTag';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import {
  useQueryMetadataLibraryModel,
  type LibraryDetailType,
  type QualityEnum,
} from '../../shared/api/lab.api';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { orderByParam } from '@/utils/queryParams';
import { useLibraryDetailsRelatedLibrariesQueryParams } from '../hooks/useLibraryDetailsRelatedLibrariesQueryParams';

export function LibraryDetailsRelatedLibrariesTable() {
  const navigate = useNavigate();
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();

  const { orderBy, setOrderBy, getOrderDirection, pagination, setPage, setRowsPerPage } =
    useLibraryDetailsRelatedLibrariesQueryParams();

  const individualIdArray = libraryDetail.subject.individualSet
    .map((individual) => individual.individualId)
    .filter((id) => id !== null && id !== undefined);

  const {
    data: relatedLibraries,
    isLoading: isLoadingRelatedLibraries,
    isError: isErrorRelatedLibraries,
    error: errorRelatedLibraries,
    refetch: refetchRelatedLibraries,
  } = useQueryMetadataLibraryModel({
    params: {
      query: {
        ...(individualIdArray.length > 0 && { individualId: individualIdArray.join(',') }),
        page: pagination.page,
        rowsPerPage: pagination.rowsPerPage,
        ordering: orderBy || undefined,
      },
    },
    reactQuery: {
      enabled: individualIdArray.length > 0,
    },
  });

  const relatedLibrariesColumns: Column<LibraryDetailType>[] = [
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      sortDirection: getOrderDirection('library_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'library_id')),
      render: (lib) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/lab/libraries/${lib.orcabusId}`);
          }}
          className='text-left font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
        >
          {lib.libraryId}
        </button>
      ),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      sortDirection: getOrderDirection('phenotype'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'phenotype')),
      render: (lib) => (
        <span className='text-neutral-700 dark:text-[#9dabb9]'>{lib.phenotype || '-'}</span>
      ),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      sortDirection: getOrderDirection('workflow'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'workflow')),
      render: (lib) => (
        <span className='text-sm text-neutral-600 dark:text-[#9dabb9]'>{lib.workflow || '-'}</span>
      ),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      sortDirection: getOrderDirection('quality'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'quality')),
      render: (lib) => {
        const mapQualityToVariant: Record<QualityEnum, PillTagVariant> = {
          'very-poor': 'red',
          poor: 'red',
          good: 'green',
          borderline: 'amber',
        };
        if (!lib.quality) return '-';
        const variant = mapQualityToVariant[lib.quality];
        return (
          <PillTag variant={variant} size='sm'>
            {lib.quality?.toString()}
          </PillTag>
        );
      },
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortDirection: getOrderDirection('type'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'type')),
      render: (lib) => (
        <span className='truncate text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {lib.type || '-'}
        </span>
      ),
    },
    {
      key: 'assay',
      header: 'Assay',
      sortable: true,
      sortDirection: getOrderDirection('assay'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'assay')),
      render: (lib) => (
        <span className='truncate text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {lib.assay || '-'}
        </span>
      ),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      sortDirection: getOrderDirection('coverage'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'coverage')),
      render: (lib) => (
        <span className='text-sm text-neutral-900 dark:text-slate-100'>{lib.coverage ?? '-'}</span>
      ),
    },
    {
      key: 'overrideCycles',
      header: 'Override Cycles',
      sortable: true,
      sortDirection: getOrderDirection('override_cycles'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'override_cycles')),
      render: (lib) => (
        <span className='font-mono text-xs text-neutral-600 dark:text-[#9dabb9]'>
          {lib.overrideCycles ?? '-'}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject ID',
      csvValue: (lib) => lib.subject?.subjectId ?? '',
      render: (lib) => (
        <span className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {lib.subject?.subjectId}
        </span>
      ),
    },
    {
      key: 'sample',
      header: 'Sample ID',
      csvValue: (lib) => lib.sample.sampleId ?? '',
      render: (lib) => (
        <span className='text-sm text-neutral-700 dark:text-[#9dabb9]'>{lib.sample.sampleId}</span>
      ),
    },
    {
      key: 'externalSampleId',
      header: 'External Sample ID',
      csvValue: (lib) => lib.sample.externalSampleId ?? '',
      render: (lib) => (
        <span className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {lib.sample.externalSampleId ?? '-'}
        </span>
      ),
    },
    {
      key: 'projectSet',
      header: 'Project ID',
      csvValue: (lib) => lib.projectSet.map((p) => p.projectId).join(', '),
      render: (lib) => (
        <span className='text-sm text-neutral-700 dark:text-[#9dabb9]'>
          {(lib.projectSet.map((project) => project.projectId).join(', ') ?? '-') || '-'}
        </span>
      ),
    },
    {
      key: 'projectName',
      header: 'Project Name',
      sortable: false,
      csvValue: (lib) => lib.projectSet.map((p) => p.name).join(', '),
      render: (lib) => (
        <span className='block max-w-37.5 truncate text-xs text-neutral-700 dark:text-[#9dabb9]'>
          {(lib.projectSet.map((project) => project.name).join(', ') ?? '-') || '-'}
        </span>
      ),
    },
  ];

  if (isErrorRelatedLibraries) {
    return (
      <ApiErrorState
        error={errorRelatedLibraries}
        onRetry={() => {
          void refetchRelatedLibraries();
        }}
      />
    );
  }

  if (
    !!libraryDetail &&
    !isLoadingLibraryDetail &&
    !isErrorRelatedLibraries &&
    !isLoadingRelatedLibraries &&
    relatedLibraries?.results.length === 0
  ) {
    return (
      <div className='rounded-lg border border-neutral-200 bg-white p-12 text-center dark:border-[#2d3540] dark:bg-[#111418]'>
        <FileText className='mx-auto mb-4 h-12 w-12 text-neutral-300 dark:text-[#4a5568]' />
        <h3 className='mb-1 font-medium text-neutral-900 dark:text-white'>No related libraries</h3>
        <p className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          No other libraries share the same individual ID.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className='mb-4 flex items-center gap-2 text-sm text-neutral-600 dark:text-[#9dabb9]'>
        <Info className='h-4 w-4' />
        <span>Related is determined based on the same individual ID</span>
      </div>
      <DataTable
        data={relatedLibraries?.results ?? []}
        columns={relatedLibrariesColumns}
        isLoading={isLoadingRelatedLibraries}
        onRefresh={() => void refetchRelatedLibraries()}
        paginationProps={{
          page: relatedLibraries?.pagination.page ?? pagination.page,
          pageSize: relatedLibraries?.pagination.rowsPerPage ?? pagination.rowsPerPage,
          onPageChange: (page) => setPage(page),
          onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
          totalItems: relatedLibraries?.pagination.count ?? 0,
        }}
      />
    </div>
  );
}
