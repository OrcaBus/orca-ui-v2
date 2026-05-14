import { lazy } from 'react';
import { Outlet, useParams, type RouteObject } from 'react-router';
import { useEnvironment } from '@/context/environment-context';
import { useEnvironment } from '@/context/environment-context';

const CasesPage = lazy(() => import('./pages/CasesPage').then((m) => ({ default: m.CasesPage })));
const CaseDetailsPage = lazy(() =>
  import('./pages/CaseDetailsPage').then((m) => ({ default: m.CaseDetailsPage }))
);

function CaseDetailsRoute() {
  const { caseOrcabusId } = useParams();
  return <CaseDetailsPage key={caseOrcabusId} />;
}

const UnderDevelopmentPage = lazy(() =>
  import('../errors/pages/UnderDevelopmentPage').then((m) => ({ default: m.UnderDevelopmentPage }))
);

export function CaseRoute() {
  const { environment } = useEnvironment();

  if (environment !== 'dev') {
    return <UnderDevelopmentPage featureName='Cases' devUrl='portal.dev.umccr.org/v2/cases' />;
  }

  return <CasesPage />;
}

const Routes: RouteObject = {
  path: '/cases',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <CaseRoute />,
      element: <CaseRoute />,
    },
    {
      path: ':caseOrcabusId',
      element: <CaseDetailsRoute />,
    },
  ],
};

export default Routes;
