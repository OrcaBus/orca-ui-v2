import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useDeploymentPulseQueryParams } from '../useDeploymentPulseQueryParams';

function PaginationProbe() {
  const { page, rowsPerPage, stackListQueryParams } = useDeploymentPulseQueryParams();

  return (
    <span>
      {page}|{rowsPerPage}|{JSON.stringify(stackListQueryParams)}
    </span>
  );
}

function SearchProbe() {
  const { search, activeFilterBadges } = useDeploymentPulseQueryParams();

  return (
    <span>
      {search}|{activeFilterBadges.map((badge) => `${badge.id}:${badge.label}`).join(',')}
    </span>
  );
}

function renderProbe(initialEntry: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>
      <PaginationProbe />
    </MemoryRouter>
  );
}

function renderSearchProbe(initialEntry: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>
      <SearchProbe />
    </MemoryRouter>
  );
}

describe('useDeploymentPulseQueryParams', () => {
  it('reads page and rowsPerPage from the URL for listStacks', () => {
    const html = renderProbe('/tools/deploy-status?page=3&rowsPerPage=50');

    expect(html).toContain('3|50|{&quot;page&quot;:3,&quot;rowsPerPage&quot;:50}');
  });

  it('uses shared pagination defaults when URL values are absent', () => {
    const html = renderProbe('/tools/deploy-status');

    expect(html).toContain('1|10|{&quot;page&quot;:1,&quot;rowsPerPage&quot;:10}');
  });

  it('maps the shared search param to the listStacks stackName filter', () => {
    const html = renderProbe('/tools/deploy-status?page=3&rowsPerPage=50&search=Alpha');

    expect(html).toContain(
      '3|50|{&quot;page&quot;:3,&quot;rowsPerPage&quot;:50,&quot;stackName&quot;:&quot;Alpha&quot;}'
    );
  });

  it('omits stackName and the search badge when the search param is empty', () => {
    expect(renderProbe('/tools/deploy-status?search=')).toContain(
      '1|10|{&quot;page&quot;:1,&quot;rowsPerPage&quot;:10}'
    );
    expect(renderSearchProbe('/tools/deploy-status')).toContain('<span>|</span>');
  });

  it('exposes an active search badge for the stack name filter', () => {
    const html = renderSearchProbe('/tools/deploy-status?search=Alpha');

    expect(html).toContain('Alpha|search:Stack name');
  });

  it.each([
    ['/tools/deploy-status?page=-2&rowsPerPage=50', '1|50'],
    ['/tools/deploy-status?page=2.5&rowsPerPage=50', '1|50'],
    ['/tools/deploy-status?page=3&rowsPerPage=17', '3|10'],
  ])('falls back safely for unsupported URL pagination in %s', (initialEntry, expected) => {
    const html = renderProbe(initialEntry);

    const [expectedPage, expectedRowsPerPage] = expected.split('|');
    expect(html).toContain(
      `${expected}|{&quot;page&quot;:${expectedPage},&quot;rowsPerPage&quot;:${expectedRowsPerPage}}`
    );
  });
});
