import { useSuspenseQuery } from '@tanstack/react-query';
import { useSuspenseFilePresignedURLModel } from '../../api/files.api';
import { getMimeType, getPresignedUrlData } from '@/utils/files';
import { useState } from 'react';
import { SimpleTable, type SimpleTableColumn } from '@/components/tables/SimpleTable';
import { cn } from '@/utils/cn';
import { Table2, AlertTriangle, ExternalLink } from 'lucide-react';

const MAX_PREVIEW_ROWS = 1000;

type Props = { s3ObjectId: string; s3Key: string };

export const TableViewer = ({ s3ObjectId, s3Key }: Props) => {
  const url = useSuspenseFilePresignedURLModel({
    params: { path: { id: s3ObjectId }, query: { responseContentDisposition: 'inline' } },
    headers: { 'Content-Type': getMimeType(s3Key) },
  }).data;
  if (!url) throw new Error('Unable to create presigned url');

  const rawData = useSuspenseQuery({
    queryKey: ['presignedUrlData', url],
    queryFn: () => getPresignedUrlData(url),
  }).data;
  if (!rawData) throw new Error('Unable to load data');

  const [isTableView, setIsTableView] = useState(true);

  const delimiter = s3Key.endsWith('.tsv') ? '\t' : ',';
  const filename = s3Key.split('/').pop() ?? s3Key;

  // Normalise line endings and split; drop trailing empty line
  const allRows = rawData.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n');
  const isTruncated = allRows.length > MAX_PREVIEW_ROWS + 1; // +1 for header
  const headerRow = allRows[0].split(delimiter);
  const viewableRows = allRows.slice(1, MAX_PREVIEW_ROWS + 1);

  type RowData = Record<string, string>;

  const tableData: RowData[] = viewableRows.map((row, idx) => {
    const values = row.split(delimiter);
    const obj: RowData = { _rowNum: (idx + 2).toString() };
    headerRow.forEach((header, i) => {
      obj[header] = values[i] ?? '';
    });
    return obj;
  });

  const columns: SimpleTableColumn<RowData>[] = [
    {
      key: '_rowNum',
      header: '#',
      render: (row) => (
        <span className='border-r border-gray-200 pr-3 font-mono text-gray-500 dark:border-gray-700 dark:text-gray-400'>
          {row._rowNum}
        </span>
      ),
    },
    ...headerRow.map((colName) => ({
      key: colName,
      header: colName,
      render: (row: RowData) => <span className='font-mono text-xs'>{row[colName]}</span>,
    })),
  ];

  return (
    <div className={cn('h-full w-full', 'overflow-hidden', 'bg-white dark:bg-gray-900')}>
      {/* Header */}
      <div
        className={cn(
          'border-b px-4 py-2',
          'border-gray-200 dark:border-gray-700',
          'bg-gray-50 dark:bg-gray-800'
        )}
      >
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Table2 className='h-4 w-4 text-gray-500 dark:text-gray-400' />
            <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100'>Table Preview</h3>
          </div>
          <div className='flex items-center gap-3'>
            <a
              href={url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            >
              <span>{filename}</span>
              <ExternalLink className='h-3 w-3' />
            </a>
            <label className='flex cursor-pointer items-center gap-1.5'>
              <input
                type='checkbox'
                onChange={(e) => setIsTableView(e.target.checked)}
                checked={isTableView}
                className={cn(
                  'h-3.5 w-3.5 rounded',
                  'border-gray-300 dark:border-gray-600',
                  'text-blue-600 dark:text-blue-500',
                  'focus:ring-2 focus:ring-blue-500'
                )}
              />
              <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                Table View
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className='h-[calc(100%-2.5rem)] overflow-auto'>
        {isTruncated && (
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'border-b border-amber-200 dark:border-amber-700',
              'bg-amber-50 dark:bg-amber-900/30',
              'text-amber-800 dark:text-amber-200'
            )}
          >
            <AlertTriangle className='h-4 w-4 shrink-0' />
            <p className='text-xs font-medium'>
              Showing first {MAX_PREVIEW_ROWS.toLocaleString()} rows only. Download the file to view
              all data.
            </p>
          </div>
        )}

        {isTableView ? (
          <SimpleTable<RowData>
            data={tableData}
            columns={columns}
            rowKey={(_, idx) => idx}
            emptyMessage='No data rows found.'
          />
        ) : (
          <pre
            className={cn(
              'm-0 p-4',
              'font-mono text-xs leading-relaxed',
              'text-gray-800 dark:text-gray-200',
              'bg-white dark:bg-gray-900'
            )}
          >
            {[allRows[0], ...viewableRows].join('\n')}
          </pre>
        )}
      </div>
    </div>
  );
};
