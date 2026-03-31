import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Tabs } from '../../../components/ui/Tabs';
import { toast } from 'sonner';
import { getCaseById, getLibraries, getWorkflowRuns, getFiles } from '../api/cases.api';
import {
  CaseOverviewCard,
  CaseDetailPageHeader,
  LinkedLibrariesTable,
  WorkflowRunsTable,
  FilesTable,
  DeleteCaseConfirmDialog,
  LinkLibrariesModal,
  AddWorkflowRunsModal,
  EditCaseModal,
} from '../components';
import { useCaseDetailTab } from '../hooks/useCaseDetailTab';

export function CaseDetailPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useCaseDetailTab();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLinkLibrariesModal, setShowLinkLibrariesModal] = useState(false);
  const [showAddWorkflowModal, setShowAddWorkflowModal] = useState(false);
  const [librarySearchQuery, setLibrarySearchQuery] = useState('');
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');
  const [selectedLibrariesToLink, setSelectedLibrariesToLink] = useState<string[]>([]);
  const [selectedWorkflowsToAdd, setSelectedWorkflowsToAdd] = useState<string[]>([]);
  const [linkedLibraryIds, setLinkedLibraryIds] = useState<string[]>(() =>
    caseId ? (getCaseById(caseId)?.linkedLibraries ?? []) : []
  );
  const [manualWorkflowIds, setManualWorkflowIds] = useState<string[]>([]);

  const caseData = caseId ? getCaseById(caseId) : undefined;
  const libraries = getLibraries();
  const workflowRuns = getWorkflowRuns();
  const files = getFiles();

  if (!caseData) {
    return (
      <div className='p-6'>
        <div className='py-12 text-center'>
          <h2 className='mb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100'>
            Case not found
          </h2>
          <p className='mb-4 text-neutral-600 dark:text-neutral-400'>
            The case you&apos;re looking for doesn&apos;t exist.
          </p>
          <button
            onClick={() => void navigate('/cases')}
            className='rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    toast.success('Case deleted successfully');
    setShowDeleteModal(false);
    void navigate('/cases');
  };

  const linkedLibraries = libraries.filter((lib) => linkedLibraryIds.includes(lib.id));
  const workflowRunsFromLibraries = workflowRuns.filter((run) =>
    linkedLibraryIds.includes(run.libraryId || '')
  );
  const manualWorkflows = workflowRuns.filter((run) => manualWorkflowIds.includes(run.id));
  const allWorkflowRuns = [...workflowRunsFromLibraries, ...manualWorkflows];
  const filesFromWorkflows = files.filter((file) =>
    allWorkflowRuns.some((run) => run.id === file.workflowRunId)
  );

  const handleLinkLibraries = () => {
    setLinkedLibraryIds([...linkedLibraryIds, ...selectedLibrariesToLink]);
    setSelectedLibrariesToLink([]);
    setLibrarySearchQuery('');
    setShowLinkLibrariesModal(false);
    toast.success(
      `${selectedLibrariesToLink.length} ${selectedLibrariesToLink.length === 1 ? 'library' : 'libraries'} linked`
    );
  };

  const handleUnlinkLibrary = (libraryId: string) => {
    setLinkedLibraryIds(linkedLibraryIds.filter((id) => id !== libraryId));
    toast.success('Library unlinked');
  };

  const handleAddWorkflows = () => {
    setManualWorkflowIds([...manualWorkflowIds, ...selectedWorkflowsToAdd]);
    setSelectedWorkflowsToAdd([]);
    setWorkflowSearchQuery('');
    setShowAddWorkflowModal(false);
    toast.success(
      `${selectedWorkflowsToAdd.length} workflow ${selectedWorkflowsToAdd.length === 1 ? 'run' : 'runs'} added`
    );
  };

  const toggleLibrarySelection = (libraryId: string) => {
    if (selectedLibrariesToLink.includes(libraryId)) {
      setSelectedLibrariesToLink(selectedLibrariesToLink.filter((id) => id !== libraryId));
    } else {
      setSelectedLibrariesToLink([...selectedLibrariesToLink, libraryId]);
    }
  };

  const toggleWorkflowSelection = (workflowId: string) => {
    if (selectedWorkflowsToAdd.includes(workflowId)) {
      setSelectedWorkflowsToAdd(selectedWorkflowsToAdd.filter((id) => id !== workflowId));
    } else {
      setSelectedWorkflowsToAdd([...selectedWorkflowsToAdd, workflowId]);
    }
  };

  const availableLibraries = libraries.filter(
    (lib) =>
      !linkedLibraryIds.includes(lib.id) &&
      (lib.name.toLowerCase().includes(librarySearchQuery.toLowerCase()) ||
        lib.id.toLowerCase().includes(librarySearchQuery.toLowerCase()))
  );

  const availableWorkflows = workflowRuns.filter(
    (run) =>
      !manualWorkflowIds.includes(run.id) &&
      !linkedLibraryIds.includes(run.libraryId || '') &&
      (run.name.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
        run.id.toLowerCase().includes(workflowSearchQuery.toLowerCase()))
  );

  const tabs = [
    { id: 'libraries', label: 'Libraries', count: linkedLibraries.length },
    { id: 'workflows', label: 'Workflow Runs', count: allWorkflowRuns.length },
    { id: 'files', label: 'Files', count: filesFromWorkflows.length },
  ];

  return (
    <div className='p-6'>
      <CaseDetailPageHeader
        case_={caseData}
        onEdit={() => setShowEditModal(true)}
        onDelete={() => setShowDeleteModal(true)}
      />

      <CaseOverviewCard case_={caseData} />

      <div className='mb-6'>
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id)} />
      </div>

      <div>
        {activeTab === 'libraries' && (
          <LinkedLibrariesTable
            linkedLibraries={linkedLibraries}
            caseLastModified={caseData.lastModified}
            onLinkLibraries={() => setShowLinkLibrariesModal(true)}
            onUnlinkLibrary={handleUnlinkLibrary}
          />
        )}

        {activeTab === 'workflows' && (
          <WorkflowRunsTable
            allWorkflowRuns={allWorkflowRuns}
            libraries={libraries}
            manualCount={manualWorkflowIds.length}
            onAddWorkflowRuns={() => setShowAddWorkflowModal(true)}
          />
        )}

        {activeTab === 'files' && (
          <FilesTable files={filesFromWorkflows} workflowRuns={allWorkflowRuns} />
        )}
      </div>

      {showDeleteModal && (
        <DeleteCaseConfirmDialog
          case_={caseData}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      <EditCaseModal
        isOpen={showEditModal}
        case_={caseData}
        onClose={() => setShowEditModal(false)}
        onSubmit={() => {
          // TODO: call updateCase API when backend is ready
          toast.success('Case updated successfully');
        }}
      />

      <LinkLibrariesModal
        isOpen={showLinkLibrariesModal}
        searchQuery={librarySearchQuery}
        selectedIds={selectedLibrariesToLink}
        availableLibraries={availableLibraries}
        onClose={() => {
          setShowLinkLibrariesModal(false);
          setSelectedLibrariesToLink([]);
          setLibrarySearchQuery('');
        }}
        onSearchChange={setLibrarySearchQuery}
        onToggleLibrary={toggleLibrarySelection}
        onConfirm={handleLinkLibraries}
      />

      <AddWorkflowRunsModal
        isOpen={showAddWorkflowModal}
        searchQuery={workflowSearchQuery}
        selectedIds={selectedWorkflowsToAdd}
        availableWorkflows={availableWorkflows}
        onClose={() => {
          setShowAddWorkflowModal(false);
          setSelectedWorkflowsToAdd([]);
          setWorkflowSearchQuery('');
        }}
        onSearchChange={setWorkflowSearchQuery}
        onToggleWorkflow={toggleWorkflowSelection}
        onConfirm={handleAddWorkflows}
      />
    </div>
  );
}
