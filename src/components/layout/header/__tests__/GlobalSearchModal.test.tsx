import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Briefcase, Dna } from 'lucide-react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GlobalSearchSection } from '../global-search/useGlobalSearch';

const mocks = vi.hoisted(() => ({
  sections: [] as GlobalSearchSection[],
}));

vi.mock('../global-search/useGlobalSearch', () => ({
  useGlobalSearch: () => mocks.sections,
}));

// The content debounces the query before searching; keep it synchronous under test.
vi.mock('@/hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

const { GlobalSearchModalContent } = await import('../global-search/GlobalSearchModal');

function buildSection(overrides: Partial<GlobalSearchSection> = {}): GlobalSearchSection {
  return {
    id: 'cases',
    label: 'Cases',
    icon: Briefcase,
    items: [
      {
        id: 'cas.01',
        title: 'RF-1001',
        description: 'ASPi2L · UR123456',
        href: '/cases/cas.01',
        badge: 'wgts',
      },
    ],
    totalCount: 1,
    hasMore: false,
    viewAllHref: '/cases?search=RF-1001',
    isLoading: false,
    isError: false,
    ...overrides,
  };
}

function render(query: string) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <GlobalSearchModalContent query={query} onQueryChange={vi.fn()} onClose={() => undefined} />
    </MemoryRouter>
  );
}

describe('GlobalSearchModalContent', () => {
  beforeEach(() => {
    mocks.sections = [];
  });

  it('renders the empty search prompt before a query is entered', () => {
    const html = render('');

    expect(html).toContain('Start typing to search across cases, lab libraries, and runs.');
  });

  it('renders API-backed results grouped by section', () => {
    mocks.sections = [buildSection()];

    const html = render('RF-1001');

    expect(html).toContain('Cases');
    expect(html).toContain('RF-1001');
    expect(html).toContain('/cases/cas.01');
  });

  it('omits sections that returned no matches', () => {
    mocks.sections = [
      buildSection(),
      buildSection({
        id: 'sequence-runs',
        label: 'Sequence Runs',
        icon: Dna,
        items: [],
        totalCount: 0,
        viewAllHref: '/runs/sequence-runs?search=RF-1001',
      }),
    ];

    const html = render('RF-1001');

    expect(html).toContain('Cases');
    expect(html).not.toContain('Sequence Runs');
  });

  it('links to the list page with the search param when more results exist', () => {
    mocks.sections = [
      buildSection({
        totalCount: 12,
        hasMore: true,
        viewAllHref: '/cases?search=RF',
      }),
    ];

    const html = render('RF');

    expect(html).toContain('/cases?search=RF');
    expect(html).toContain('More (11 more)');
  });

  it('does not offer a more link when everything already fits', () => {
    mocks.sections = [buildSection()];

    const html = render('RF-1001');

    expect(html).not.toContain('More (');
  });

  it('reports when a query matched nothing', () => {
    mocks.sections = [buildSection({ items: [], totalCount: 0 })];

    const html = render('nothing-matches');

    expect(html).toContain('No results found for &quot;nothing-matches&quot;.');
  });

  it('shows a loading state while sections are still fetching', () => {
    mocks.sections = [buildSection({ items: [], totalCount: 0, isLoading: true })];

    const html = render('RF');

    expect(html).toContain('Searching...');
  });
});
