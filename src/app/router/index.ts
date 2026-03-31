import { lazy } from 'react';
import { createBrowserRouter } from 'react-router';
import { Root } from '@/components/layout/Root';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import authRoutes from '@/features/auth/routes';

import routeRegistry from './route-registry';

const OverviewPage = lazy(() =>
  import('@/features/overview/pages/OverviewPage').then((m) => ({ default: m.OverviewPage }))
);
const NotFoundPage = lazy(() =>
  import('@/features/errors/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

export const router = createBrowserRouter(
  [
    // Public routes — accessible without authentication
    authRoutes,

    // Protected routes — requires authenticated session
    {
      Component: ProtectedRoute,
      children: [
        {
          path: '/',
          Component: Root,
          children: [{ index: true, Component: OverviewPage }, ...routeRegistry],
        },
      ],
    },

    // Catch-all — unknown routes
    { path: '*', Component: NotFoundPage },
  ],
  { basename: '/v2' }
);
