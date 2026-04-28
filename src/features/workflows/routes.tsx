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
const WorkflowRunDetailPage = lazy(() =>
  import('./workflow-runs/pages/WorkflowRunDetailPage').then((m) => ({
    default: m.WorkflowRunDetailPage,
  }))
);
const AnalysisRunDetailPage = lazy(() =>
  import('./analysis-runs/pages/AnalysisRunDetailPage').then((m) => ({
    default: m.AnalysisRunDetailPage,
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
      element: <WorkflowRunDetailPage />,
    },
    {
      path: 'analysis-runs/:analysisRunOrcabusId',
      element: <AnalysisRunDetailPage />,
    },
  ],
};

export default Routes;
