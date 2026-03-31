import { useMemo, type ReactNode } from 'react';
import { mockWorkflowRuns } from '@/data/mockData';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  NotificationContext,
  type NotificationContextValue,
  type NotificationItem,
  type NotificationWorkflowStatus,
} from './notification-context';

const LAST_VIEWED_AT_STORAGE_KEY = 'workflow-notifications:last-viewed-at';
const LOOKBACK_WINDOW_MS = 48 * 60 * 60 * 1000;

function buildRecentFailureNotifications(now: Date): Omit<NotificationItem, 'isUnread'>[] {
  const cutoffMs = now.getTime() - LOOKBACK_WINDOW_MS;

  const notificationsFromMockData = mockWorkflowRuns
    .filter((run) => run.status === 'failed' || run.status === 'aborted')
    .map((run) => {
      const occurredAt = run.endTime ?? run.lastModified ?? run.startTime;
      const status = run.status as NotificationWorkflowStatus;
      return {
        id: `workflow-${run.id}`,
        itemType: 'workflow-run',
        workflowRunId: run.id,
        title: run.name,
        workflowType: run.workflowType,
        status,
        occurredAt,
        href: `/workflows/workflowrun/${run.id}`,
      } as const;
    })
    .filter((item) => new Date(item.occurredAt).getTime() >= cutoffMs);

  if (notificationsFromMockData.length > 0) {
    return notificationsFromMockData.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  }

  // Keep this context demo-ready even if bundled mock timestamps become old.
  return [
    {
      id: 'workflow-mock-failed-recent',
      itemType: 'workflow-run',
      workflowRunId: 'WF010',
      title: 'RNA-Seq Pipeline - Sample RNS-046',
      workflowType: 'RNA-Seq',
      status: 'failed',
      occurredAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      href: '/workflows/workflowrun/WF010',
    },
    {
      id: 'workflow-mock-aborted-recent',
      itemType: 'workflow-run',
      workflowRunId: 'WF008',
      title: 'Variant Calling - Sample NGS-003',
      workflowType: 'Variant Calling',
      status: 'aborted',
      occurredAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      href: '/workflows/workflowrun/WF008',
    },
  ];
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [latestViewedAt, setLatestViewedAt] = useLocalStorage<string | null>(
    LAST_VIEWED_AT_STORAGE_KEY,
    null
  );

  const value = useMemo<NotificationContextValue>(() => {
    const now = new Date();
    const latestViewedMs = latestViewedAt ? new Date(latestViewedAt).getTime() : 0;
    const notifications = buildRecentFailureNotifications(now).map((item) => {
      const occurredAtMs = new Date(item.occurredAt).getTime();
      return {
        ...item,
        isUnread: occurredAtMs > latestViewedMs,
      };
    });

    const unreadCount = notifications.filter((item) => item.isUnread).length;

    return {
      notifications,
      unreadCount,
      hasUnread: unreadCount > 0,
      latestViewedAt,
      markNotificationsViewed: () => {
        setLatestViewedAt(new Date().toISOString());
      },
    };
  }, [latestViewedAt, setLatestViewedAt]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
