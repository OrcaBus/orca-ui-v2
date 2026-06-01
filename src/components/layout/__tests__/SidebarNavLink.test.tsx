import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Activity } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { SidebarNavLink } from '../SidebarNavLink';

vi.mock('@/components/ui/Tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <span data-slot='tooltip'>{children}</span>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => (
    <span data-slot='tooltip-trigger'>{children}</span>
  ),
  TooltipContent: ({
    children,
    showArrow,
    side,
  }: {
    children: ReactNode;
    showArrow?: boolean;
    side?: 'top' | 'right' | 'bottom' | 'left';
  }) => (
    <span data-slot='tooltip-content' data-side={side} data-show-arrow={String(showArrow)}>
      {children}
    </span>
  ),
}));

function renderLink(ui: ReactNode) {
  return renderToStaticMarkup(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SidebarNavLink', () => {
  it('renders an expanded primary nav link with optional sublabel', () => {
    const markup = renderLink(
      <SidebarNavLink
        to='/runs'
        label='Runs'
        sublabel='Workflow activity'
        icon={Activity}
        active
        collapsed={false}
      />
    );

    expect(markup).toContain('href="/runs"');
    expect(markup).toContain('aria-current="page"');
    expect(markup).not.toContain('aria-label="Runs"');
    expect(markup).toContain('>Runs</div>');
    expect(markup).toContain('>Workflow activity</div>');
  });

  it('renders a collapsed secondary nav link with a tooltip label', () => {
    const markup = renderLink(
      <SidebarNavLink
        to='/runs/overview'
        label='Overview'
        icon={Activity}
        active={false}
        collapsed
        variant='secondary'
      />
    );

    expect(markup).toContain('href="/runs/overview"');
    expect(markup).toContain('aria-label="Overview"');
    expect(markup).toContain('data-slot="tooltip-content"');
    expect(markup).toContain('data-side="right"');
    expect(markup).toContain('data-show-arrow="false"');
    expect(markup).toContain('justify-center');
    expect(markup).not.toContain('aria-current="page"');
  });

  it('renders mobile secondary nav links without collapsed tooltips', () => {
    const markup = renderLink(
      <SidebarNavLink
        to='/runs/overview'
        label='Overview'
        icon={Activity}
        active={false}
        collapsed={false}
        variant='secondaryMobile'
      />
    );

    expect(markup).toContain('h-8');
    expect(markup).toContain('>Overview</span>');
    expect(markup).not.toContain('data-slot="tooltip-content"');
  });
});
