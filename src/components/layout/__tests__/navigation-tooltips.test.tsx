import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Activity, Briefcase } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { SecondarySidebar } from '../SecondarySidebar';
import { SidebarContext, type SidebarContextValue } from '../sidebar-context';

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <span data-slot='tooltip'>{children}</span>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => (
    <span data-slot='tooltip-trigger'>{children}</span>
  ),
  TooltipContent: ({
    children,
    showArrow,
    side,
  }: {
    children: ReactNode;
    showArrow?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
  }) => (
    <span data-slot='tooltip-content' data-side={side} data-show-arrow={String(showArrow)}>
      {children}
    </span>
  ),
}));

function renderWithSidebarContext(children: ReactNode, value: Partial<SidebarContextValue> = {}) {
  const contextValue: SidebarContextValue = {
    userCollapsed: true,
    isCollapsed: true,
    temporaryCollapseRequestCount: 0,
    temporaryCollapseExpandedOverride: false,
    toggleSidebar: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    requestTemporaryCollapse: vi.fn(() => vi.fn()),
    ...value,
  };

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/runs/overview']}>
      <SidebarContext.Provider value={contextValue}>{children}</SidebarContext.Provider>
    </MemoryRouter>
  );
}

describe('collapsed navigation tooltips', () => {
  it('renders primary sidebar item labels as right-side tooltips when collapsed', () => {
    const markup = renderWithSidebarContext(<Sidebar />);

    expect(markup).toContain('data-slot="tooltip-content"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-show-arrow="false"');
    expect(markup).toContain('>Runs</span>');
  });

  it('renders secondary sidebar item labels as right-side tooltips when collapsed', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/runs/overview']}>
        <SecondarySidebar
          ariaLabel='Runs navigation'
          collapsed
          activeItemId='overview'
          items={[
            {
              id: 'overview',
              label: 'Overview',
              to: '/runs/overview',
              icon: Activity,
            },
          ]}
          groups={[
            {
              label: 'Runs',
              items: [
                {
                  id: 'cases',
                  label: 'Cases',
                  to: '/',
                  icon: Briefcase,
                },
              ],
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(markup).toContain('data-slot="tooltip-content"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-show-arrow="false"');
    expect(markup).toContain('>Overview</span>');
    expect(markup).toContain('>Cases</span>');
  });
});
