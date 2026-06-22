import { useParams, Navigate, Link } from 'react-router-dom';
import { useWorkflowRunListModel } from '../../shared/api/workflows.api';
import { SpinnerWithText } from '@/components/ui/Spinner';
import { ApiErrorState } from '@/components/ui/ApiErrorState';

/**
 * Resolves a portal run ID (used by external users) to the internal orcabusId
 * and redirects to the workflow run details page.
 *
 * External users should link to: /runs/workflow-runs/prid/:portalRunId
 * This page fetches the run by portalRunId and redirects to /runs/workflow-runs/:workflowRunOrcabusId
 */
export function WorkflowRunPortalRedirect() {
  const { portalRunId } = useParams<{ portalRunId: string }>();

  const { data, isLoading, isError, error, refetch } = useWorkflowRunListModel({
    params: {
      query: {
        page: 1,
        rows_per_page: 2, // 2 is enough — detect duplicates without over-fetching
        portal_run_id: portalRunId ?? undefined,
        ordering: '-timestamp', // latest first; when multiple matches, we show the first (latest)
      },
    },
    reactQuery: {
      enabled: !!portalRunId,
    },
  });

  if (!portalRunId) {
    return <Navigate to='/runs/workflow-runs' replace />;
  }

  if (isLoading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <SpinnerWithText text='Redirecting to workflow run...' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <ApiErrorState
          title='Unable to resolve workflow run'
          error={error}
          onRetry={() => void refetch()}
        />
      </div>
    );
  }

  if (!data?.results?.length) {
    return (
      <div className='flex h-screen flex-col items-center justify-center gap-2 text-gray-600 dark:text-gray-400'>
        <p>Workflow run not found for Portal Run ID: {portalRunId}</p>
        <Link to='/runs/workflow-runs' className='text-blue-600 hover:underline dark:text-blue-400'>
          Back to Workflow Runs
        </Link>
      </div>
    );
  }

  const results = data.results;
  const run = results[0];

  if (results.length > 1) {
    console.warn(
      `[WorkflowRunPortalRedirect] Multiple workflow runs found for Portal Run ID: ${portalRunId}. Showing latest run (orcabusId: ${run?.orcabusId}).`
    );
  }

  const orcabusId = run?.orcabusId;
  if (!orcabusId) {
    return (
      <div className='flex h-screen items-center justify-center text-gray-600 dark:text-gray-400'>
        Invalid workflow run data (missing orcabusId).
      </div>
    );
  }

  return <Navigate to={`/runs/workflow-runs/${orcabusId}`} replace />;
}

export default WorkflowRunPortalRedirect;
