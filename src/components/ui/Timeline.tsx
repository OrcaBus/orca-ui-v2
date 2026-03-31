import {
  CheckCircle,
  XCircle,
  Clock,
  PlayCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Circle,
} from 'lucide-react';

export interface TimelineEvent {
  id: string;
  state: string;
  stateLabel: string;
  timestamp: string;
  type?: 'status' | 'comment' | 'manual' | 'milestone';
  message?: string;
  user?: string;
  details?: string;
  isTerminal?: boolean;
  isCurrent?: boolean;
}

interface TimelineProps {
  events: TimelineEvent[];
  showType?: boolean;
}

export function Timeline({ events, showType = true }: TimelineProps) {
  const getStateIcon = (state: string, type?: string) => {
    // Type-based icons
    if (type === 'comment') {
      return {
        icon: MessageSquare,
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-300',
      };
    }
    if (type === 'manual' || type === 'milestone') {
      return {
        icon: User,
        bgColor: 'bg-purple-100',
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-300',
      };
    }

    // Status-based icons
    switch (state.toLowerCase()) {
      case 'completed':
      case 'succeeded':
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
          borderColor: 'border-green-300',
        };
      case 'failed':
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-red-100',
          iconColor: 'text-red-600',
          borderColor: 'border-red-300',
        };
      case 'running':
      case 'processing':
      case 'in_progress':
        return {
          icon: PlayCircle,
          bgColor: 'bg-blue-100',
          iconColor: 'text-blue-600',
          borderColor: 'border-blue-300',
        };
      case 'queued':
      case 'pending':
      case 'waiting':
      case 'initializing':
        return {
          icon: Clock,
          bgColor: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-300',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          bgColor: 'bg-amber-100',
          iconColor: 'text-amber-600',
          borderColor: 'border-amber-300',
        };
      default:
        return {
          icon: Circle,
          bgColor: 'bg-neutral-100',
          iconColor: 'text-neutral-600',
          borderColor: 'border-neutral-300',
        };
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let relative = '';
    if (diffMins < 1) {
      relative = 'Just now';
    } else if (diffMins < 60) {
      relative = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      relative = `${diffHours}h ago`;
    } else if (diffDays < 7) {
      relative = `${diffDays}d ago`;
    }

    return {
      absolute: date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      relative,
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

  return (
    <div className='space-y-0'>
      {events.map((event, index) => {
        const isLast = index === events.length - 1;
        const iconConfig = getStateIcon(event.state, event.type);
        const Icon = iconConfig.icon;
        const timestamp = formatTimestamp(event.timestamp);

        // Highlight current or terminal states
        const isHighlighted = event.isCurrent || event.isTerminal;
        const cardBg = isHighlighted
          ? event.isTerminal && event.state.toLowerCase().includes('fail')
            ? 'bg-red-50 border-red-200'
            : event.isTerminal && event.state.toLowerCase().includes('complete')
              ? 'bg-green-50 border-green-200'
              : 'bg-blue-50 border-blue-200'
          : 'bg-white border-neutral-200';

        return (
          <div key={event.id} className='relative flex gap-4'>
            {/* Timeline indicator */}
            <div className='relative flex flex-col items-center'>
              {/* Icon */}
              <div
                className={`relative z-10 h-10 w-10 rounded-full border-2 ${iconConfig.bgColor} ${iconConfig.borderColor} flex flex-shrink-0 items-center justify-center ${
                  isHighlighted ? 'ring-4 ring-blue-200/50 ring-offset-2' : ''
                }`}
              >
                <Icon className={`h-5 w-5 ${iconConfig.iconColor}`} />
              </div>

              {/* Connecting line */}
              {!isLast && <div className='absolute top-10 bottom-0 h-full w-0.5 bg-neutral-200' />}
            </div>

            {/* Event content */}
            <div className={`flex-1 pb-6 ${isLast ? '' : ''}`}>
              <div className={`rounded-lg border p-4 ${cardBg} transition-colors`}>
                <div className='mb-2 flex items-start justify-between gap-4'>
                  <div className='flex-1'>
                    <div className='mb-1 flex items-center gap-2'>
                      <h4 className='font-medium text-neutral-900'>{event.stateLabel}</h4>
                      {showType && event.type && event.type !== 'status' && (
                        <span className='rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700 capitalize'>
                          {event.type}
                        </span>
                      )}
                      {isHighlighted && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            event.isCurrent
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {event.isCurrent ? 'Current' : 'Terminal'}
                        </span>
                      )}
                    </div>
                    {event.message && <p className='text-sm text-neutral-700'>{event.message}</p>}
                    {event.details && (
                      <p className='mt-1 text-xs text-neutral-600'>{event.details}</p>
                    )}
                  </div>

                  <div className='text-right'>
                    <div className='text-sm font-medium text-neutral-900'>{timestamp.time}</div>
                    <div className='text-xs text-neutral-500'>{timestamp.date}</div>
                    {timestamp.relative && (
                      <div className='mt-1 text-xs text-neutral-400'>{timestamp.relative}</div>
                    )}
                  </div>
                </div>

                {event.user && (
                  <div className='mt-2 flex items-center gap-2 border-t border-neutral-200 pt-2'>
                    <User className='h-3 w-3 text-neutral-500' />
                    <span className='text-xs text-neutral-600'>{event.user}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
