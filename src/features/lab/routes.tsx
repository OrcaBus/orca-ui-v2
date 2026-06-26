import { lazy } from 'react';
import { Navigate, Outlet, type RouteObject } from 'react-router';

const LabPage = lazy(() => import('./root/pages/LabPage').then((m) => ({ default: m.LabPage })));
const LibraryDetailsPage = lazy(() =>
  import('./library/pages/LibraryDetailsPage').then((m) => ({ default: m.LibraryDetailsPage }))
);
const LibraryIdRedirect = lazy(() =>
  import('./library/pages/LibraryIdRedirect').then((m) => ({ default: m.LibraryIdRedirect }))
);

const Routes: RouteObject = {
  path: '/lab',
  element: <Outlet />,
  children: [
    // The default route for /lab will render the LabPage component.
    {
      index: true,
      element: <LabPage />,
    },
    {
      path: 'library',
      element: <Navigate to='/lab' replace />,
    },
    {
      path: 'subject',
      element: <LabPage />,
    },
    {
      path: 'individual',
      element: <LabPage />,
    },
    {
      path: 'sample',
      element: <LabPage />,
    },
    {
      path: 'project',
      element: <LabPage />,
    },
    // The following routes handle library details and redirection based on library ID or ORCABUS ID.
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
