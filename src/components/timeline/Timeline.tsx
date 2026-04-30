import { useMemo, useState, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import { ArrowUpDown, MoreVertical } from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { cn } from '@/utils/cn';
import type {
  TimelineCommentEvent,
  TimelineEvent,
  TimelineEventAction,
  TimelineStateEvent,
} from './timeline.type';
import {
  TimelineCommentSeverityEnum,
  TimelineCommentTypes,
  TimelineEventSourceTypes,
  TimelineEventTypes,
} from './timeline.type';
import { getTimelineEventVisual } from './timeline.visuals';

type TimelineSourceMeta = {
  label?: string;
  isCustomState?: boolean;
  isSystemComment?: boolean;
};

export interface TimelineProps {
  events: TimelineEvent[];
  customActions?: ReactNode;
  selectedEventId?: string | null;
  onEventSelect?: (event: TimelineEvent) => void;
}

export interface TimelineFunctionButtonProps extends ComponentPropsWithoutRef<'button'> {
  icon?: ReactNode;
  variant?: 'primary' | 'secondary';
}

function isStateEvent(event: TimelineEvent): event is TimelineStateEvent {
  return event.eventType === TimelineEventTypes.STATE;
}

function isCommentEvent(event: TimelineEvent): event is TimelineCommentEvent {
  return event.eventType === TimelineEventTypes.COMMENT;
}

function formatLabel(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getEventTitle(event: TimelineEvent): string {
  if (isStateEvent(event)) {
    return 'Workflow State Update';
  }

  if (event.commentType === TimelineCommentTypes.SAMPLESHEET) {
    return 'Sample Sheet Uploaded';
  }

  return 'Comment Added';
}

function getSourceMeta(event: TimelineEvent): TimelineSourceMeta {
  if (isCommentEvent(event) && event.sourceType === TimelineEventSourceTypes.SYSTEM) {
    return {
      label: event.createdBy ? event.createdBy : 'System',
      isSystemComment: true,
    };
  }

  if (event.sourceType === TimelineEventSourceTypes.SYSTEM) {
    return {};
  }

  if (event.sourceType === TimelineEventSourceTypes.USER) {
    if (!event.createdBy) {
      return { label: 'User' };
    }

    return {
      label: isCommentEvent(event) ? event.createdBy : `User: ${event.createdBy}`,
    };
  }

  return {
    label: event.createdBy,
    isCustomState: isStateEvent(event),
  };
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return { date: 'Invalid date', time: '--:--' };
  }

  return {
    time: date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    date: date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  };
}

export function TimelineFunctionButton({
  icon,
  variant = 'secondary',
  type = 'button',
  className,
  children,
  ...props
}: TimelineFunctionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium shadow-sm transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-blue-600',
        variant === 'primary'
          ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-offset-neutral-950'
          : 'border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800',
        className
      )}
      {...props}
    >
      {icon && <span className='flex h-4 w-4 items-center justify-center'>{icon}</span>}
      {children}
    </button>
  );
}

export function Timeline({ events, customActions, selectedEventId, onEventSelect }: TimelineProps) {
  const [internalFocusedEventId, setInternalFocusedEventId] = useState<string | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');
  const isSelectionControlled = selectedEventId !== undefined;
  const focusedEventId = isSelectionControlled ? (selectedEventId ?? null) : internalFocusedEventId;

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = dayjs(a.timestamp);
      const dateB = dayjs(b.timestamp);

      if (dateA.isSame(dateB)) {
        return 0;
      }

      const isAfter = dateA.isAfter(dateB);
      return sortOrder === 'latest' ? (isAfter ? -1 : 1) : isAfter ? 1 : -1;
    });
  }, [events, sortOrder]);

  const handleActionClick = async (event: TimelineEvent, action: TimelineEventAction) => {
    const actionKey = `${event.eventId}:${action.id}`;
    setPendingActionKey(actionKey);

    try {
      await action.onClick(event);
    } catch (error) {
      console.error(`Timeline action failed (${action.id}):`, error);
      toast.error(`Failed to run "${action.label}"`);
    } finally {
      setPendingActionKey(null);
    }
  };

  const handleSelectEvent = (event: TimelineEvent) => {
    if (!isSelectionControlled) {
      setInternalFocusedEventId(event.eventId);
    }

    onEventSelect?.(event);
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h3 className='font-semibold text-neutral-900 dark:text-neutral-100'>
            Timeline
            <span className='ml-2 text-sm font-normal text-neutral-600 dark:text-neutral-400'>
              {sortedEvents.length} {sortedEvents.length === 1 ? 'event' : 'events'}
            </span>
          </h3>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {customActions && (
            <div className='flex flex-wrap items-center gap-2'>{customActions}</div>
          )}

          <TimelineFunctionButton
            icon={<ArrowUpDown className='h-4 w-4' />}
            onClick={() =>
              setSortOrder((currentSortOrder) =>
                currentSortOrder === 'latest' ? 'oldest' : 'latest'
              )
            }
          >
            {sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
          </TimelineFunctionButton>
        </div>
      </div>

      <div className='space-y-0'>
        <div className='space-y-0'>
          {sortedEvents.length === 0 ? (
            <div className='py-12 text-center text-neutral-600 dark:text-neutral-400'>
              No timeline events found
            </div>
          ) : (
            sortedEvents.map((event, index) => {
              const isLast = index === sortedEvents.length - 1;
              const visual = getTimelineEventVisual(event);
              const Icon = visual.icon;
              const timestamp = formatTimestamp(event.timestamp);
              const isFocused = focusedEventId === event.eventId;
              const eventActions = event.actions ?? [];
              const hasEventMenuActions = eventActions.length > 0;
              const sourceMeta = getSourceMeta(event);
              const severity = isCommentEvent(event)
                ? (event.severity ?? TimelineCommentSeverityEnum.INFO)
                : null;
              const shouldShowSeverityBadge =
                isCommentEvent(event) && severity !== TimelineCommentSeverityEnum.INFO;

              return (
                <div
                  key={event.eventId}
                  id={`event-${event.eventId}`}
                  className='relative flex gap-4'
                >
                  <div className='relative flex flex-col items-center'>
                    <button
                      type='button'
                      onClick={() => handleSelectEvent(event)}
                      onFocus={() => handleSelectEvent(event)}
                      aria-label={`Select ${getEventTitle(event)}`}
                      className={cn(
                        'relative z-10 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full ring-8 ring-white transition-all duration-300 ease-in-out focus:outline-none dark:ring-gray-900',
                        visual.nodeClassName,
                        isFocused
                          ? 'scale-110 bg-blue-100 shadow-lg shadow-blue-100/50 ring-blue-50 dark:bg-blue-900/30 dark:shadow-blue-900/20 dark:ring-blue-900/20'
                          : 'hover:scale-105'
                      )}
                    >
                      <Icon className={cn('h-5 w-5', visual.iconClassName)} />
                    </button>

                    {!isLast && (
                      <div className='absolute top-8 bottom-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-700' />
                    )}
                  </div>

                  <div className='min-w-0 flex-1 pb-6'>
                    <article
                      tabIndex={0}
                      onClick={() => handleSelectEvent(event)}
                      onFocus={() => handleSelectEvent(event)}
                      aria-labelledby={`event-${event.eventId}-title`}
                      className={cn(
                        'relative cursor-pointer rounded-lg transition-all duration-300 ease-in-out focus:outline-none',
                        event.comment ? 'px-0 py-1' : 'min-h-8 px-0 py-0',
                        !focusedEventId && 'hover:bg-gray-50/50 dark:hover:bg-gray-800/20',
                        isFocused &&
                          (event.comment
                            ? '-mt-1 transform-gpu p-3 pl-4 outline-none'
                            : '-mt-2 min-h-12 transform-gpu px-4 py-2 outline-none'),
                        isFocused && visual.cardClassName
                      )}
                    >
                      <div
                        className={cn(
                          'flex justify-between gap-4',
                          event.comment ? 'mb-3 items-center' : 'min-h-8 items-center'
                        )}
                      >
                        <div className='min-w-0 flex-1'>
                          <div className='flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1'>
                            <h4
                              id={`event-${event.eventId}-title`}
                              className='font-semibold text-neutral-900 dark:text-neutral-100'
                            >
                              {getEventTitle(event)}
                            </h4>

                            {sourceMeta.isCustomState && (
                              <span className='ml-1 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-violet-700 uppercase dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300'>
                                Custom
                              </span>
                            )}

                            {sourceMeta.isSystemComment && (
                              <span className='ml-1 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'>
                                System
                              </span>
                            )}

                            {sourceMeta.label && (
                              <>
                                <span
                                  className='text-neutral-400 dark:text-neutral-600'
                                  aria-hidden='true'
                                >
                                  ·
                                </span>
                                <span className='text-sm font-medium text-neutral-500 dark:text-neutral-400'>
                                  {sourceMeta.label}
                                </span>
                              </>
                            )}

                            <span
                              className='text-neutral-400 dark:text-neutral-600'
                              aria-hidden='true'
                            >
                              ·
                            </span>
                            <span className='text-sm font-medium text-neutral-500 dark:text-neutral-400'>
                              {timestamp.date} {timestamp.time}
                            </span>

                            {isStateEvent(event) && (
                              <span
                                className={cn(
                                  'ml-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
                                  visual.badgeClassName
                                )}
                              >
                                {formatLabel(event.state)}
                              </span>
                            )}

                            {isCommentEvent(event) &&
                              event.commentType === TimelineCommentTypes.SAMPLESHEET && (
                                <span className='ml-1 rounded-full border border-cyan-200 bg-cyan-100 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-cyan-800 uppercase dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'>
                                  Sample Sheet
                                </span>
                              )}

                            {shouldShowSeverityBadge && severity && (
                              <span
                                className={cn(
                                  'ml-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide uppercase',
                                  visual.badgeClassName
                                )}
                              >
                                {formatLabel(severity)}
                              </span>
                            )}
                          </div>
                        </div>

                        {hasEventMenuActions && (
                          <Menu as='div' className='relative'>
                            <MenuButton
                              onClick={(e) => e.stopPropagation()}
                              className={cn(
                                'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus:ring-blue-600',
                                isFocused &&
                                  'border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900'
                              )}
                              aria-label='Event actions'
                            >
                              <MoreVertical className='h-4 w-4' />
                            </MenuButton>
                            <MenuItems className='absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-xl focus:outline-none dark:border-neutral-800 dark:bg-neutral-900'>
                              {eventActions.map((action) => {
                                const actionKey = `${event.eventId}:${action.id}`;
                                const isPending = pendingActionKey === actionKey;
                                const isDisabled =
                                  isPending ||
                                  (typeof action.disabled === 'function'
                                    ? action.disabled(event)
                                    : Boolean(action.disabled));
                                const isDestructive = action.id.toLowerCase().includes('delete');

                                return (
                                  <MenuItem key={action.id}>
                                    <button
                                      type='button'
                                      disabled={isDisabled}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        void handleActionClick(event, action);
                                      }}
                                      className={cn(
                                        'flex w-full cursor-pointer items-center gap-2 px-4 py-2.5 text-left text-sm disabled:cursor-not-allowed disabled:opacity-50 data-[focus]:bg-neutral-100 dark:data-[focus]:bg-neutral-800',
                                        isDestructive
                                          ? 'text-red-700 dark:text-red-300'
                                          : 'text-neutral-700 dark:text-neutral-300'
                                      )}
                                    >
                                      {action.icon && (
                                        <span className='flex h-4 w-4 items-center justify-center'>
                                          {action.icon}
                                        </span>
                                      )}
                                      {isPending ? 'Working...' : action.label}
                                    </button>
                                  </MenuItem>
                                );
                              })}
                            </MenuItems>
                          </Menu>
                        )}
                      </div>

                      {event.comment && (
                        <p className='rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-300'>
                          {event.comment}
                        </p>
                      )}
                    </article>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
