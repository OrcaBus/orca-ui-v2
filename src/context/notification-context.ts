import { createContext, useContext } from 'react';

export type NotificationWorkflowStatus = 'failed' | 'aborted';
export type NotificationItemType = 'workflow-run' | 'sequence-run' | 'case';

export interface NotificationItem {
  id: string;
  itemType: NotificationItemType;
  workflowRunId: string;
  title: string;
  workflowType: string;
  status: NotificationWorkflowStatus;
  occurredAt: string;
  href: string;
  isUnread: boolean;
}

export interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  hasUnread: boolean;
  latestViewedAt: string | null;
  markNotificationsViewed: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a <NotificationProvider>');
  }
  return ctx;
}
