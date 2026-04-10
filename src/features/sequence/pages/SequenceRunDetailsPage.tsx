import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Tabs } from '../../../components/ui/Tabs';
import {
  mockSequenceRuns,
  mockLibraries,
  mockWorkflowRuns,
  mockSampleSheets,
} from '../../../data/mockData';
import {
  SequenceRunDetailsPageHeader,
  SequenceRunOverviewCard,
  SequenceTimelineTab,
  SequenceSampleSheetsTab,
  SequenceWorkflowRunsTab,
  SequenceRelatedLibrariesTab,
  UploadSampleSheetModal,
} from '../components';
import { useSequenceRunDetailTab } from '../hooks/useSequenceRunDetailTab';
import { groupByInstrumentRun, type InstrumentRunStatus } from '../utils/groupByInstrumentRun';

type BadgeStatus = 'running' | 'completed' | 'failed' | 'pending';

function getStatusBadgeStatus(status: InstrumentRunStatus): BadgeStatus {
  switch (status) {
    case 'SUCCEEDED':
      return 'completed';
    case 'FAILED':
    case 'ABORTED':
      return 'failed';
    case 'STARTED':
      return 'running';
    case 'RESOLVED':
    case 'DEPRECATED':
    default:
      return 'pending';
  }
}

export function SequenceRunDetailsPage() {
  const { runId } = useParams<{ runId: string }>();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useSequenceRunDetailTab();

  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const sequenceRuns = mockSequenceRuns.filter((run) => run.instrumentRunId === runId);

  if (sequenceRuns.length === 0) {
    return (
      <div className='p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-2 font-medium text-neutral-900 dark:text-neutral-100'>
            Instrument run not found
          </h2>
          <p className='mb-4 text-sm text-neutral-600 dark:text-neutral-400'>
            The requested instrument run could not be found.
          </p>
          <button
            onClick={() => void navigate('/sequence')}
            className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            Back to Sequence
          </button>
        </div>
      </div>
    );
  }

  const [instrumentRun] = groupByInstrumentRun(sequenceRuns);
  const { status, startTime, endTime } = instrumentRun;
  const statusBadge = getStatusBadgeStatus(status);

  const workflowsForInstrumentRun = mockWorkflowRuns.filter((wf) =>
    sequenceRuns.some((sr) => sr.id === wf.sequenceRunId)
  );
  const libraryIds = new Set(workflowsForInstrumentRun.map((wf) => wf.libraryId));
  const linkedLibraries = mockLibraries.filter((lib) => libraryIds.has(lib.id));

  const sampleSheets = mockSampleSheets.filter((sheet) =>
    sequenceRuns.some((sr) => sr.id === sheet.sequenceRunId)
  );

  const timelineEventCount = sequenceRuns.reduce((n, sr) => n + (sr.statusHistory?.length ?? 0), 0);

  const tabs = [
    { id: 'timeline', label: 'Timeline', count: timelineEventCount },
    { id: 'samplesheets', label: 'Sample Sheets', count: sampleSheets.length },
    { id: 'workflows', label: 'Workflow Runs', count: workflowsForInstrumentRun.length },
    { id: 'libraries', label: 'Related Libraries', count: linkedLibraries.length },
  ];

  const handleAddCustomState = (data: {
    stateName: string;
    timestamp: string;
    comment: string;
  }): Promise<void> => {
    console.log('Add custom state:', data);
    // In real app: POST to API then refetch timeline
    return Promise.resolve();
  };

  const handleAddComment = (data: { timestamp: string; comment: string }): Promise<void> => {
    console.log('Add comment:', data);
    // In real app: POST to API then refetch timeline
    return Promise.resolve();
  };

  const handleUploadSampleSheet = async (file: File, comment: string) => {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('Uploading:', { file: file.name, comment });
    alert('Sample sheet uploaded successfully!');
  };

  const isWorkflowsAvailable = status === 'SUCCEEDED' || status === 'RESOLVED';

  return (
    <div className='p-6'>
      <SequenceRunDetailsPageHeader runId={runId ?? ''} statusBadge={statusBadge} />
      <SequenceRunOverviewCard
        runId={runId ?? ''}
        statusBadge={statusBadge}
        startTime={startTime}
        endTime={endTime}
      />

      <div className='mb-6'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div>
        {activeTab === 'timeline' && (
          <SequenceTimelineTab
            sequenceRuns={sequenceRuns}
            onAddCustomState={handleAddCustomState}
            onAddComment={handleAddComment}
          />
        )}
        {activeTab === 'samplesheets' && (
          <SequenceSampleSheetsTab
            sampleSheets={sampleSheets}
            onUpload={() => setShowUploadDialog(true)}
          />
        )}
        {activeTab === 'workflows' && (
          <SequenceWorkflowRunsTab
            workflows={workflowsForInstrumentRun}
            libraries={mockLibraries}
            isAvailable={isWorkflowsAvailable}
          />
        )}
        {activeTab === 'libraries' && <SequenceRelatedLibrariesTab libraries={linkedLibraries} />}
      </div>

      <UploadSampleSheetModal
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSubmit={handleUploadSampleSheet}
      />
    </div>
  );
}
