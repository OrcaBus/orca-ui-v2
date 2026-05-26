import { useState, useCallback, useMemo } from 'react';
import { FileSearch } from 'lucide-react';
import { FileDownloadButton } from './FileDownloadButton';
import { DataTable, type Column } from '@/components/tables/DataTable';
import { getFileTypeBadgeStyle, formatBytes, getFilename, getFileExtension } from '@/utils/files';
import { useFileObjectListModel, type S3Record } from '../api/files.api';
import { useFilesListQueryParams } from '../hooks/useFilesListQueryParams';
import { ApiErrorState } from '@/components/ui/ApiErrorState';
import { DEFAULT_PAGE_SIZE } from '@/utils/constants';
import { formatTableDate } from '@/utils/timeFormat';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { FileRecordDetailsDrawer } from './FileRecordDetailsDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilePathSegments } from './FilePathSegments';
import { FilePreviewButton } from './FilePreviewButton';
import { FileIgvDesktopButton as IgvDesktopButton } from './FileIgvDesktopButton';
import { IGV_FILETYPE_LIST, isFileDownloadable } from '@/utils/files';
import { FileMoreActionsDropdown } from './FileMoreActionsDropdown';

export function FilesTable() {
  const { fileListQueryParams, setPage, setRowsPerPage, hasSearchORFilters } =
    useFilesListQueryParams();

  const [selectedFile, setSelectedFile] = useState<S3Record | null>(null);

  const closeDetail = useCallback(() => setSelectedFile(null), []);

  const {
    data: filesData,
    isLoading: isLoadingFilesData,
    isError: isErrorFilesData,
    error: filesError,
    refetch: refetchFilesData,
  } = useFileObjectListModel({
    params: {
      query: {
        ...fileListQueryParams,
        currentState: true, // Only fetch current state for the table view
      },
    },
    enabled: hasSearchORFilters, // Don't fetch until query params are parsed
  });

  const columns: Column<S3Record>[] = useMemo(
    () => [
      {
        key: 'key',
        header: 'File Name',
        sortable: true,
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
                  onClick={() => setSelectedFile(file)}
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
        sortable: false,
        render: (file) => {
          const { key: s3Key, s3ObjectId, bucket } = file;

          const isDownloadable = isFileDownloadable(s3Key);
          const isIgvFile = !!IGV_FILETYPE_LIST.find((f) => s3Key.endsWith(f));
          return (
            <div className='flex items-center gap-1'>
              {isIgvFile && (
                <IgvDesktopButton s3ObjectId={s3ObjectId} bucket={bucket} s3Key={s3Key} iconOnly />
              )}
              <FilePreviewButton s3Record={file} />
              {!isIgvFile && isDownloadable && <FileDownloadButton s3Record={file} />}
              <FileMoreActionsDropdown
                s3Record={file}
                onViewDetails={() => setSelectedFile(file)}
              />
            </div>
          );
        },
      },
      {
        key: 'bucket',
        header: 'Bucket Name',
        sortable: true,
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
        sortable: true,
        render: (file) => (
          <span className='text-sm text-neutral-900 dark:text-[#9dabb9]'>
            {file.size != null ? formatBytes(file.size) : '-'}
          </span>
        ),
      },
      {
        key: 'lastModifiedDate',
        header: 'Last Modified',
        sortable: true,
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
    [setSelectedFile]
  );

  if (isErrorFilesData) {
    return <ApiErrorState error={filesError} onRetry={() => void refetchFilesData()} />;
  }

  if (!hasSearchORFilters) {
    return (
      <div className='rounded-lg border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'>
        <EmptyState
          icon={FileSearch}
          title='No Search or Filtering Performed'
          description='Use the search and filters above to search for files. Provide search terms or apply one of the filters.'
        />
      </div>
    );
  }

  return (
    <>
      <DataTable
        data={filesData?.results ?? []}
        columns={columns}
        isLoading={isLoadingFilesData}
        onRefresh={() => void refetchFilesData()}
        emptyMessage='No files found. Try adjusting your search or filters?'
        paginationProps={{
          page: filesData?.pagination.page || 1,
          pageSize: filesData?.pagination.rowsPerPage || DEFAULT_PAGE_SIZE,
          onPageChange: (p) => setPage(p ?? 1),
          onPageSizeChange: (size) => setRowsPerPage(size),
          totalItems: filesData?.pagination.count || 0,
        }}
      />
      {selectedFile && <FileRecordDetailsDrawer file={selectedFile} onClose={closeDetail} />}
    </>
  );
}
