import { useParams, useNavigate } from 'react-router';
import { Tabs } from '@/components/ui/Tabs';
import { mockLibraries, mockWorkflowRuns, mockFiles } from '../../../data/mockData';
import {
  LibraryDetailsPageHeader,
  LibraryOverviewCard,
  LibraryWorkflowRunsTab,
  LibraryFilesTab,
  LibraryRelatedLibrariesTab,
  LibraryHistoryTab,
  type LibraryHistoryRecord,
} from '../components';
import { useLibraryDetailTab } from '../hooks/useLibraryDetailTab';

function buildMockLibraryHistory(library: (typeof mockLibraries)[0]): LibraryHistoryRecord[] {
  return [
    {
      historyId: 'HIST001',
      projectSet: 'Clinical_Cohort_2024',
      orcabusId: library.orcabusId,
      libraryId: library.name,
      phenotype: library.phenotype,
      workflow: library.workflow,
      quality: library.quality,
      type: library.type,
      assay: library.assay,
      coverage: library.coverage,
      overrideCycles: library.overrideCycles,
      historyUserId: 'user.admin@example.com',
      historyDate: library.createdDate,
      historyChangeReason: 'Initial library creation',
      historyType: 'INSERT',
      sample: library.sampleId,
      subject: library.subjectId,
    },
    {
      historyId: 'HIST002',
      projectSet: 'Clinical_Cohort_2024',
      orcabusId: library.orcabusId,
      libraryId: library.name,
      phenotype: library.phenotype,
      workflow: library.workflow,
      quality: library.quality - 0.3,
      type: library.type,
      assay: library.assay,
      coverage: library.coverage,
      overrideCycles: library.overrideCycles,
      historyUserId: 'user.qc@example.com',
      historyDate: new Date(new Date(library.createdDate).getTime() + 3600000).toISOString(),
      historyChangeReason: 'Quality score updated after QC review',
      historyType: 'UPDATE',
      sample: library.sampleId,
      subject: library.subjectId,
    },
  ];
}

export function LibraryDetailsPage() {
  const { libraryId } = useParams<{ libraryId: string }>();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useLibraryDetailTab();

  const library = mockLibraries.find((lib) => lib.id === libraryId) ?? mockLibraries[0];

  if (!library) {
    return (
      <div className='p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-2 font-medium text-neutral-900 dark:text-white'>Library not found</h2>
          <p className='mb-4 text-sm text-neutral-600'>The requested library could not be found.</p>
          <button
            onClick={() => void navigate('/lab')}
            className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
          >
            Back to Lab
          </button>
        </div>
      </div>
    );
  }

  const relatedWorkflows = mockWorkflowRuns.filter((wf) => wf.libraryId === library.id);
  const relatedFiles = mockFiles.filter((file) => file.relatedLibraryId === library.id);
  const relatedLibraries = mockLibraries.filter(
    (lib) => lib.subjectId === library.subjectId && lib.id !== library.id
  );
  const libraryHistory = buildMockLibraryHistory(library);

  const tabs = [
    { id: 'workflows' as const, label: 'Workflow Runs', count: relatedWorkflows.length },
    { id: 'files' as const, label: 'Files', count: relatedFiles.length },
    { id: 'related' as const, label: 'Related Libraries', count: relatedLibraries.length },
    { id: 'history' as const, label: 'History', count: libraryHistory.length },
  ];

  const filesForWorkflow = (workflowRunId: string) =>
    relatedFiles.filter((file) => file.workflowRunId === workflowRunId);

  return (
    <div className='p-6'>
      <LibraryDetailsPageHeader library={library} />
      <LibraryOverviewCard
        library={library}
        relatedFiles={relatedFiles}
        relatedLibraries={relatedLibraries}
      />

      <div className='mb-6'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <div>
        {activeTab === 'workflows' && (
          <LibraryWorkflowRunsTab relatedWorkflows={relatedWorkflows} />
        )}
        {activeTab === 'files' && (
          <LibraryFilesTab
            relatedWorkflows={relatedWorkflows}
            filesForWorkflow={filesForWorkflow}
          />
        )}
        {activeTab === 'related' && (
          <LibraryRelatedLibrariesTab relatedLibraries={relatedLibraries} />
        )}
        {activeTab === 'history' && <LibraryHistoryTab history={libraryHistory} />}
      </div>
    </div>
  );
}
