import { useCallback, useEffect, useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import {
  Bell,
  ChartNoAxesColumn,
  ChevronDown,
  ChevronUp,
  CirclePlay,
  Dna,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { getStatusFamily, FAMILY_DOT } from '@/components/ui/status-config';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { NOTIFICATIONS_LAST_VIEWED_AT_STORAGE_KEY } from '@/utils/storage-keys';
import { getRelativeTime } from '@/utils/timeFormat';
import {
  useRunNotifications,
  type RunNotification,
  type RunNotificationKind,
  type RunNotificationsResult,
  NOTIFICATION_LOOKBACK_DAYS,
  NOTIFICATION_PREVIEW_COUNT,
} from './useRunNotifications';

const KIND_META: Record<RunNotificationKind, { label: string; icon: LucideIcon }> = {
  'sequence-run': { label: 'Sequence run', icon: Dna },
  'analysis-run': { label: 'Analysis run', icon: ChartNoAxesColumn },
  'workflow-run': { label: 'Workflow run', icon: CirclePlay },
};

function toEpochMs(isoString: string | null): number {
  if (!isoString) return 0;
  const ms = new Date(isoString).getTime();
  return Number.isNaN(ms) ? 0 : ms;
}

function NotificationRow({
  notification,
  isUnread,
  onSelect,
}: {
  notification: RunNotification;
  isUnread: boolean;
  onSelect: (notification: RunNotification) => void;
}) {
  const { label, icon: Icon } = KIND_META[notification.kind];

  return (
    <MenuItem>
      <button
        type='button'
        onClick={() => onSelect(notification)}
        className='flex w-full items-start gap-2 rounded px-3 py-2 text-left text-[13px] text-slate-700 data-focus:bg-slate-100 dark:text-slate-300 dark:data-focus:bg-[#1e252e]'
      >
        <span
          className={`mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full ${FAMILY_DOT[getStatusFamily(notification.status)]}`}
          aria-hidden='true'
        />
        <div className='min-w-0 flex-1'>
          <div className='flex items-baseline gap-2'>
            <span className='truncate font-medium'>{notification.title}</span>
            {isUnread && (
              <span className='text-caption shrink-0 font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400'>
                New
              </span>
            )}
          </div>
          {notification.description && (
            <div className='text-muted-foreground truncate text-xs'>{notification.description}</div>
          )}
          <div className='text-caption text-muted-foreground mt-0.5 flex items-center gap-1.5'>
            <Icon className='h-3 w-3 shrink-0' aria-hidden='true' />
            <span>{label}</span>
            <span aria-hidden='true'>•</span>
            <span>{notification.status.toUpperCase()}</span>
            <span aria-hidden='true'>•</span>
            <span>{getRelativeTime(notification.occurredAt)}</span>
          </div>
        </div>
      </button>
    </MenuItem>
  );
}

export interface NotificationsPanelProps extends RunNotificationsResult {
  /** "Last viewed" stamp as of the moment this panel mounted. */
  unreadSinceMs: number;
  /** Called once per open, to advance the stored "last viewed" stamp. */
  onOpened: () => void;
}

/**
 * Panel body, rendered only while the menu is open — Headless UI mounts
 * `MenuItems` children on open and unmounts them on close, so this component's
 * mount *is* the open event: it stamps the feed as viewed and starts collapsed.
 */
export function NotificationsPanel({
  notifications,
  totalCount,
  isLoading,
  isError,
  unreadSinceMs,
  onOpened,
}: NotificationsPanelProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  // Snapshot the stamp before `onOpened` advances it, otherwise every row would
  // lose its "New" marker the instant the panel appeared.
  const [unreadBaselineMs] = useState(unreadSinceMs);

  useEffect(() => {
    onOpened();
  }, [onOpened]);

  const visibleNotifications = isExpanded
    ? notifications
    : notifications.slice(0, NOTIFICATION_PREVIEW_COUNT);
  const hiddenCount = notifications.length - visibleNotifications.length;
  const beyondFeedCount = totalCount - notifications.length;

  const hasNotifications = notifications.length > 0;

  return (
    <>
      <div className='flex items-baseline justify-between gap-2 px-3 py-2'>
        <span className='text-caption font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
          Failed runs (last {NOTIFICATION_LOOKBACK_DAYS} days)
        </span>
        {totalCount > 0 && (
          <span className='text-caption text-muted-foreground font-semibold'>{totalCount}</span>
        )}
      </div>

      {!hasNotifications && isLoading && (
        <div className='text-muted-foreground flex items-center gap-2 px-3 py-4 text-[13px]'>
          <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
          <span>Loading alerts…</span>
        </div>
      )}

      {!hasNotifications && !isLoading && isError && (
        <div className='text-muted-foreground px-3 py-4 text-[13px]'>
          Alerts could not be loaded right now.
        </div>
      )}

      {!hasNotifications && !isLoading && !isError && (
        <div className='text-muted-foreground px-3 py-4 text-[13px]'>
          No failed sequence, analysis, or workflow runs in the last {NOTIFICATION_LOOKBACK_DAYS}{' '}
          days.
        </div>
      )}

      {visibleNotifications.map((notification) => (
        <NotificationRow
          key={notification.id}
          notification={notification}
          isUnread={toEpochMs(notification.occurredAt) > unreadBaselineMs}
          onSelect={(selected) => void navigate(selected.href)}
        />
      ))}

      {notifications.length > NOTIFICATION_PREVIEW_COUNT && (
        <button
          type='button'
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className='flex w-full items-center justify-center gap-1.5 rounded border-t border-slate-100 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none dark:border-[#2d3540] dark:text-blue-400 dark:hover:bg-[#1e252e]'
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className='h-3.5 w-3.5' aria-hidden='true' />
            </>
          ) : (
            <>
              <span>More ({hiddenCount} more)</span>
              <ChevronDown className='h-3.5 w-3.5' aria-hidden='true' />
            </>
          )}
        </button>
      )}

      {isExpanded && beyondFeedCount > 0 && (
        <p className='text-muted-foreground px-3 py-2 text-xs'>
          Showing the {notifications.length} most recent of {totalCount} failed runs.
        </p>
      )}

      {hasNotifications && isError && (
        <p className='text-muted-foreground px-3 py-2 text-xs'>
          Some run types could not be loaded right now.
        </p>
      )}
    </>
  );
}

export function NotificationsMenu() {
  const runNotifications = useRunNotifications();
  const [lastViewedAt, setLastViewedAt] = useLocalStorage<string | null>(
    NOTIFICATIONS_LAST_VIEWED_AT_STORAGE_KEY,
    null,
    { legacyKey: 'workflow-notifications:last-viewed-at' }
  );

  const lastViewedMs = toEpochMs(lastViewedAt);
  const hasUnread = runNotifications.notifications.some(
    (notification) => toEpochMs(notification.occurredAt) > lastViewedMs
  );

  const markViewed = useCallback(() => {
    setLastViewedAt(new Date().toISOString());
  }, [setLastViewedAt]);

  return (
    <>
      <Menu as='div' className='relative'>
        <MenuButton
          className='relative cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[#1e252e]'
          aria-label={hasUnread ? 'Notifications, unread alerts' : 'Notifications'}
        >
          <Bell className='text-muted-foreground h-5 w-5' aria-hidden='true' />
          {hasUnread && (
            <div
              className='absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500'
              aria-hidden='true'
            />
          )}
        </MenuButton>
        <MenuItems
          anchor='bottom end'
          transition
          className='z-50 max-h-96 w-96 origin-top-right overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg transition duration-200 ease-out outline-none [--anchor-gap:--spacing(1)] data-closed:scale-95 data-closed:opacity-0 dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'
        >
          <NotificationsPanel
            {...runNotifications}
            unreadSinceMs={lastViewedMs}
            onOpened={markViewed}
          />
        </MenuItems>
      </Menu>
      <div className='hidden h-6 w-px bg-slate-200 sm:block dark:bg-[#2d3540]' />
    </>
  );
}
