import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { GlobalSearchModalContent, getGlobalSearchGroups } from '../GlobalSearchModal';

describe('getGlobalSearchGroups', () => {
  it('returns grouped mock results for matching cases, labs, runs, and files', () => {
    const groups = getGlobalSearchGroups('L2400001');

    expect(groups.map((group) => group.label)).toContain('Labs');
    expect(
      groups.some((group) => group.items.some((item) => item.title.includes('L2400001')))
    ).toBe(true);
  });

  it('returns no populated groups for an empty query', () => {
    const groups = getGlobalSearchGroups('');

    expect(groups).toEqual([]);
  });
});

describe('GlobalSearchModalContent', () => {
  it('renders the empty search prompt before a query is entered', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <GlobalSearchModalContent query='' onQueryChange={vi.fn()} onClose={() => undefined} />
      </MemoryRouter>
    );

    expect(html).toContain('Start typing to search across cases, labs, runs, and files.');
  });

  it('renders grouped results for an initial query', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <GlobalSearchModalContent query='fastq' onQueryChange={vi.fn()} onClose={() => undefined} />
      </MemoryRouter>
    );

    expect(html).toContain('Files');
    expect(html).toContain('FASTQ');
  });
});
