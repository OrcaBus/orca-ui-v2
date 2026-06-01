import { describe, expect, it } from 'vitest';
import { resolveSidebarCollapsed } from '../sidebar-context';

describe('resolveSidebarCollapsed', () => {
  it('keeps the sidebar expanded when the user has not collapsed it and no feature requests collapse', () => {
    expect(resolveSidebarCollapsed(false, 0)).toBe(false);
  });

  it('collapses the sidebar when a feature has an active temporary request', () => {
    expect(resolveSidebarCollapsed(false, 1)).toBe(true);
    expect(resolveSidebarCollapsed(false, 2)).toBe(true);
  });

  it('keeps the sidebar collapsed when the user has manually collapsed it', () => {
    expect(resolveSidebarCollapsed(true, 0)).toBe(true);
  });

  it('restores the user preference after the last temporary request is removed', () => {
    expect(resolveSidebarCollapsed(false, 1)).toBe(true);
    expect(resolveSidebarCollapsed(false, 0)).toBe(false);
  });

  it('allows the user to temporarily expand while a feature collapse request is active', () => {
    expect(resolveSidebarCollapsed(false, 1, true)).toBe(false);
    expect(resolveSidebarCollapsed(true, 1, true)).toBe(false);
  });
});
