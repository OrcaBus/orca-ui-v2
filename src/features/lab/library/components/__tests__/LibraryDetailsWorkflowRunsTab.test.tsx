import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { WorkflowTypeButton } from '../WorkflowTypeButton';

describe('WorkflowTypeButton', () => {
  it('renders as a compact, square-edged, left-aligned list item', () => {
    const html = renderToStaticMarkup(
      <WorkflowTypeButton isSelected label='oncoanalyser-wgts-rna' onClick={vi.fn()} />
    );

    expect(html).toContain('h-9');
    expect(html).toContain('justify-start');
    expect(html).toContain('rounded-none');
    expect(html).toContain('text-left');
  });
});
