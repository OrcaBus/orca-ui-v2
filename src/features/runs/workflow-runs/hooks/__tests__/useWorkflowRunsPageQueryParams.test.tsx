import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { useWorkflowRunsPageQueryParams } from '../useWorkflowRunsPageQueryParams';

function WorkflowRunsPageQueryParamsProbe() {
  const { isInfoDrawerOpen, search, status } = useWorkflowRunsPageQueryParams();

  return (
    <span>
      {String(isInfoDrawerOpen)}|{search}|{status}
    </span>
  );
}

function renderProbe(initialEntry: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[initialEntry]}>
      <WorkflowRunsPageQueryParamsProbe />
    </MemoryRouter>
  );
}

describe('useWorkflowRunsPageQueryParams', () => {
  it('reads info=true while preserving workflow runs list query params', () => {
    const html = renderProbe('/runs/workflow-runs?info=true&search=portal&wfStatus=failed');

    expect(html).toContain('true|portal|failed');
  });

  it('keeps the info drawer closed when the info param is absent', () => {
    const html = renderProbe('/runs/workflow-runs?search=portal&wfStatus=failed');

    expect(html).toContain('false|portal|failed');
  });
});
