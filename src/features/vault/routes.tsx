import { lazy } from 'react';
import type { RouteObject } from 'react-router';
import { useEnvironment } from '@/context/environment-context';

const VaultPage = lazy(() => import('./pages/VaultPage').then((m) => ({ default: m.VaultPage })));
const UnderDevelopmentPage = lazy(() =>
  import('../errors/pages/UnderDevelopmentPage').then((m) => ({ default: m.UnderDevelopmentPage }))
);

export function VaultRoute() {
  const { environment } = useEnvironment();

  if (environment !== 'prod') {
    return <UnderDevelopmentPage featureName='Vault' devUrl='portal.dev.umccr.org/v2/vault' />;
  }

  return <VaultPage />;
}

const Routes: RouteObject = {
  path: '/vault',
  element: <VaultRoute />,
};

export default Routes;
