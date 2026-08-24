import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { GlobalSearch } from '../global-search/GlobalSearch';

describe('GlobalSearch', () => {
  it('renders the compact header search trigger and divider', () => {
    const html = renderToStaticMarkup(<GlobalSearch />);

    expect(html).toContain('aria-label="Open global search"');
    expect(html).toContain('type="button"');
    expect(html).toContain('h-6 w-px');
  });
});
