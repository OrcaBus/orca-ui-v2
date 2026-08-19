import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { getRunsStatusIcon } from '../statusIcons';

describe('getRunsStatusIcon', () => {
  it.each([
    'draft',
    'submitted',
    'runnable',
    'starting',
    'started',
    'running',
    'succeeded',
    'failed',
    'aborted',
    'cancelled',
    'resolved',
    'deprecated',
  ])('renders a registry icon for %s', (status) => {
    expect(renderToStaticMarkup(getRunsStatusIcon(status))).toContain('<svg');
  });

  it('normalizes uppercase and alias values', () => {
    expect(renderToStaticMarkup(getRunsStatusIcon('CANCELED'))).toContain('<svg');
    expect(renderToStaticMarkup(getRunsStatusIcon('SUCCESS'))).toContain('<svg');
  });

  it('returns null for an unsupported status', () => {
    expect(getRunsStatusIcon('brand-new-state')).toBeNull();
  });
});
