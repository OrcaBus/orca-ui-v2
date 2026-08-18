import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Activity } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';
import { EnvironmentContext } from '@/context/environment-context';
import { AppShellContext, type AppShellContextValue } from '../../../context/app-shell-context';
import type { AppShellHeaderConfig } from '../../../context/app-shell-context';
import type { SecondarySidebarGroup, SecondarySidebarItem } from '../SecondarySidebar';
import { Root } from '../Root';

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <span data-slot='tooltip'>{children}</span>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => (
    <span data-slot='tooltip-trigger'>{children}</span>
  ),
  TooltipContent: ({ children }: { children: ReactNode }) => (
    <span data-slot='tooltip-content'>{children}</span>
  ),
}));

// UserMenu now keeps its modals mounted, so ThemeSettingsModal's useTheme() runs
// even while closed. These layout tests don't exercise theming.
vi.mock('@/context/theme-context', () => ({
  useTheme: () => ({ theme: 'system', setTheme: vi.fn() }),
}));

const authValue: AuthContextValue = {
  isAuthenticated: true,
  user: { name: 'Ray Liu', email: 'ray@example.com' },
  groups: [],
  isLoading: false,
  signInWithGoogle: vi.fn(() => Promise.resolve(undefined)),
  logout: vi.fn(() => Promise.resolve(undefined)),
};

function renderRoot({
  headerConfig,
  secondarySidebarItems,
  secondarySidebarGroups,
}: {
  headerConfig: AppShellHeaderConfig;
  secondarySidebarItems?: SecondarySidebarItem[];
  secondarySidebarGroups?: SecondarySidebarGroup[];
}) {
  const contextValue: AppShellContextValue = {
    headerConfig,
    setHeaderConfig: vi.fn(),
    clearHeaderConfig: vi.fn(),
    secondarySidebarConfig: secondarySidebarGroups
      ? {
          ariaLabel: 'Runs navigation',
          activeItemId: secondarySidebarItems?.[0]?.id ?? 'overview',
          items: secondarySidebarItems,
          groups: secondarySidebarGroups,
        }
      : null,
    setSecondarySidebarConfig: vi.fn(),
    clearSecondarySidebarConfig: vi.fn(),
    secondarySidebarCollapsed: false,
    setSecondarySidebarCollapsed: vi.fn(),
    userSidebarCollapsed: false,
    isSidebarCollapsed: false,
    temporarySidebarCollapseRequestCount: 0,
    temporarySidebarCollapseExpandedOverride: false,
    toggleSidebar: vi.fn(),
    setSidebarCollapsed: vi.fn(),
    requestTemporarySidebarCollapse: vi.fn(() => vi.fn()),
  };

  return renderToStaticMarkup(
    <MemoryRouter initialEntries={['/runs/overview']}>
      <AuthContext.Provider value={authValue}>
        <EnvironmentContext.Provider value={{ environment: 'dev', label: 'Dev' }}>
          <AppShellContext.Provider value={contextValue}>
            <Routes>
              <Route element={<Root />}>
                <Route path='*' element={<div data-testid='page-content'>Runs page content</div>} />
              </Route>
            </Routes>
          </AppShellContext.Provider>
        </EnvironmentContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('Root', () => {
  it('renders the secondary sidebar beside the primary sidebar before page content', () => {
    const html = renderRoot({
      headerConfig: { mode: 'main', title: 'Runs', icon: <Activity className='h-6 w-6' /> },
      secondarySidebarItems: [
        { id: 'overview', label: 'Overview', to: '/runs/overview', icon: Activity },
      ],
      secondarySidebarGroups: [
        {
          label: 'Runs',
          items: [
            {
              id: 'sequence-runs',
              label: 'Sequence Runs',
              to: '/runs/sequence-runs',
              icon: Activity,
            },
          ],
        },
      ],
    });

    expect(html).toContain('Orcabus');
    expect(html).toContain('aria-label="Runs navigation"');
    expect(html).toContain('Runs page content');
    expect(html.indexOf('Orcabus')).toBeLessThan(html.indexOf('aria-label="Runs navigation"'));
    expect(html.indexOf('aria-label="Runs navigation"')).toBeLessThan(
      html.indexOf('Runs page content')
    );
  });
});
