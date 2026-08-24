import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { Menu, MenuItems } from '@headlessui/react';
import { describe, expect, it, vi } from 'vitest';
import { NotificationsPanel, type NotificationsPanelProps } from '../NotificationsMenu';
import { NOTIFICATION_PREVIEW_COUNT, type RunNotification } from '../useRunNotifications';

function buildNotification(overrides: Partial<RunNotification> = {}): RunNotification {
  return {
    id: 'workflow-run:wfr.01',
    kind: 'workflow-run',
    title: 'tumor-normal L2400001',
    description: 'tumor-normal · 20240101abcd0001',
    status: 'FAILED',
    occurredAt: '2026-08-24T01:00:00Z',
    href: '/runs/workflow-runs/wfr.01',
    ...overrides,
  };
}

function buildFeed(count: number): RunNotification[] {
  return Array.from({ length: count }, (_, index) =>
    buildNotification({
      id: `workflow-run:wfr.${index}`,
      title: `failed-run-${index}`,
      href: `/runs/workflow-runs/wfr.${index}`,
    })
  );
}

function render(props: Partial<NotificationsPanelProps> = {}) {
  // Rows are Headless UI `MenuItem`s, so the panel needs its menu ancestry;
  // `static` renders the open panel without driving the button.
  return renderToStaticMarkup(
    <MemoryRouter>
      <Menu>
        <MenuItems static>
          <NotificationsPanel
            notifications={[]}
            totalCount={0}
            isLoading={false}
            isError={false}
            unreadSinceMs={0}
            onOpened={vi.fn()}
            {...props}
          />
        </MenuItems>
      </Menu>
    </MemoryRouter>
  );
}

describe('NotificationsPanel', () => {
  it('renders the empty state when nothing failed in the window', () => {
    const html = render();

    expect(html).toContain('No failed sequence, analysis, or workflow runs in the last 30 days.');
  });

  it('renders a loading state before the first response arrives', () => {
    const html = render({ isLoading: true });

    expect(html).toContain('Loading alerts…');
  });

  it('renders an error state when every source failed to load', () => {
    const html = render({ isError: true });

    expect(html).toContain('Alerts could not be loaded right now.');
  });

  it('links each alert to its own run details page', () => {
    const html = render({
      notifications: [
        buildNotification(),
        buildNotification({
          id: 'sequence-run:seq.01',
          kind: 'sequence-run',
          title: '240101_A00130_0001_TEST',
          href: '/runs/sequence-runs/240101_A00130_0001_TEST',
        }),
        buildNotification({
          id: 'analysis-run:anr.01',
          kind: 'analysis-run',
          title: 'analysis-run-1',
          href: '/runs/analysis-runs/anr.01',
        }),
      ],
      totalCount: 3,
    });

    expect(html).toContain('tumor-normal L2400001');
    expect(html).toContain('Workflow run');
    expect(html).toContain('240101_A00130_0001_TEST');
    expect(html).toContain('Sequence run');
    expect(html).toContain('analysis-run-1');
    expect(html).toContain('Analysis run');
  });

  it(`lists only the ${NOTIFICATION_PREVIEW_COUNT} most recent alerts behind a more button`, () => {
    const notifications = buildFeed(NOTIFICATION_PREVIEW_COUNT + 4);
    const html = render({ notifications, totalCount: notifications.length });

    expect(html).toContain(`failed-run-${NOTIFICATION_PREVIEW_COUNT - 1}`);
    expect(html).not.toContain(`failed-run-${NOTIFICATION_PREVIEW_COUNT}`);
    expect(html).toContain('More (4 more)');
  });

  it('omits the more button when the feed fits in the preview', () => {
    const notifications = buildFeed(NOTIFICATION_PREVIEW_COUNT);
    const html = render({ notifications, totalCount: notifications.length });

    expect(html).not.toContain('More (');
  });

  it('marks alerts newer than the last-viewed stamp as new', () => {
    const notifications = [
      buildNotification({ id: 'a', occurredAt: '2026-08-24T01:00:00Z' }),
      buildNotification({ id: 'b', occurredAt: '2026-08-20T01:00:00Z' }),
    ];

    const html = render({
      notifications,
      totalCount: 2,
      unreadSinceMs: new Date('2026-08-22T00:00:00Z').getTime(),
    });

    expect(html.match(/>New</g)).toHaveLength(1);
  });

  it('marks nothing as new once the stamp is newer than every alert', () => {
    const html = render({
      notifications: [buildNotification({ occurredAt: '2026-08-20T01:00:00Z' })],
      totalCount: 1,
      unreadSinceMs: new Date('2026-08-24T00:00:00Z').getTime(),
    });

    expect(html).not.toContain('>New<');
  });
});
