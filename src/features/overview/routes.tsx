import { Navigate, type RouteObject } from 'react-router';

/** Alias for bookmarks; real overview is index `/` (lazy-loaded in the app router). */
const Routes: RouteObject = {
  path: '/overview',
  element: <Navigate to='/' replace />,
};

export default Routes;
