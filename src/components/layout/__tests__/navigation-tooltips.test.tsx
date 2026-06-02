import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Activity, Briefcase } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar';
import { SecondarySidebar } from '../SecondarySidebar';
import { AppShellContext, type AppShellContextValue } from '../../../context/app-shell-context';

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

function renderWithAppShellContext(children: ReactNode, value: Partial<AppShellContextValue> = {}) {
  const contextValue: AppShellContextValue = {
    headerConfig: null,
    setHeaderConfig: vi.fn(),
    clearHeaderConfig: vi.fn(),
    secondarySidebarConfig: null,
    setSecondarySidebarConfig: vi.fn(),
    clearSecondarySidebarConfig: vi.fn(),
    secondarySidebarCollapsed: false,
    setSecondarySidebarCollapsed: vi.fn(),
    userSidebarCollapsed: true,
    isSidebarCollapsed: true,
    temporarySidebarCollapseRequestCount: 0,
    temporarySidebarCollapseExpandedOverride: false,
    toggleSidebar: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    requestTemporarySidebarCollapse: vi.fn(() => vi.fn()),
    ...value,
  };

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/runs/overview']}>
      <AppShellContext.Provider value={contextValue}>{children}</AppShellContext.Provider>
    </MemoryRouter>
  );
}

describe('collapsed navigation tooltips', () => {
  it('renders primary sidebar item labels as right-side tooltips when collapsed', () => {
    const markup = renderWithAppShellContext(<Sidebar />);

    expect(markup).toContain('data-slot="tooltip-content"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-show-arrow="false"');
    expect(markup).toContain('>Runs</span>');
  });

  it('renders secondary sidebar item labels as right-side tooltips when collapsed', () => {
    const markup = renderWithAppShellContext(<SecondarySidebar />, {
      secondarySidebarCollapsed: true,
      secondarySidebarConfig: {
        ariaLabel: 'Runs navigation',
        activeItemId: 'overview',
        items: [
          {
            id: 'overview',
            label: 'Overview',
            to: '/runs/overview',
            icon: Activity,
          },
        ],
        groups: [
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
        ],
      },
    });

    expect(markup).toContain('data-slot="tooltip-content"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-show-arrow="false"');
    expect(markup).toContain('>Overview</span>');
    expect(markup).toContain('>Cases</span>');
  });
});
