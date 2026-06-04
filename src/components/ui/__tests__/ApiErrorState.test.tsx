import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApiErrorState } from '../ApiErrorState';

describe('ApiErrorState', () => {
  it('sanitizes backend HTML 404 responses into friendly service unavailable copy', () => {
    const html = renderToStaticMarkup(
      <ApiErrorState
        error={{
          status: 404,
          detail:
            '<!doctype html><html><head><title>Not Found</title></head><body><h1>Not Found</h1><p>The requested resource was not found on this server.</p></body></html>',
        }}
      />
    );

    expect(html).toContain('Service unavailable');
    expect(html).toContain('404');
    expect(html).not.toContain('doctype');
    expect(html).not.toContain('requested resource');
  });

  it('uses stable connection copy for fetch/network failures', () => {
    const html = renderToStaticMarkup(<ApiErrorState error={new Error('Failed to fetch')} />);

    expect(html).toContain('Connection failed');
    expect(html).toContain('Unable to reach the server');
    expect(html).not.toContain('Failed to fetch');
  });

  it('renders access denied copy and status for authorization failures', () => {
    const html = renderToStaticMarkup(
      <ApiErrorState error={{ status: 403, message: 'Forbidden' }} />
    );

    expect(html).toContain('Access denied');
    expect(html).toContain('403');
  });
});
