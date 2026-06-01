import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { SidebarProvider } from '@/components/layout/SidebarProvider';
import { RunsLayout } from '../RunsLayout';

function renderRunsLayout(path = '/runs/workflow-types') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <SidebarProvider>
        <Routes>
          <Route path='/runs' element={<RunsLayout />}>
            <Route path='overview' element={<div>Overview content</div>} />
            <Route path='workflow-types' element={<div>Workflow types content</div>} />
          </Route>
        </Routes>
      </SidebarProvider>
    </MemoryRouter>
  );
}

describe('RunsLayout', () => {
  it('keeps the secondary sidebar fixed while the workflow content scrolls', () => {
    const markup = renderRunsLayout();

    expect(markup).toContain('flex h-full min-h-0 min-w-0 overflow-hidden');
    expect(markup).toContain('h-full min-h-0');
    expect(markup).toContain('min-h-0 min-w-0 flex-1 overflow-auto');
  });

  it('renders overview as an ungrouped secondary navigation item', () => {
    const markup = renderRunsLayout('/runs/overview');

    expect(markup).toContain('Overview content');
    expect(markup).toContain('>Overview</span>');
    expect(markup.indexOf('>Overview</span>')).toBeLessThan(markup.indexOf('>Runs</h5>'));
  });
});
