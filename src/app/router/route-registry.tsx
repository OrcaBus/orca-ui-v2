import overviewRoutes from '@/features/overview/routes';
import sequenceRoutes from '@/features/sequence/routes';
import casesRoutes from '@/features/cases/routes';
import labRoutes from '@/features/lab/routes';
import workflowsRoutes from '@/features/workflows/routes';
import vaultRoutes from '@/features/vault/routes';
import filesRoutes from '@/features/files/routes';
import toolsRoutes from '@/features/tools/routes';
import type { RouteObject } from 'react-router';

const routeRegistry: RouteObject[] = [
  overviewRoutes,
  sequenceRoutes,
  casesRoutes,
  labRoutes,
  workflowsRoutes,
  vaultRoutes,
  filesRoutes,
  toolsRoutes,
];

export default routeRegistry;
