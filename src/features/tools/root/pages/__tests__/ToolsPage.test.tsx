import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { ToolsPage } from '../ToolsPage';

vi.mock('@/context/app-shell-context', () => ({
  useAppShellHeader: vi.fn(),
}));

vi.mock('../../hooks/useToolsPageQueryParams', () => ({
  useToolsPageQueryParams: () => ({
    isInfoDrawerOpen: false,
    openInfoDrawer: vi.fn(),
    closeInfoDrawer: vi.fn(),
  }),
}));

vi.mock('../../components/ToolsInfoDrawer', () => ({
  ToolsInfoDrawer: () => null,
}));

describe('ToolsPage', () => {
  it('links to Deployment Pulse and describes its live operational data', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <ToolsPage />
      </MemoryRouter>
    );

    expect(html).toContain('Deployment Pulse');
    expect(html).toContain('/tools/deploy-status');
    expect(html).toContain(
      'Monitor CloudFormation deployment health, versions, and event history across OrcaBus services.'
    );
    expect(html).toContain('Some tools read live operational data');
    expect(html).not.toContain('No interaction with our systems data');
  });
});
