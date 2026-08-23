// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { StatusBadge } from '../StatusBadge';

afterEach(cleanup);

describe('StatusBadge sizing', () => {
  it('keeps animated and static small statuses at the same fixed height', () => {
    render(
      <div>
        <StatusBadge status='started' showTooltip={false} />
        <StatusBadge status='succeeded' showTooltip={false} />
      </div>
    );

    const startedBadge = screen.getByText('Started');
    const succeededBadge = screen.getByText('Succeeded');
    const startedIconClasses = startedBadge
      .querySelector('svg')
      ?.getAttribute('class')
      ?.split(/\s+/);
    const succeededIconClasses = succeededBadge
      .querySelector('svg')
      ?.getAttribute('class')
      ?.split(/\s+/);

    expect(startedBadge.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-6', 'leading-none'])
    );
    expect(succeededBadge.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-6', 'leading-none'])
    );
    expect(startedIconClasses).toEqual(
      expect.arrayContaining(['h-3', 'w-3', 'motion-safe:animate-pulse'])
    );
    expect(succeededIconClasses).toEqual(expect.arrayContaining(['h-3', 'w-3']));
  });
});
