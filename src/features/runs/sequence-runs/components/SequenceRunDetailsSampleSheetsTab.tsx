import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { formatTableDate } from '@/utils/timeFormat';
import { useSequenceRunDetailsContext } from '../context/SequenceRunDetailsContext';
import { useParams } from 'react-router-dom';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  useSequenceRunSampleSheetsByInstrumentRunIdModel,
  type SequenceRunSampleSheetDetailModel,
} from '../../shared/api/sequence.api';
import { SimpleTable } from '@/components/tables/SimpleTable';
import { Column } from '@/components/tables/DataTable';
import { SampleSheetUploadModal } from './SampleSheetUploadModal';
import { SampleSheetViewModal } from './SampleSheetViewModal';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

export function SequenceRunDetailsSampleSheetsTab() {
  const { instrumentRunId } = useParams<{ instrumentRunId: string }>();
  const { sequenceRunData, refresh } = useSequenceRunDetailsContext();

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [viewingSampleSheet, setViewingSampleSheet] =
    useState<SequenceRunSampleSheetDetailModel | null>(null);

  const {
    data: sequenceRunSampleSheetData,
    isLoading: isLoadingSequenceRunSampleSheets,
    isRefetching: isRefetchingSequenceRunSampleSheets,
    isError: isErrorSequenceRunSampleSheets,
    error: sequenceRunSampleSheetError,
    refetch: refetchSequenceRunSampleSheet,
  } = useSequenceRunSampleSheetsByInstrumentRunIdModel({
    params: { path: { instrumentRunId: instrumentRunId as string } },
    reactQuery: {
      enabled: !!instrumentRunId,
    },
  });

  const columns: Column<SequenceRunSampleSheetDetailModel>[] = [
    {
      key: 'sampleSheetName',
      header: 'Sample Sheet Name',
      sortable: true,
      render: (samplesheet) => (
        <div className='flex items-center gap-2'>
          <FileText className='h-4 w-4 shrink-0 text-neutral-400 dark:text-[#9dabb9]' />
          <span className='font-mono text-sm text-neutral-900 dark:text-neutral-100'>
            {samplesheet.sampleSheetName}
          </span>
        </div>
      ),
    },
    {
      key: 'SequenceRunId',
      header: 'Sequence Run ID',
      sortable: true,
      render: (samplesheet) => {
        const sequenceRun = sequenceRunData?.find((run) => run.orcabusId === samplesheet.sequence);
        return (
          <span className='text-sm text-neutral-900 dark:text-neutral-100'>
            {sequenceRun ? sequenceRun.sequenceRunId : samplesheet.sequence}
          </span>
        );
      },
    },
    {
      key: 'associationStatus',
      header: 'Association Status',
      sortable: true,
      render: (samplesheet) => <StatusBadge status={samplesheet.associationStatus} />,
    },
    {
      key: 'associationTimestamp',
      header: 'Timestamp',
      sortable: true,
      render: (samplesheet) => (
        <span className='text-sm text-neutral-600 dark:text-neutral-400'>
          {formatTableDate(samplesheet.associationTimestamp)}
        </span>
      ),
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      sortable: true,
      render: (samplesheet) => (
        <span className='text-sm text-neutral-900 dark:text-neutral-100'>
          {samplesheet.comment?.createdBy || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (samplesheet) => (
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setViewingSampleSheet(samplesheet)}
            className='flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:text-[#137fec] dark:hover:border dark:hover:border-[#137fec]/30 dark:hover:bg-[#137fec]/10 dark:hover:text-blue-300'
            title='View Samplesheet'
          >
            <FileText className='h-3.5 w-3.5' />
            View Samplesheet
          </button>
        </div>
      ),
    },
  ];

  if (isErrorSequenceRunSampleSheets) {
    return (
      <ApiErrorState
        error={sequenceRunSampleSheetError}
        onRetry={() => void refetchSequenceRunSampleSheet()}
      />
    );
  }

  const handleSampleSheetUploadSuccess = () => {
    setIsUploadModalOpen(false);
    void refetchSequenceRunSampleSheet();
    refresh(); // Refresh the entire context to update all panels with the new sample sheet.
  };

  return (
    <>
      <div className='mb-4 flex items-center justify-between'>
        <h3 className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
          Sample Sheets
        </h3>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className='flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
        >
          <Upload className='h-4 w-4' />
          Upload Sample Sheet
        </button>
      </div>

      <SimpleTable
        columns={columns}
        data={[...(sequenceRunSampleSheetData ?? [])].sort(
          (a, b) =>
            new Date(b.associationTimestamp).getTime() - new Date(a.associationTimestamp).getTime()
        )}
        isLoading={isLoadingSequenceRunSampleSheets || isRefetchingSequenceRunSampleSheets}
        emptyMessage='No sample sheets found for this sequence run.'
      />

      <SampleSheetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleSampleSheetUploadSuccess}
      />

      <SampleSheetViewModal
        isOpen={!!viewingSampleSheet}
        onClose={() => setViewingSampleSheet(null)}
        sampleSheet={viewingSampleSheet}
      />
    </>
  );
}
