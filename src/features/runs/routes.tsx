import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router';

const RunsPage = lazy(() => import('./pages/RunsPage').then((m) => ({ default: m.RunsPage })));
const RunsLayout = lazy(() =>
  import('./pages/RunsLayout').then((m) => ({ default: m.RunsLayout }))
);
const OverviewPage = lazy(() =>
  import('./overview/pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const WorkflowRunPortalRedirect = lazy(() =>
  import('./pages/WorkflowRunPortalRedirect').then((m) => ({
    default: m.WorkflowRunPortalRedirect,
  }))
);
const WorkflowRunDetailsPage = lazy(() =>
  import('./workflow-runs/pages/WorkflowRunDetailsPage').then((m) => ({
    default: m.WorkflowRunDetailsPage,
  }))
);
const AnalysisRunDetailsPage = lazy(() =>
  import('./analysis-runs/pages/AnalysisRunDetailsPage').then((m) => ({
    default: m.AnalysisRunDetailsPage,
  }))
);
const SequenceRunDetailsPage = lazy(() =>
  import('./sequence-runs/pages/SequenceRunDetailsPage').then((m) => ({
    default: m.SequenceRunDetailsPage,
  }))
);

const Routes: RouteObject = {
  path: '/runs',
  element: <RunsLayout />,
  children: [
    {
      index: true,
      element: <Navigate to='overview' replace />,
    },
    {
      path: 'overview',
      element: <OverviewPage />,
    },
    // sequence runs and details
    {
      path: 'sequence-runs',
      element: <RunsPage section='sequence-runs' />,
    },
    {
      path: 'sequence-runs/:instrumentRunId',
      element: <SequenceRunDetailsPage />,
    },
    // workflows runs and details
    {
      path: 'workflow-runs',
      element: <RunsPage section='workflow-runs' />,
    },
    {
      path: 'workflow-runs/prid/:portalRunId',
      element: <WorkflowRunPortalRedirect />,
    },
    {
      path: 'workflow-runs/:workflowRunOrcabusId',
      element: <WorkflowRunDetailsPage />,
    },
    // analysis runs and details
    {
      path: 'analysis-runs',
      element: <RunsPage section='analysis-runs' />,
    },
    {
      path: 'analysis-runs/:analysisRunOrcabusId',
      element: <AnalysisRunDetailsPage />,
    },
    // workflow and analysis types and contexts
    {
      path: 'workflow-types',
      element: <RunsPage section='workflow-types' />,
    },
    {
      path: 'analysis-types',
      element: <RunsPage section='analysis-types' />,
    },
    {
      path: 'analysis-contexts',
      element: <RunsPage section='analysis-contexts' />,
    },
    {
      path: 'run-contexts',
      element: <RunsPage section='run-contexts' />,
    },
  ],
};

export default Routes;
