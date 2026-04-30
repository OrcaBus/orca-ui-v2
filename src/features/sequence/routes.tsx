import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const SequenceRunsPage = lazy(() =>
  import('./pages/SequenceRunsPage').then((m) => ({ default: m.SequenceRunsPage }))
);
const SequenceRunDetailsPage = lazy(() =>
  import('./pages/SequenceRunDetailsPage').then((m) => ({
    default: m.SequenceRunDetailsPage,
  }))
);

const Routes: RouteObject = {
  path: '/sequence',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <SequenceRunsPage />,
    },
    {
      path: 'instrument-runs/:instrumentRunId',
      element: <SequenceRunDetailsPage />,
    },
  ],
};

export default Routes;
