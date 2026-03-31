import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const VaultPage = lazy(() => import('./pages/VaultPage').then((m) => ({ default: m.VaultPage })));

const Routes: RouteObject = {
  path: '/vault',
  element: <VaultPage />,
};

export default Routes;
