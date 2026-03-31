import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })));
const SSCheckerPage = lazy(() =>
  import('./sschecker/pages/SSCheckerPage').then((m) => ({ default: m.SSCheckerPage }))
);
const WorkflowCatalogPage = lazy(() =>
  import('./workflow-catalog/pages/WorkflowCatalogPage').then((m) => ({
    default: m.WorkflowCatalogPage,
  }))
);

const Routes: RouteObject = {
  path: '/tools',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <ToolsPage />,
    },
    {
      path: 'sscheck',
      element: <SSCheckerPage />,
    },
    {
      path: 'workflow-catalog',
      element: <WorkflowCatalogPage />,
    },
  ],
};

export default Routes;
