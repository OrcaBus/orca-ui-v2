import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router';
import {
  DataTable,
  Column,
  DataTableToolbarAction,
  type DataTableActionContext,
} from '@/components/tables/DataTable';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { useWorkflowRunDetailsContext } from '../context/WorkflowRunDetailsContext';
import {
  useQueryMetadataLibraryModel,
  type LibraryDetailType,
  type QualityEnum,
} from '@/features/lab/shared/api/lab.api';
import { useWorkflowRunDetailsLibrariesQueryParams } from '../hooks/useWorkflowRunDetailsLibrariesQueryParams';
import { orderByParam } from '@/utils/queryParams';
import { FilterBar } from '@/components/tables/FilterBar';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { downloadTableAsCsv } from '@/utils/csv';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

export function WorkflowRunDetailsLibrariesTable() {
  const navigate = useNavigate();
  const { workflowRunDetail, isLoadingWorkflowRunDetail } = useWorkflowRunDetailsContext();

  const libraryIds = workflowRunDetail?.libraries.map((lib) => lib.libraryId) || [];
  const {
    search,
    librariesQueryParams,
    setPage,
    setRowsPerPage,
    setSearchQuery,
    setOrderBy,
    getOrderDirection,
  } = useWorkflowRunDetailsLibrariesQueryParams(libraryIds);
  const {
    isLoading: isLoadingWorkflowRunLibraries,
    isError: isErrorWorkflowRunLibraries,
    error: errorWorkflowRunLibraries,
    data: WorkflowRunLibraries,
    refetch: refetchLibraries,
  } = useQueryMetadataLibraryModel({
    params: {
      query: librariesQueryParams,
    },
  });

  const columns: Column<LibraryDetailType>[] = [
    {
      key: 'libraryId',
      header: 'Library ID',
      sortable: true,
      sortDirection: getOrderDirection('library_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'library_id')),
      render: (lib) => (
        <Button
          variant='ghost'
          size='inline'
          onClick={(e) => {
            e.stopPropagation();
            void navigate(`/lab/libraries/${lib.orcabusId}`);
          }}
          className='text-left font-mono font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
        >
          {lib.libraryId}
        </Button>
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

  const handleDownloadCsv = (ctx: DataTableActionContext<LibraryDetailType>) => {
    const hasPartialSelection =
      ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
    const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

    if (rows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    downloadTableAsCsv(rows, ctx.visibleColumns, 'libraries');
    toast.success(
      hasPartialSelection
        ? `Exported ${rows.length} selected row(s) to CSV`
        : `Exported all ${rows.length} row(s) to CSV`
    );
  };

  const toolbarActions: DataTableToolbarAction<LibraryDetailType>[] = [
    {
      id: 'download-csv',
      label: 'Download to CSV',
      icon: <Download className='h-4 w-4' />,
      onClick: handleDownloadCsv,
    },
  ];

  if (isErrorWorkflowRunLibraries) {
    return (
      <ApiErrorState
        title='Unable to load libraries'
        error={errorWorkflowRunLibraries}
        onRetry={() => void refetchLibraries()}
      />
    );
  }

  const isLoading = isLoadingWorkflowRunDetail || isLoadingWorkflowRunLibraries;

  return (
    <>
      <FilterBar
        searchValue={search || ''}
        onSearchChange={(search) => setSearchQuery(search)}
        searchPlaceholder='Search by Library ID, project...'
      />

      <DataTable
        data={WorkflowRunLibraries?.results || []}
        columns={columns}
        isLoading={isLoading}
        selectable
        onRefresh={() => void refetchLibraries()}
        toolbarActions={toolbarActions}
        emptyMessage='No libraries found'
        paginationProps={{
          page: WorkflowRunLibraries?.pagination.page || 1,
          pageSize: WorkflowRunLibraries?.pagination.rowsPerPage,
          onPageChange: (page) => setPage(page),
          onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
          totalItems: WorkflowRunLibraries?.pagination.count || 0,
        }}
      />
    </>
  );
}
