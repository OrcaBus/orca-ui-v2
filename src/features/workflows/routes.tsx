import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const WorkflowsPage = lazy(() =>
  import('./pages/WorkflowsPage').then((m) => ({ default: m.WorkflowsPage }))
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

const Routes: RouteObject = {
  path: '/workflows',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <WorkflowsPage />,
    },
    {
      path: ':tab',
      element: <WorkflowsPage />,
    },
    {
      path: 'workflow-runs/prid/:portalRunId',
      element: <WorkflowRunPortalRedirect />,
    },
    {
      path: 'workflow-runs/:workflowRunOrcabusId',
      element: <WorkflowRunDetailsPage />,
    },
    {
      path: 'analysis-runs/:analysisRunOrcabusId',
      element: <AnalysisRunDetailsPage />,
    },
  ],
};

export default Routes;
