import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { statusConfig } from '@/components/ui/status-config';
import { getRunsStatusIcon } from '../statusIcons';

function renderedPathData(markup: string) {
  return [...markup.matchAll(/<path[^>]*d="([^"]+)"/g)].map((match) => match[1]).join('|');
}

describe('getRunsStatusIcon', () => {
  it.each([
    ['draft', 'draft'],
    ['submitted', 'submitted'],
    ['runnable', 'runnable'],
    ['starting', 'starting'],
    ['started', 'started'],
    ['running', 'running'],
    ['succeeded', 'succeeded'],
    ['failed', 'failed'],
    ['aborted', 'aborted'],
    ['cancelled', 'cancelled'],
    ['resolved', 'resolved'],
    ['deprecated', 'deprecated'],
  ])('renders the registry icon for %s', (status, canonicalStatus) => {
    const ExpectedIcon = statusConfig[canonicalStatus as keyof typeof statusConfig].icon;
    expect(renderedPathData(renderToStaticMarkup(getRunsStatusIcon(status)))).toBe(
      renderedPathData(renderToStaticMarkup(<ExpectedIcon />))
    );
  });

  it.each([
    ['CANCELED', 'cancelled'],
    ['SUCCESS', 'succeeded'],
  ])('normalizes %s to the registry icon for %s', (status, canonicalStatus) => {
    const ExpectedIcon = statusConfig[canonicalStatus as keyof typeof statusConfig].icon;
    expect(renderedPathData(renderToStaticMarkup(getRunsStatusIcon(status)))).toBe(
      renderedPathData(renderToStaticMarkup(<ExpectedIcon />))
    );
  });

  it('returns null for an unsupported status', () => {
    expect(getRunsStatusIcon('brand-new-state')).toBeNull();
  });
});
