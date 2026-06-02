import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Briefcase } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';
import {
  AppShellContext,
  type AppShellContextValue,
  type AppShellHeaderConfig,
} from '@/context/app-shell-context';
import { EnvironmentContext } from '@/context/environment-context';
import { Header } from '../Header';

const authValue: AuthContextValue = {
  isAuthenticated: true,
  user: { name: 'Ray Liu', email: 'ray@example.com' },
  isLoading: false,
  signInWithGoogle: vi.fn(() => Promise.resolve(undefined)),
  logout: vi.fn(() => Promise.resolve(undefined)),
};

function renderHeader(headerConfig: AppShellHeaderConfig) {
  const appShellValue: AppShellContextValue = {
    headerConfig,
    setHeaderConfig: vi.fn(),
    clearHeaderConfig: vi.fn(),
    secondarySidebarConfig: null,
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
    <MemoryRouter>
      <AuthContext.Provider value={authValue}>
        <EnvironmentContext.Provider value={{ environment: 'dev', label: 'Dev' }}>
          <AppShellContext.Provider value={appShellValue}>
            <Header />
          </AppShellContext.Provider>
        </EnvironmentContext.Provider>
      </AuthContext.Provider>
    </MemoryRouter>
  );
}

describe('Header', () => {
  it('renders a main page title with icon and info trigger', () => {
    const html = renderHeader({
      mode: 'main',
      title: 'Cases',
      icon: <Briefcase className='h-6 w-6' />,
      info: {
        label: 'info',
        onOpen: vi.fn(),
      },
    });

    expect(html).toContain('Cases');
    expect(html).toContain('aria-label="Open Cases information"');
    expect(html).toContain('>info</button>');
    expect(html).toContain('aria-label="Open global search"');
  });

  it('renders detail breadcrumbs without a detail title or info trigger', () => {
    const html = renderHeader({
      mode: 'detail',
      breadcrumbs: [{ label: 'Cases', href: '/cases' }, { label: 'REQ-001' }],
    });

    expect(html).not.toContain('Case Details');
    expect(html).toContain('href="/cases"');
    expect(html).toContain('REQ-001');
    expect(html).not.toContain('Open information');
  });
});
