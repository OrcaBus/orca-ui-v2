import { useNavigate } from 'react-router';
import { FileText, Info } from 'lucide-react';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import { useQueryMetadataLibraryModel, type LibraryDetailType } from '../../shared/api/lab.api';
import { renderClickableId, renderQualityPill, renderTextValue } from '../../shared/utils';
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
      render: (lib) =>
        renderClickableId(lib.libraryId, navigate, () => `/lab/libraries/${lib.orcabusId}`),
    },
    {
      key: 'phenotype',
      header: 'Phenotype',
      sortable: true,
      sortDirection: getOrderDirection('phenotype'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'phenotype')),
      render: (lib) => renderTextValue(lib.phenotype),
    },
    {
      key: 'workflow',
      header: 'Workflow',
      sortable: true,
      sortDirection: getOrderDirection('workflow'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'workflow')),
      render: (lib) => renderTextValue(lib.workflow, 'text-neutral-600'),
    },
    {
      key: 'quality',
      header: 'Quality',
      sortable: true,
      sortDirection: getOrderDirection('quality'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'quality')),
      render: (lib) => renderQualityPill(lib.quality),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortDirection: getOrderDirection('type'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'type')),
      render: (lib) => renderTextValue(lib.type, 'truncate'),
    },
    {
      key: 'assay',
      header: 'Assay',
      sortable: true,
      sortDirection: getOrderDirection('assay'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'assay')),
      render: (lib) => renderTextValue(lib.assay, 'truncate'),
    },
    {
      key: 'coverage',
      header: 'Coverage',
      sortable: true,
      sortDirection: getOrderDirection('coverage'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'coverage')),
      render: (lib) => renderTextValue(lib.coverage, 'text-neutral-900 dark:text-slate-100'),
    },
    {
      key: 'overrideCycles',
      header: 'Override Cycles',
      sortable: true,
      sortDirection: getOrderDirection('override_cycles'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'override_cycles')),
      render: (lib) => renderTextValue(lib.overrideCycles, 'font-mono text-xs text-neutral-600'),
    },
    {
      key: 'subject',
      header: 'Subject ID',
      csvValue: (lib) => lib.subject?.subjectId ?? '',
      render: (lib) => renderTextValue(lib.subject?.subjectId),
    },
    {
      key: 'sample',
      header: 'Sample ID',
      csvValue: (lib) => lib.sample.sampleId ?? '',
      render: (lib) => renderTextValue(lib.sample.sampleId),
    },
    {
      key: 'externalSampleId',
      header: 'External Sample ID',
      csvValue: (lib) => lib.sample.externalSampleId ?? '',
      render: (lib) => renderTextValue(lib.sample.externalSampleId),
    },
    {
      key: 'projectSet',
      header: 'Project ID',
      csvValue: (lib) => lib.projectSet.map((p) => p.projectId).join(', '),
      render: (lib) =>
        renderTextValue(lib.projectSet.map((project) => project.projectId).join(', ')),
    },
    {
      key: 'projectName',
      header: 'Project Name',
      sortable: false,
      csvValue: (lib) => lib.projectSet.map((p) => p.name).join(', '),
      render: (lib) =>
        renderTextValue(
          lib.projectSet.map((project) => project.name).join(', '),
          'block max-w-37.5 truncate text-xs'
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
