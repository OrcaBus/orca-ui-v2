import { lazy } from 'react';
import { Outlet, useParams, type RouteObject } from 'react-router';

const CasesPage = lazy(() => import('./pages/CasesPage').then((m) => ({ default: m.CasesPage })));
const CaseDetailsPage = lazy(() =>
  import('./pages/CaseDetailsPage').then((m) => ({ default: m.CaseDetailsPage }))
);

function CaseDetailsRoute() {
  const { caseOrcabusId } = useParams();
  return <CaseDetailsPage key={caseOrcabusId} />;
}

const Routes: RouteObject = {
  path: '/cases',
  element: <Outlet />,
  children: [
    {
      index: true,
      element: <CasesPage />,
    },
    {
      path: ':caseOrcabusId',
      element: <CaseDetailsRoute />,
    },
  ],
};

export default Routes;
