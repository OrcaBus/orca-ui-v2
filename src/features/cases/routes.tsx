import { lazy } from 'react';
import { Outlet, useParams, type RouteObject } from 'react-router';

const CasesPage = lazy(() => import('./pages/CasesPage').then((m) => ({ default: m.CasesPage })));
const CaseDetailPage = lazy(() =>
  import('./pages/CaseDetailPage').then((m) => ({ default: m.CaseDetailPage }))
);

function CaseDetailRoute() {
  const { caseOrcabusId } = useParams();
  return <CaseDetailPage key={caseOrcabusId} />;
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
      element: <CaseDetailRoute />,
    },
  ],
};

export default Routes;
