import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CasesPage } from '../CasesPage';

vi.mock('@/context/app-shell-context', () => ({
  useAppShellHeader: vi.fn(),
}));

vi.mock('@/components/tables/FilterBar', () => ({
  FilterBar: ({ searchPlaceholder }: { searchPlaceholder: string }) => (
    <div>{searchPlaceholder}</div>
  ),
}));

vi.mock('../../components', () => ({
  CasesListTable: () => null,
  CasesInfoDrawer: () => null,
}));

vi.mock('../../hooks/useCasesPageQueryParams', () => ({
  useCasesPageQueryParams: () => ({
    search: '',
    setSearchQuery: vi.fn(),
    caseTypeFilter: 'all',
    setCaseTypeFilter: vi.fn(),
    clearAllFilters: vi.fn(),
    isInfoDrawerOpen: false,
    openInfoDrawer: vi.fn(),
    closeInfoDrawer: vi.fn(),
  }),
}));

vi.mock('@/components/ui/Select', () => ({
  Select: ({ options }: { options: Array<{ label: ReactNode }> }) => (
    <div>{options.map(({ label }) => label)}</div>
  ),
}));

describe('CasesPage', () => {
  it('describes the backend-managed identifiers covered by search', () => {
    const html = renderToStaticMarkup(<CasesPage />);

    expect(html).toContain('Search request ID, alias, study, study ID, or UR number...');
  });
});
