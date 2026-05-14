import { lazy } from 'react';
import { Outlet, type RouteObject } from 'react-router';
import { useEnvironment } from '@/context/environment-context';

const ToolsPage = lazy(() => import('./pages/ToolsPage').then((m) => ({ default: m.ToolsPage })));
const SSCheckerPage = lazy(() =>
  import('./sschecker/pages/SSCheckerPage').then((m) => ({ default: m.SSCheckerPage }))
);
const MapListPage = lazy(() =>
  import('./system-catalog/pages/MapListPage').then((m) => ({
    default: m.MapListPage,
  }))
);
const SystemCatalogPage = lazy(() =>
  import('./system-catalog/pages/SystemCatalogPage').then((m) => ({
    default: m.SystemCatalogPage,
  }))
);

const UnderDevelopmentPage = lazy(() =>
  import('../errors/pages/UnderDevelopmentPage').then((m) => ({ default: m.UnderDevelopmentPage }))
);

export function SystemCatalogMapListRoute() {
  const { environment } = useEnvironment();

  if (environment !== 'prod') {
    return (
      <UnderDevelopmentPage
        featureName='System Catalog'
        devUrl='portal.dev.umccr.org/v2/tools/system-catalog'
      />
    );
  }

  return <MapListPage />;
}

const Routes: RouteObject = {
  path: '/tools',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <ToolsPage />,
    },
    {
      path: 'ss-check',
      element: <SSCheckerPage />,
    },
    {
      path: 'system-catalog',
      element: <Outlet />,
      children: [
        {
          index: true,
          element: <SystemCatalogMapListRoute />,
        },
        {
          path: ':mapId',
          element: <SystemCatalogPage />,
        },
      ],
    },
  ],
};

export default Routes;
