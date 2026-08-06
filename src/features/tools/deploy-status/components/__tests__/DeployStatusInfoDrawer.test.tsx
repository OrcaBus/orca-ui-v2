import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { DeployStatusInfoDrawer } from '../DeployStatusInfoDrawer';

vi.mock('@/components/modals/DrawerFrame', () => ({
  DrawerFrame: ({ title, children }: { title: ReactNode; children: ReactNode }) => (
    <aside>
      <h2>{title}</h2>
      {children}
    </aside>
  ),
}));

describe('DeployStatusInfoDrawer', () => {
  it('explains the service data flow and how to inspect a stack', () => {
    const html = renderToStaticMarkup(<DeployStatusInfoDrawer isOpen={true} onClose={vi.fn()} />);

    expect(html).toContain('Deployment Pulse');
    expect(html).toContain('CloudFormation');
    expect(html).toContain('EventBridge');
    expect(html).toContain('select a stack');
  });
});
