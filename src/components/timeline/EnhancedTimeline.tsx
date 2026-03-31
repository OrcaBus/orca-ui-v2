import { useState, useMemo } from 'react';
import {
  CheckCircle,
  XCircle,
  Circle,
  MessageSquare,
  Upload,
  PlayCircle,
  Clock,
  MoreVertical,
  Plus,
  MessageCircle,
  Link as LinkIcon,
  FileJson,
  ArrowUpDown,
} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { toast } from 'sonner';
import type {
  TimelineEvent,
  TimelineFilters,
  AddCustomStateFormData,
  AddCommentFormData,
} from './timeline.type';
import { TIMELINE_EVENT_CONFIGS } from './timeline.constants';
import { AddCustomStateDialog } from './AddCustomStateDialog';
import { AddCommentDialog } from './AddCommentDialog';
import { PayloadViewerDialog } from './PayloadViewerDialog';

interface EnhancedTimelineProps {
  events: TimelineEvent[];
  availableRunIds?: Array<{ value: string; label: string }>;
  availableStates: Array<{ value: string; label: string }>;
  onAddCustomState: (data: AddCustomStateFormData) => Promise<void>;
  onAddComment: (data: AddCommentFormData) => Promise<void>;
  filterLabel?: string; // "Sequence Run ID" or "Workflow Run ID"
}

export function EnhancedTimeline({
  events,
  availableRunIds = [],
  availableStates,
  onAddCustomState,
  onAddComment,
  filterLabel = 'Run ID',
}: EnhancedTimelineProps) {
  // Dialog states
  const [showAddStateDialog, setShowAddStateDialog] = useState(false);
  const [showAddCommentDialog, setShowAddCommentDialog] = useState(false);
  const [payloadViewerState, setPayloadViewerState] = useState<{
    isOpen: boolean;
    payload: Record<string, unknown> | null;
    eventId: string;
  }>({
    isOpen: false,
    payload: null,
    eventId: '',
  });

  // Filter and sort state
  const [filters, setFilters] = useState<TimelineFilters>({
    runId: 'all',
    sortOrder: 'latest',
  });

  // Filter and sort events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = events;

    // Filter by run ID
    if (filters.runId !== 'all') {
      filtered = filtered.filter((event) => event.runId === filters.runId);
    }

    // Sort by timestamp
    return filtered.toSorted((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return filters.sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });
  }, [events, filters]);

  // Get icon configuration for event
  const getEventIcon = (event: TimelineEvent) => {
    // Check if it's a state-based event with success/failure
    if (event.stateName) {
      const stateLower = event.stateName.toLowerCase();
      if (
        stateLower.includes('success') ||
        stateLower.includes('complete') ||
        stateLower.includes('succeed')
      ) {
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100 dark:bg-green-950',
          iconColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-300 dark:border-green-800',
        };
      }
      if (
        stateLower.includes('fail') ||
        stateLower.includes('abort') ||
        stateLower.includes('error')
      ) {
        return {
          icon: XCircle,
          bgColor: 'bg-red-100 dark:bg-red-950',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-300 dark:border-red-800',
        };
      }
      if (
        stateLower.includes('running') ||
        stateLower.includes('ongoing') ||
        stateLower.includes('processing')
      ) {
        return {
          icon: PlayCircle,
          bgColor: 'bg-blue-100 dark:bg-blue-950',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-300 dark:border-blue-800',
        };
      }
      if (
        stateLower.includes('queued') ||
        stateLower.includes('pending') ||
        stateLower.includes('initializing')
      ) {
        return {
          icon: Clock,
          bgColor: 'bg-amber-100 dark:bg-amber-950',
          iconColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-300 dark:border-amber-800',
        };
      }
    }

    // Check event type
    if (event.eventType === 'comment') {
      return {
        icon: MessageSquare,
        bgColor: 'bg-blue-100 dark:bg-blue-950',
        iconColor: 'text-blue-600 dark:text-blue-400',
        borderColor: 'border-blue-300 dark:border-blue-800',
      };
    }

    if (
      event.eventType === 'samplesheet_added' ||
      event.eventType === 'file_uploaded' ||
      event.eventType === 'samplesheet_validated'
    ) {
      return {
        icon: Upload,
        bgColor: 'bg-purple-100 dark:bg-purple-950',
        iconColor: 'text-purple-600 dark:text-purple-400',
        borderColor: 'border-purple-300 dark:border-purple-800',
      };
    }

    // Default neutral
    return {
      icon: Circle,
      bgColor: 'bg-neutral-100 dark:bg-neutral-800',
      iconColor: 'text-neutral-600 dark:text-neutral-400',
      borderColor: 'border-neutral-300 dark:border-neutral-700',
    };
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
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
  };

  // Get event type label
  const getEventTypeLabel = (eventType: string): string => {
    const config = (TIMELINE_EVENT_CONFIGS as Record<string, { label: string }>)[eventType];
    return config?.label || eventType;
  };

  // Copy event link to clipboard
  const handleCopyLink = (eventId: string) => {
    const url = `${window.location.href}#event-${eventId}`;

    // Try modern Clipboard API first, silently fall back if blocked
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          toast.success('Event link copied to clipboard');
        })
        .catch(() => {
          // Fall back to textarea method
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            const success = document.execCommand('copy');
            if (success) {
              toast.success('Event link copied to clipboard');
            }
          } catch {
            // Silently fail
          }

          textArea.remove();
        });
    } else {
      // Use fallback method if Clipboard API unavailable
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const success = document.execCommand('copy');
        if (success) {
          toast.success('Event link copied to clipboard');
        }
      } catch {
        // Silently fail
      }

      textArea.remove();
    }
  };

  // View payload
  const handleViewPayload = (event: TimelineEvent) => {
    if (event.payload) {
      setPayloadViewerState({
        isOpen: true,
        payload: event.payload,
        eventId: event.id,
      });
    }
  };

  return (
    <div className='space-y-6'>
      {/* Header and Controls */}
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Title */}
        <div>
          <h3 className='font-semibold text-neutral-900 dark:text-neutral-100'>
            Timeline
            <span className='ml-2 text-sm font-normal text-neutral-600 dark:text-neutral-400'>
              ({filteredAndSortedEvents.length}{' '}
              {filteredAndSortedEvents.length === 1 ? 'event' : 'events'})
            </span>
          </h3>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-3'>
          {/* Sort Control */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                sortOrder: prev.sortOrder === 'latest' ? 'oldest' : 'latest',
              }))
            }
            className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
          >
            <ArrowUpDown className='h-4 w-4' />
            {filters.sortOrder === 'latest' ? 'Latest First' : 'Oldest First'}
          </button>

          {/* Run ID Filter */}
          {availableRunIds.length > 0 && (
            <select
              value={filters.runId}
              onChange={(e) => setFilters((prev) => ({ ...prev, runId: e.target.value }))}
              className='rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-blue-600'
            >
              <option value='all'>All {filterLabel}s</option>
              {availableRunIds.map((run) => (
                <option key={run.value} value={run.value}>
                  {run.label}
                </option>
              ))}
            </select>
          )}

          {/* Add Custom State */}
          <button
            onClick={() => setShowAddStateDialog(true)}
            className='flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
          >
            <Plus className='h-4 w-4' />
            Add State
          </button>

          {/* Add Comment */}
          <button
            onClick={() => setShowAddCommentDialog(true)}
            className='flex items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
          >
            <MessageCircle className='h-4 w-4' />
            Add Comment
          </button>
        </div>
      </div>

      {/* Timeline Events */}
      <div className='space-y-0'>
        {filteredAndSortedEvents.length === 0 ? (
          <div className='py-12 text-center text-neutral-600 dark:text-neutral-400'>
            No timeline events found
          </div>
        ) : (
          filteredAndSortedEvents.map((event, index) => {
            const isLast = index === filteredAndSortedEvents.length - 1;
            const iconConfig = getEventIcon(event);
            const Icon = iconConfig.icon;
            const timestamp = formatTimestamp(event.timestamp);

            return (
              <div key={event.id} id={`event-${event.id}`} className='relative flex gap-4'>
                {/* Timeline Rail */}
                <div className='relative flex flex-col items-center'>
                  {/* Icon Node */}
                  <div
                    className={`relative z-10 h-10 w-10 rounded-full border-2 ${iconConfig.bgColor} ${iconConfig.borderColor} flex flex-shrink-0 items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${iconConfig.iconColor}`} />
                  </div>

                  {/* Connecting Line */}
                  {!isLast && (
                    <div className='absolute top-10 bottom-0 h-full w-0.5 bg-neutral-200 dark:bg-neutral-700' />
                  )}
                </div>

                {/* Event Card */}
                <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
                  <div className='rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'>
                    {/* Header Row */}
                    <div className='mb-2 flex items-start justify-between gap-4'>
                      <div className='flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          {/* Event Type */}
                          <span className='font-medium text-neutral-900 dark:text-neutral-100'>
                            {getEventTypeLabel(event.eventType)}
                          </span>

                          {/* State Badge (if present) */}
                          {event.stateName && (
                            <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'>
                              {event.stateName}
                            </span>
                          )}

                          {/* Source Badge */}
                          {event.source.type === 'custom' && (
                            <span className='rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-400'>
                              Custom
                            </span>
                          )}
                        </div>

                        {/* Source Info */}
                        <div className='mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400'>
                          {event.source.type === 'system' && <span>System</span>}
                          {event.source.type === 'user' && (
                            <span>User: {event.source.userName}</span>
                          )}
                          {event.source.type === 'custom' && <span>Custom</span>}
                          <span>•</span>
                          <span>
                            {timestamp.date} at {timestamp.time}
                          </span>
                          {event.runDisplayName && (
                            <>
                              <span>•</span>
                              <span className='font-mono'>{event.runDisplayName}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Actions Menu */}
                      <Menu as='div' className='relative'>
                        <MenuButton className='rounded p-1 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'>
                          <MoreVertical className='h-4 w-4' />
                        </MenuButton>
                        <MenuItems className='absolute right-0 z-10 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg focus:outline-none dark:border-neutral-800 dark:bg-neutral-900'>
                          <MenuItem>
                            <button
                              onClick={() => handleCopyLink(event.id)}
                              className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 data-[focus]:bg-neutral-100 dark:text-neutral-300 dark:data-[focus]:bg-neutral-800'
                            >
                              <LinkIcon className='h-4 w-4' />
                              Copy link to event
                            </button>
                          </MenuItem>
                          {event.payload && (
                            <MenuItem>
                              <button
                                onClick={() => handleViewPayload(event)}
                                className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700 data-[focus]:bg-neutral-100 dark:text-neutral-300 dark:data-[focus]:bg-neutral-800'
                              >
                                <FileJson className='h-4 w-4' />
                                View payload
                              </button>
                            </MenuItem>
                          )}
                        </MenuItems>
                      </Menu>
                    </div>

                    {/* Comment/Note */}
                    {event.comment && (
                      <p className='mt-2 border-l-2 border-neutral-200 pl-4 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-300'>
                        {event.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Dialogs */}
      <AddCustomStateDialog
        isOpen={showAddStateDialog}
        onClose={() => setShowAddStateDialog(false)}
        onSubmit={onAddCustomState}
        availableStates={availableStates}
      />

      <AddCommentDialog
        isOpen={showAddCommentDialog}
        onClose={() => setShowAddCommentDialog(false)}
        onSubmit={onAddComment}
      />

      {payloadViewerState.payload && (
        <PayloadViewerDialog
          isOpen={payloadViewerState.isOpen}
          onClose={() => setPayloadViewerState({ isOpen: false, payload: null, eventId: '' })}
          payload={payloadViewerState.payload}
          eventId={payloadViewerState.eventId}
        />
      )}
    </div>
  );
}
