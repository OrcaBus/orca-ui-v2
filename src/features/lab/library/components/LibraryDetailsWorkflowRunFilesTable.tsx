import { useMemo, useState } from 'react';
import { FileSearch } from 'lucide-react';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import {
  formatBytes,
  getFileExtension,
  getFilename,
  getFileTypeBadgeStyle,
  IGV_FILETYPE_LIST,
  isFileDownloadable,
} from '@/utils/files';
import { formatTableDate } from '@/utils/timeFormat';
import { useFileObjectListModel, type S3Record } from '@/features/files/api/files.api';
import { FileDownloadButton } from '@/features/files/components/FileDownloadButton';
import { FileIgvDesktopButton as IgvDesktopButton } from '@/features/files/components/FileIgvDesktopButton';
import { FileMoreActionsDropdown } from '@/features/files/components/FileMoreActionsDropdown';
import { FilePathSegments } from '@/features/files/components/FilePathSegments';
import { FilePreviewButton } from '@/features/files/components/FilePreviewButton';
import { FileRecordDetailsDrawer } from '@/features/files/components/FileRecordDetailsDrawer';
import { useLibraryDetailsWorkflowRunsQueryParams } from '../hooks/useLibraryDetailsWorkflowRunsQueryParams';

export function LibraryDetailsWorkflowRunFilesTable() {
  const [selectedFile, setSelectedFile] = useState<S3Record | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const {
    portalRunId,
    workflowRunFilePagination,
    setWorkflowRunFilePage,
    setWorkflowRunFileRowsPerPage,
    workflowRunFileListQueryParams,
  } = useLibraryDetailsWorkflowRunsQueryParams();

  const {
    data: filesData,
    isLoading,
    isRefetching,
    isError,
    error,
    refetch,
  } = useFileObjectListModel({
    params: {
      query: workflowRunFileListQueryParams,
    },
    reactQuery: {
      enabled: !!portalRunId,
    },
  });

  const columns: Column<S3Record>[] = useMemo(
    () => [
      {
        key: 'key',
        header: 'File Name',
        render: (file) => {
          const ext = getFileExtension(file.key);
          const name = getFilename(file.key);
          const dir = file.key.includes('/')
            ? file.key.substring(0, file.key.lastIndexOf('/') + 1)
            : '';

          return (
            <div className='flex items-center gap-3'>
              <span
                className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${getFileTypeBadgeStyle(ext)}`}
              >
                {ext}
              </span>
              <div>
                <button
                  type='button'
                  onClick={() => {
                    setSelectedFile(file);
                    setIsDetailOpen(true);
                  }}
                  className='text-left text-sm font-medium text-neutral-900 hover:underline dark:text-white'
                >
                  {name}
                </button>
                {dir && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='max-w-md truncate font-mono text-xs text-neutral-500 dark:text-[#8892a2]'>
                        {dir}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent
                      side='bottom'
                      align='start'
                      variant='light'
                      size='lg'
                      className='max-w-lg'
                    >
                      <FilePathSegments path={dir} />
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: 'actions',
        header: 'Actions',
        render: (file) => {
          const { key: s3Key, s3ObjectId, bucket } = file;
          const isDownloadable = isFileDownloadable(s3Key);
          const isIgvFile = !!IGV_FILETYPE_LIST.find((fileType) => s3Key.endsWith(fileType));

          return (
            <div className='flex items-center gap-1'>
              {isIgvFile && (
                <IgvDesktopButton s3ObjectId={s3ObjectId} bucket={bucket} s3Key={s3Key} iconOnly />
              )}
              <FilePreviewButton s3Record={file} />
              {!isIgvFile && isDownloadable && <FileDownloadButton s3Record={file} />}
              <FileMoreActionsDropdown
                s3Record={file}
                onViewDetails={() => {
                  setSelectedFile(file);
                  setIsDetailOpen(true);
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'bucket',
        header: 'Bucket Name',
        render: (file) => (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='inline-flex max-w-50 cursor-default items-center rounded bg-neutral-100 px-2.5 py-0.5 font-mono text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-[#9dabb9]'>
                <span className='truncate'>{file.bucket}</span>
              </span>
            </TooltipTrigger>
            <TooltipContent side='top' variant='light' size='sm'>
              {file.bucket}
            </TooltipContent>
          </Tooltip>
        ),
      },
      {
        key: 'size',
        header: 'Size',
        render: (file) => (
          <span className='text-sm text-neutral-900 dark:text-[#9dabb9]'>
            {file.size != null ? formatBytes(file.size) : '-'}
          </span>
        ),
      },
      {
        key: 'lastModifiedDate',
        header: 'Last Modified',
        render: (file) =>
          file.lastModifiedDate ? (
            <div className='text-sm text-neutral-900 dark:text-[#9dabb9]'>
              {formatTableDate(file.lastModifiedDate)}
            </div>
          ) : (
            <span className='text-sm text-neutral-500'>-</span>
          ),
      },
    ],
    []
  );

  if (!portalRunId) {
    return (
      <div className='flex min-h-90 items-center justify-center p-8'>
        <EmptyState
          icon={FileSearch}
          title='No workflow run selected'
          description='Select a workflow run to view its files.'
        />
      </div>
    );
  }

  if (isError) {
    return <ApiErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <>
      <DataTable
        data={filesData?.results ?? []}
        columns={columns}
        isLoading={isLoading || isRefetching}
        onRefresh={() => void refetch()}
        emptyMessage='No files found for this workflow run.'
        persistSettings={{
          key: 'library.workflowtype.workflowrun.filestable',
        }}
        inCard
        paginationProps={{
          page: filesData?.pagination.page ?? workflowRunFilePagination.page,
          pageSize: filesData?.pagination.rowsPerPage ?? DEFAULT_PAGE_SIZE,
          onPageChange: (page) => setWorkflowRunFilePage(page ?? 1),
          onPageSizeChange: (size) => setWorkflowRunFileRowsPerPage(size),
          totalItems: filesData?.pagination.count ?? 0,
        }}
      />
      <FileRecordDetailsDrawer
        file={selectedFile}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedFile(null);
        }}
      />
    </>
  );
}
