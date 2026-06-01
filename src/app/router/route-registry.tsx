import casesRoutes from '@/features/cases/routes';
import labRoutes from '@/features/lab/routes';
import runsRoutes from '@/features/runs/routes';
import vaultRoutes from '@/features/vault/routes';
import filesRoutes from '@/features/files/routes';
import toolsRoutes from '@/features/tools/routes';
import type { RouteObject } from 'react-router';

const routeRegistry: RouteObject[] = [
  casesRoutes,
  labRoutes,
  runsRoutes,
  vaultRoutes,
  filesRoutes,
  toolsRoutes,
];

export default routeRegistry;
