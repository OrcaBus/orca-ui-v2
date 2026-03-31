import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const FilesPage = lazy(() => import('./pages/FilesPage').then((m) => ({ default: m.FilesPage })));

const Routes: RouteObject = {
  path: '/files',
  element: <FilesPage />,
};

export default Routes;
