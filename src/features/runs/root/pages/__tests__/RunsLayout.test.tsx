import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { AppShellProvider } from '@/context/AppShellProvider';
import { RunsLayout } from '../RunsLayout';

function renderRunsLayout(path = '/runs/workflow-types') {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <AppShellProvider>
        <Routes>
          <Route path='/runs' element={<RunsLayout />}>
            <Route path='overview' element={<div>Overview content</div>} />
            <Route path='workflow-types' element={<div>Workflow types content</div>} />
          </Route>
        </Routes>
      </AppShellProvider>
    </MemoryRouter>
  );
}

describe('RunsLayout', () => {
  it('keeps the runs content in an isolated scroll container', () => {
    const markup = renderRunsLayout();

    expect(markup).toContain('flex h-full min-h-0 min-w-0 overflow-hidden');
    expect(markup).toContain('min-h-0 min-w-0 flex-1 overflow-auto');
  });

  it('renders overview as an ungrouped mobile secondary navigation item', () => {
    const markup = renderRunsLayout('/runs/overview');

    expect(markup).toContain('Overview content');
    expect(markup).toContain('>Overview</span>');
    expect(markup.indexOf('>Overview</span>')).toBeLessThan(markup.indexOf('>Runs</span>'));
  });
});
