import { useNavigate } from 'react-router';
import {
  DataTable,
  type Column,
  type DataTableActionContext,
  type DataTableToolbarAction,
} from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { downloadTableAsCsv } from '@/utils/csv';
import { orderByParam } from '@/utils/queryParams';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryMetadataProjectModel, type ProjectDetailType } from '../../shared/api/lab.api';
import { useProjectQueryParams } from '../hooks/useProjectQueryParams';
import { createProjectContactRows, joinProjectTableValues } from '../utils/projectTableRows';

const STACKED_VALUE_CLASS =
  'flex min-h-7 items-center text-sm text-neutral-700 dark:text-[#9dabb9]';

function renderTextValue(value: string | null | undefined, className = '') {
  return <span className={className}>{value || '-'}</span>;
}

function renderStackedValues(values: string[], className = '') {
  if (values.length === 0) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <div className='flex flex-col gap-1'>
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className={`${STACKED_VALUE_CLASS} ${className}`}>
          {value}
        </span>
      ))}
    </div>
  );
}

function renderProjectId(project: ProjectDetailType, navigate: ReturnType<typeof useNavigate>) {
  const projectId = project.projectId?.trim();

  if (!projectId) {
    return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>-</span>;
  }

  return (
    <button
      type='button'
      onClick={(event) => {
        event.stopPropagation();
        void navigate(`/lab?projectId=${encodeURIComponent(projectId)}`);
      }}
      className='font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400'
    >
      {projectId}
    </button>
  );
}

export function ProjectsTable() {
  const navigate = useNavigate();
  const {
    projectListQueryParams,
    pagination,
    setPage,
    setRowsPerPage,
    getOrderDirection,
    setOrderBy,
  } = useProjectQueryParams();

  const {
    isRefetching: isRefetchingProjects,
    isLoading: isLoadingProjects,
    isError,
    error,
    data: projects,
    refetch: refetchProjects,
  } = useQueryMetadataProjectModel({
    params: {
      query: projectListQueryParams,
    },
  });

  const columns: Column<ProjectDetailType>[] = [
    {
      key: 'projectId',
      header: 'Project ID',
      sortable: true,
      sortDirection: getOrderDirection('project_id'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'project_id')),
      csvValue: (project) => project.projectId ?? '',
      render: (project) => renderProjectId(project, navigate),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortDirection: getOrderDirection('name'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'name')),
      csvValue: (project) => project.name ?? '',
      render: (project) =>
        renderTextValue(project.name, 'text-sm text-neutral-700 dark:text-[#9dabb9]'),
    },
    {
      key: 'contactIds',
      header: 'Contact ID',
      csvValue: (project) =>
        joinProjectTableValues(createProjectContactRows(project).map((row) => row.contactId)),
      render: (project) =>
        renderStackedValues(createProjectContactRows(project).map((row) => row.contactId)),
    },
    {
      key: 'contactNames',
      header: 'Name',
      csvValue: (project) =>
        joinProjectTableValues(createProjectContactRows(project).map((row) => row.name)),
      render: (project) =>
        renderStackedValues(createProjectContactRows(project).map((row) => row.name)),
    },
  ];

  const handleDownloadCsv = (ctx: DataTableActionContext<ProjectDetailType>) => {
    const hasPartialSelection =
      ctx.selectedRows.length > 0 && ctx.selectedRows.length < ctx.data.length;
    const rows = hasPartialSelection ? ctx.selectedRows : ctx.data;

    if (rows.length === 0) {
      toast.warning('No data to export');
      return;
    }

    downloadTableAsCsv(rows, ctx.visibleColumns, 'projects');
    toast.success(
      hasPartialSelection
        ? `Exported ${rows.length} selected row(s) to CSV`
        : `Exported all ${rows.length} row(s) to CSV`
    );
  };

  const toolbarActions: DataTableToolbarAction<ProjectDetailType>[] = [
    {
      id: 'download-csv',
      label: 'Download to CSV',
      icon: <Download className='h-4 w-4' />,
      onClick: handleDownloadCsv,
    },
  ];

  if (isError) {
    return (
      <ApiErrorState
        title='Unable to load projects'
        error={error}
        onRetry={() => void refetchProjects()}
      />
    );
  }

  return (
    <DataTable
      data={projects?.results || []}
      columns={columns}
      isLoading={isLoadingProjects || isRefetchingProjects}
      selectable
      onRefresh={() => void refetchProjects()}
      toolbarActions={toolbarActions}
      emptyMessage='No projects found'
      paginationProps={{
        page: pagination.page,
        pageSize: pagination.rowsPerPage,
        onPageChange: (page) => setPage(page),
        onPageSizeChange: (pageSize) => setRowsPerPage(pageSize),
        totalItems: projects?.pagination.count || 0,
      }}
    />
  );
}
