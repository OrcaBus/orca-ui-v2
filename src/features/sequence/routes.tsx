import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';

const SequencePage = lazy(() =>
  import('./pages/SequencePage').then((m) => ({ default: m.SequencePage }))
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
      element: <SequencePage />,
    },
    {
      path: ':runId',
      element: <SequenceRunDetailsPage />,
    },
  ],
};

export default Routes;
