import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Input } from '../Input';

describe('Input', () => {
  it('uses a thin semantic focus ring', () => {
    const html = renderToStaticMarkup(<Input aria-label='Search' />);

    expect(html).toContain('focus-visible:border-ring');
    expect(html).toContain('focus-visible:ring-1');
    expect(html).toContain('focus-visible:ring-ring/40');
    expect(html).not.toContain('focus-visible:ring-[3px]');
  });
});
