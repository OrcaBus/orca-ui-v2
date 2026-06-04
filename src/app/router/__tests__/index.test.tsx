import { describe, expect, it, vi } from 'vitest';
import type { RouteObject } from 'react-router';

const { createBrowserRouterMock } = vi.hoisted(() => ({
  createBrowserRouterMock: vi.fn((routes: RouteObject[], options: unknown) => ({
    routes,
    options,
  })),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    createBrowserRouter: createBrowserRouterMock,
  };
});

vi.mock('@/components/auth/ProtectedRoute', () => ({
  ProtectedRoute: () => null,
}));

vi.mock('@/components/layout/Root', () => ({
  Root: () => null,
}));

vi.mock('@/features/auth/routes', () => ({
  default: { path: '/auth', element: null },
}));

describe('app router', () => {
  it('attaches a custom error element to the default protected Cases route', async () => {
    await import('../index');

    const routes = createBrowserRouterMock.mock.calls[0]?.[0];
    const protectedRoute = routes?.find((route) => route.children);
    const rootRoute = protectedRoute?.children?.find((route) => route.path === '/');
    const defaultCasesRoute = rootRoute?.children?.find((route) => route.index);

    expect(defaultCasesRoute?.errorElement).toBeDefined();
  });
});
