import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useCasesPageQueryParams } from '../useCasesPageQueryParams';

function CasesPageQueryParamsProbe() {
  const { isInfoDrawerOpen, search, caseTypeFilter } = useCasesPageQueryParams();

  return (
    <span>
      {String(isInfoDrawerOpen)}|{search}|{caseTypeFilter}
    </span>
  );
}

function renderProbe(initialEntry: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CasesPageQueryParamsProbe />
    </MemoryRouter>
  );
}

describe('useCasesPageQueryParams', () => {
  it('reads info=true while preserving cases list query params', () => {
    const html = renderProbe('/cases?info=true&search=REQ&caseType=wgts');

    expect(html).toContain('true|REQ|wgts');
  });

  it('keeps the info drawer closed when the info param is absent', () => {
    const html = renderProbe('/cases?search=REQ&caseType=wgts');

    expect(html).toContain('false|REQ|wgts');
  });
});
