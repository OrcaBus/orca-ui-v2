import { Upload, FileText, Download } from 'lucide-react';
import { DataTable, Column } from '../../../components/tables/DataTable';
import { useTablePagination } from '../../../components/tables/useTablePagination';
import { formatTableDate } from '../../../utils/timeFormat';
import type { SampleSheet } from '../../../data/mockData';

interface SequenceSampleSheetsTabProps {
  sampleSheets: SampleSheet[];
  onUpload: () => void;
}

export function SequenceSampleSheetsTab({ sampleSheets, onUpload }: SequenceSampleSheetsTabProps) {
  const pagination = useTablePagination(1, 20, sampleSheets.length);

  const columns: Column<SampleSheet>[] = [
    {
      key: 'fileName',
      header: 'File Name',
      sortable: true,
      render: (sheet) => (
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 shrink-0 text-neutral-400 dark:text-[#9dabb9]' />
          <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {sheet.fileName}
          </span>
        </div>
      ),
    },
    {
      key: 'uploadedDate',
      header: 'Uploaded Time',
      sortable: true,
      render: (sheet) => (
        <span className='text-sm text-neutral-600 dark:text-neutral-400'>
          {formatTableDate(sheet.uploadedDate)}
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      sortable: true,
      render: (sheet) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>{sheet.uploadedBy}</span>
      ),
    },
    {
      key: 'validationStatus',
      header: 'Status',
      sortable: true,
      render: (sheet) => (
        <span
          className={`rounded px-2 py-1 text-xs font-medium ${
            sheet.validationStatus === 'valid'
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400'
              : sheet.validationStatus === 'invalid'
                ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
          }`}
        >
          {sheet.validationStatus}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Actions',
      render: () => (
        <div className='flex items-center gap-3'>
          <button className='text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'>
            View
          </button>
          <button className='flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300'>
            <Download className='h-3.5 w-3.5' />
            Download
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className='mb-4 flex items-center justify-between'>
        <div />
        <button
          onClick={onUpload}
          className='flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <Upload className='h-4 w-4' />
          Upload Sample Sheet
        </button>
      </div>
      <DataTable
        columns={columns}
        data={sampleSheets}
        emptyMessage='No sample sheets uploaded yet'
        paginationProps={pagination}
      />
    </div>
  );
}
