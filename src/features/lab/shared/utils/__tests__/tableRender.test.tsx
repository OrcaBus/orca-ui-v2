// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import type { NavigateFunction } from 'react-router';
import { renderClickableId, renderStackedValues } from '../tableRender';

afterEach(cleanup);

describe('lab table renderers', () => {
  it('renders clickable identifiers without the default button height', () => {
    const navigate = vi.fn() as unknown as NavigateFunction;

    render(renderClickableId('L2600551', navigate, (id) => `/lab/libraries/${id}`));

    expect(screen.getByRole('button', { name: 'L2600551' }).className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-auto', 'min-h-0', 'p-0'])
    );
  });

  it('uses a compact rhythm for stacked Lab values', () => {
    render(renderStackedValues(['clinical']));

    const valueClasses = screen.getByText('clinical').className.split(/\s+/);
    expect(valueClasses).toContain('min-h-6');
    expect(valueClasses).not.toContain('min-h-7');
  });
});
