import { SequenceRunsPage } from '../../sequence-runs/pages/SequenceRunsPage';
import { WorkflowRunsPage } from '../../workflow-runs/pages/WorkflowRunsPage';
import { AnalysisRunsPage } from '../../analysis-runs/pages/AnalysisRunsPage';
import { WorkflowTypesPage } from '../../workflow-types/pages/WorkflowTypesPage';
import { AnalysisTypesPage } from '../../analysis-types/pages/AnalysisTypesPage';
import { AnalysisContextsPage } from '../../analysis-contexts/pages/AnalysisContextsPage';
import { RunContextsPage } from '../../run-contexts/pages/RunContextsPage';
import type { RunsPageSectionId } from '../utils/runsNavigation';

interface RunsPageProps {
  section: RunsPageSectionId;
}

export function RunsPage({ section }: RunsPageProps) {
  return (
    <div className='p-6'>
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
