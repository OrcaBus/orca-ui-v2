import { useNavigate } from 'react-router';
import { DataTable, type Column, type DataTableToolbarAction } from '@/components/tables/DataTable';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { orderByParam } from '@/utils/queryParams';
import { useQueryMetadataProjectModel, type ProjectDetailType } from '../../shared/api/lab.api';
import {
  createCsvDownloadAction,
  joinTableValues,
  renderClickableId,
  renderStackedValues,
  renderTextValue,
} from '../../shared/utils';
import { useProjectQueryParams } from '../hooks/useProjectQueryParams';
import { createProjectContactRows } from '../utils/projectTableRows';

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
      render: (project) =>
        renderClickableId(
          project.projectId,
          navigate,
          (id) => `/lab?projectId=${encodeURIComponent(id)}`
        ),
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      sortDirection: getOrderDirection('name'),
      defaultSortDirection: 'desc',
      onSort: (nextDirection) => setOrderBy(orderByParam(nextDirection, 'name')),
      csvValue: (project) => project.name ?? '',
      render: (project) => renderTextValue(project.name),
    },
    {
      key: 'contactIds',
      header: 'Contact ID',
      csvValue: (project) =>
        joinTableValues(createProjectContactRows(project).map((row) => row.contactId)),
      render: (project) =>
        renderStackedValues(createProjectContactRows(project).map((row) => row.contactId)),
    },
    {
      key: 'contactNames',
      header: 'Name',
      csvValue: (project) =>
        joinTableValues(createProjectContactRows(project).map((row) => row.name)),
      render: (project) =>
        renderStackedValues(createProjectContactRows(project).map((row) => row.name)),
    },
  ];

  const toolbarActions: DataTableToolbarAction<ProjectDetailType>[] = [
    createCsvDownloadAction<ProjectDetailType>('projects'),
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
