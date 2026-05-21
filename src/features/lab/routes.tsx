import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const LabPage = lazy(() => import('./pages/LabPage').then((m) => ({ default: m.LabPage })));
const LibraryDetailsPage = lazy(() =>
  import('./pages/LibraryDetailsPage').then((m) => ({ default: m.LibraryDetailsPage }))
);
const LibraryIdRedirect = lazy(() =>
  import('./pages/LibraryIdRedirect').then((m) => ({ default: m.LibraryIdRedirect }))
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
      path: 'libraries/:libraryOrcabusId',
      element: <LibraryDetailsPage />,
    },
    {
      path: 'libraries/libid/:libraryId',
      element: <LibraryIdRedirect />,
    },
  ],
};

export default Routes;
