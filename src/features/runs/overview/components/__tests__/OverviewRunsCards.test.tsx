import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { OverviewSequenceRunsCard } from '../OverviewSequenceRunsCard';
import { OverviewWorkflowRunsCard } from '../OverviewWorkflowRunsCard';

describe('OverviewSequenceRunsCard', () => {
  it('renders the required columns and links', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewSequenceRunsCard
          runs={[
            {
              id: 'seq.001',
              sequenceRunId: 'SR-001',
              instrumentRunId: 'INST-001',
              status: 'STARTED',
              startTime: '2026-06-01T00:00:00Z',
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(html).toContain('href="/runs/sequence-runs/"');
    expect(html).toContain('href="/runs/sequence-runs/INST-001"');
    expect(html).toContain('Sequence Run ID');
    expect(html).toContain('Status');
    expect(html).toContain('Start time');
    expect(html).not.toContain('Libraries');
  });

  it('renders empty, loading, and error states', () => {
    const emptyHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewSequenceRunsCard runs={[]} />
      </MemoryRouter>
    );
    const loadingHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewSequenceRunsCard runs={[]} isLoading />
      </MemoryRouter>
    );
    const errorHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewSequenceRunsCard runs={[]} error={new Error('Sequence API failed')} />
      </MemoryRouter>
    );

    expect(emptyHtml).toContain('No recent sequence runs');
    expect(loadingHtml).toContain('Loading recent sequence runs');
    expect(errorHtml).toContain('Sequence API failed');
  });
});

describe('OverviewWorkflowRunsCard', () => {
  it('renders the required columns and links', () => {
    const html = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewWorkflowRunsCard
          runs={[
            {
              id: 'wfr.001',
              runName: 'Workflow Run 001',
              status: 'SUCCEEDED',
              startTime: '2026-06-01T01:00:00Z',
            },
          ]}
        />
      </MemoryRouter>
    );

    expect(html).toContain('href="/runs/workflow-runs/"');
    expect(html).toContain('href="/runs/workflow-runs/wfr.001"');
    expect(html).toContain('Run Name');
    expect(html).toContain('Status');
    expect(html).toContain('Start time');
    expect(html).not.toContain('Workflow Type');
  });

  it('renders empty, loading, and error states', () => {
    const emptyHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewWorkflowRunsCard runs={[]} />
      </MemoryRouter>
    );
    const loadingHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewWorkflowRunsCard runs={[]} isLoading />
      </MemoryRouter>
    );
    const errorHtml = renderToStaticMarkup(
      <MemoryRouter>
        <OverviewWorkflowRunsCard runs={[]} error={new Error('Workflow API failed')} />
      </MemoryRouter>
    );

    expect(emptyHtml).toContain('No recent workflow runs');
    expect(loadingHtml).toContain('Loading recent workflow runs');
    expect(errorHtml).toContain('Workflow API failed');
  });
});
