import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const LabPage = lazy(() => import('./pages/LabPage').then((m) => ({ default: m.LabPage })));
const LibraryDetailsPage = lazy(() =>
  import('./pages/LibraryDetailsPage').then((m) => ({ default: m.LibraryDetailsPage }))
);

const Routes: RouteObject = {
  path: '/lab',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <LabPage />,
    },
    {
      path: ':orcabusId',
      element: <LibraryDetailsPage />,
    },
  ],
};

export default Routes;
