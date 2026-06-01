import { SequenceRunsPage } from '../sequence-runs/pages/SequenceRunsPage';
import { WorkflowRunsPage } from '../workflow-runs/pages/WorkflowRunsPage';
import { AnalysisRunsPage } from '../analysis-runs/pages/AnalysisRunsPage';
import { WorkflowTypesPage } from '../workflow-types/pages/WorkflowTypesPage';
import { AnalysisTypesPage } from '../analysis-types/pages/AnalysisTypesPage';
import { AnalysisContextsPage } from '../analysis-contexts/pages/AnalysisContextsPage';
import { RunContextsPage } from '../run-contexts/pages/RunContextsPage';
import type { RunsPageSectionId } from '../shared/utils/runsNavigation';

const SECTION_COPY: Record<RunsPageSectionId, { title: string; description: string }> = {
  'sequence-runs': {
    title: 'Sequence Runs',
    description: 'Monitor instrument runs and sequencing run status.',
  },
  'workflow-runs': {
    title: 'Workflow Runs',
    description: 'Monitor workflow executions, run states, and related operational metadata.',
  },
  'analysis-runs': {
    title: 'Analysis Runs',
    description: 'Monitor analysis runs, their states, and linked workflow activity.',
  },
  'workflow-types': {
    title: 'Workflow Types',
    description: 'Browse workflow definitions, versions, engines, and validation states.',
  },
  'analysis-types': {
    title: 'Analysis Types',
    description: 'Browse analysis definitions, versions, descriptions, and active states.',
  },
  'analysis-contexts': {
    title: 'Analysis Contexts',
    description: 'Browse reusable analysis contexts, use cases, descriptions, and active states.',
  },
  'run-contexts': {
    title: 'Run Contexts',
    description: 'Browse reusable run contexts, use cases, descriptions, and active states.',
  },
};

interface RunsPageProps {
  section: RunsPageSectionId;
}

export function RunsPage({ section }: RunsPageProps) {
  const { title, description } = SECTION_COPY[section];

  return (
    <div className='p-6'>
      <div className='mb-6'>
        <h1 className='mb-1 text-2xl font-semibold text-neutral-900 dark:text-neutral-100'>
          {title}
        </h1>
        <p className='text-sm text-neutral-600 dark:text-neutral-400'>{description}</p>
      </div>

      {section === 'sequence-runs' && <SequenceRunsPage />}
      {section === 'workflow-runs' && <WorkflowRunsPage />}
      {section === 'analysis-runs' && <AnalysisRunsPage />}
      {section === 'workflow-types' && <WorkflowTypesPage />}
      {section === 'analysis-types' && <AnalysisTypesPage />}
      {section === 'analysis-contexts' && <AnalysisContextsPage />}
      {section === 'run-contexts' && <RunContextsPage />}
    </div>
  );
}
