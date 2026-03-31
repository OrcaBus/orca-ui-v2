import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useNotifications, type NotificationItem } from '@/context/notification-context';

const ITEM_TYPE_LABEL: Record<NotificationItem['itemType'], string> = {
  'workflow-run': 'Workflow run',
  'sequence-run': 'Sequence run',
  case: 'Case',
};

export function NotificationsMenu() {
  const navigate = useNavigate();
  const { notifications, hasUnread, markNotificationsViewed } = useNotifications();

  const handleNotificationClick = (notification: NotificationItem) => {
    markNotificationsViewed();
    void navigate(notification.href);
  };

  return (
    <Menu as='div' className='relative'>
      <MenuButton
        className='relative cursor-pointer rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-[#1e252e]'
        aria-label='Notifications'
      >
        <Bell className='h-5 w-5 text-slate-500 dark:text-[#9dabb9]' aria-hidden='true' />
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
        <div className='px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
          Alerts (last 48h)
        </div>
        {notifications.length === 0 ? (
          <div className='px-3 py-4 text-[13px] text-slate-500 dark:text-[#9dabb9]'>
            No failed or aborted events in the last 48 hours.
          </div>
        ) : (
          notifications.map((notification) => (
            <MenuItem key={notification.id}>
              <button
                type='button'
                onClick={() => handleNotificationClick(notification)}
                className='flex w-full items-start gap-2 rounded px-3 py-2 text-left text-[13px] text-slate-700 data-focus:bg-slate-100 dark:text-slate-300 dark:data-focus:bg-[#1e252e]'
              >
                <span
                  className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${
                    notification.status === 'failed' ? 'bg-red-500' : 'bg-orange-500'
                  }`}
                  aria-hidden='true'
                />
                <div className='min-w-0 flex-1'>
                  <div className='truncate font-medium'>{notification.title}</div>
                  <div className='text-[11px] text-slate-500 dark:text-[#9dabb9]'>
                    {ITEM_TYPE_LABEL[notification.itemType]} • {notification.status.toUpperCase()} •{' '}
                    {new Date(notification.occurredAt).toLocaleString()}
                  </div>
                </div>
              </button>
            </MenuItem>
          ))
        )}
      </MenuItems>
    </Menu>
  );
}
