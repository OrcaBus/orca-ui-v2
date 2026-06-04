import casesRoutes from '@/features/cases/routes';
import labRoutes from '@/features/lab/routes';
import runsRoutes from '@/features/runs/routes';
import vaultRoutes from '@/features/vault/routes';
import filesRoutes from '@/features/files/routes';
import toolsRoutes from '@/features/tools/routes';
import { RouteErrorFallbackPage } from '@/features/errors/pages/RouteErrorFallbackPage';
import type { RouteObject } from 'react-router';

const registeredRoutes: { route: RouteObject; featureName: string }[] = [
  { route: casesRoutes, featureName: 'Cases' },
  { route: labRoutes, featureName: 'Lab' },
  { route: runsRoutes, featureName: 'Runs' },
  { route: vaultRoutes, featureName: 'Vault' },
  { route: filesRoutes, featureName: 'Files' },
  { route: toolsRoutes, featureName: 'Tools' },
];

const routeRegistry: RouteObject[] = registeredRoutes.map(({ route, featureName }) => ({
  ...route,
  errorElement: <RouteErrorFallbackPage featureName={featureName} />,
}));

export default routeRegistry;
