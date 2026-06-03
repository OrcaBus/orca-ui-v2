import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { OverviewStatsStrip } from '../OverviewStatsStrip';
import { buildOverviewStats } from '../../utils/overviewStatsConfig';

describe('OverviewStatsStrip', () => {
  it('renders the overall failed rate stat', () => {
    const html = renderToStaticMarkup(
      <OverviewStatsStrip
        stats={buildOverviewStats({
          activeSequenceRuns: 2,
          activeWorkflowRuns: 3,
          sequenceTotal: 10,
          workflowTotal: 5,
          totalRuns: 15,
          sequenceSucceeded: 7,
          workflowSucceeded: 2,
          totalSucceeded: 9,
          sequenceFailed: 1,
          workflowFailed: 2,
          totalFailed: 3,
          successRate: 75,
          failedRate: 10,
        })}
      />
    );

    expect(html).toContain('Overall Failed Rate');
    expect(html).toContain('10%');
    expect(html).toContain('9 / 15 succeeded');
    expect(html).toContain('7 / 10');
    expect(html).toContain('2 / 5');
    expect(html).toContain('3 / 15 failed');
    expect(html).toContain('1 / 10');
    expect(html).not.toContain('Failed in Last 24h');
  });

  it('renders stat loading placeholders', () => {
    const html = renderToStaticMarkup(<OverviewStatsStrip stats={[]} isLoading />);

    expect(html).toContain('react-loading-skeleton');
  });

  it('renders an API error state', () => {
    const html = renderToStaticMarkup(
      <OverviewStatsStrip stats={[]} error={new Error('Could not load overview stats')} />
    );

    expect(html).toContain('Could not load overview stats');
  });
});
