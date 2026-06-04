import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { RouteErrorFallbackPage } from '../RouteErrorFallbackPage';

const routeState = vi.hoisted((): { error: unknown; navigate: ReturnType<typeof vi.fn> } => ({
  error: undefined,
  navigate: vi.fn(),
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>();
  return {
    ...actual,
    useNavigate: () => routeState.navigate,
    useRouteError: () => routeState.error,
  };
});

describe('RouteErrorFallbackPage', () => {
  it('renders sanitized page recovery UI for raw backend HTML errors', () => {
    routeState.error = new Error(
      '<!doctype html><html><head><title>Not Found</title></head><body><h1>Not Found</h1><p>The requested resource was not found on this server.</p></body></html>'
    );

    const html = renderToStaticMarkup(
      <MemoryRouter>
        <RouteErrorFallbackPage featureName='Cases' />
      </MemoryRouter>
    );

    expect(html).toContain('Unable to load Cases');
    expect(html).toContain('Service unavailable');
    expect(html).toContain('Reload page');
    expect(html).toContain('Cases');
    expect(html).not.toContain('doctype');
    expect(html).not.toContain('requested resource');
  });
});
