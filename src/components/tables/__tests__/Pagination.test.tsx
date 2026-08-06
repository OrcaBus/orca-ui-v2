import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from '../Pagination';

const paginationProps = {
  currentPage: 1,
  totalPages: 2,
  pageSize: 10,
  totalItems: 20,
  onPageChange: vi.fn(),
  onPageSizeChange: vi.fn(),
};

describe('Pagination', () => {
  it('associates each rows-per-page label with a unique select', () => {
    const html = renderToStaticMarkup(
      <>
        <Pagination {...paginationProps} />
        <Pagination {...paginationProps} />
      </>
    );

    const selectIds = [...html.matchAll(/<select id="([^"]+)"/g)].map((match) => match[1]);
    const labelTargets = [...html.matchAll(/<label for="([^"]+)"/g)].map((match) => match[1]);

    expect(selectIds).toHaveLength(2);
    expect(new Set(selectIds).size).toBe(2);
    expect(labelTargets).toEqual(selectIds);
  });
});
