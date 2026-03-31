import { lazy } from 'react';
import type { RouteObject } from 'react-router';

const SignInPage = lazy(() =>
  import('./pages/SignInPage').then((m) => ({ default: m.SignInPage }))
);

const Routes: RouteObject = {
  path: '/auth',
  children: [
    { index: true, element: <SignInPage /> },
    { path: 'signin', element: <SignInPage /> },
  ],
};

export default Routes;
