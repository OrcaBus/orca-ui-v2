// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AutoHideScrollArea } from '../AutoHideScrollArea';

describe('AutoHideScrollArea', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('reveals the scrollbar during scrolling and hides it after activity stops', () => {
    const onScroll = vi.fn();
    const { unmount } = render(
      <AutoHideScrollArea aria-label='Scrollable results' onScroll={onScroll}>
        <div>Results</div>
      </AutoHideScrollArea>
    );

    const scrollArea = screen.getByRole('region', { name: 'Scrollable results' });

    expect(scrollArea.classList.contains('scrollbar-thin')).toBe(true);
    expect(scrollArea.classList.contains('scrollbar-auto-hide')).toBe(true);
    expect(scrollArea.getAttribute('tabindex')).toBe('0');
    expect(scrollArea.hasAttribute('data-scrolling')).toBe(false);

    fireEvent.scroll(scrollArea);
    expect(onScroll).toHaveBeenCalledOnce();
    expect(scrollArea.getAttribute('data-scrolling')).toBe('true');

    vi.advanceTimersByTime(500);
    fireEvent.scroll(scrollArea);
    vi.advanceTimersByTime(799);
    expect(scrollArea.getAttribute('data-scrolling')).toBe('true');

    vi.advanceTimersByTime(1);
    expect(scrollArea.hasAttribute('data-scrolling')).toBe(false);

    fireEvent.scroll(scrollArea);
    expect(vi.getTimerCount()).toBe(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
