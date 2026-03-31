import { useState } from 'react';
import { Zap, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { EventDef } from '../types/workflow-catalog.types';

interface EventCardProps {
  event: EventDef;
  variant: 'input' | 'output';
  onEdit?: () => void;
  onDelete?: () => void;
}

export function EventCard({ event, variant, onEdit, onDelete }: EventCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accentColor = variant === 'input' ? '#3b82f6' : '#10b981';
  const showActions = onEdit != null || onDelete != null;

  return (
    <div className='overflow-hidden rounded-xl border border-slate-100 dark:border-[#2d3540]'>
      <div
        className='flex cursor-pointer items-start gap-2 px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1e252e]'
        onClick={() => setExpanded(!expanded)}
      >
        <Zap className='mt-0.5 h-3.5 w-3.5 shrink-0' style={{ color: accentColor }} />
        <div className='min-w-0 flex-1'>
          <div className='truncate font-mono text-[11px] font-semibold text-slate-800 dark:text-white'>
            {event.name}
          </div>
          {event.topic && (
            <div className='mt-0.5 text-[10px] text-slate-400 dark:text-[#9dabb9]'>
              Topic: <span style={{ color: accentColor }}>{event.topic}</span>
            </div>
          )}
          {event.condition && (
            <div className='mt-0.5 text-[10px] text-slate-400 dark:text-[#9dabb9]'>
              Condition:{' '}
              <span className='font-mono text-amber-600 dark:text-amber-400'>
                {event.condition}
              </span>
            </div>
          )}
        </div>
        {showActions && (
          <div className='flex shrink-0 items-center gap-0.5' onClick={(e) => e.stopPropagation()}>
            {onEdit && (
              <button
                type='button'
                onClick={onEdit}
                className='rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                title='Edit event'
              >
                <Pencil className='h-3.5 w-3.5' />
              </button>
            )}
            {onDelete && (
              <button
                type='button'
                onClick={onDelete}
                className='rounded p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400'
                title='Remove event'
              >
                <Trash2 className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
        )}
        <ChevronRight
          className='mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 transition-transform dark:text-[#2d3540]'
          style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
        />
      </div>
      {expanded && (
        <div
          className={
            variant === 'input'
              ? 'bg-blue-50 px-3 pt-1 pb-3 dark:bg-blue-500/10'
              : 'bg-emerald-50 px-3 pt-1 pb-3 dark:bg-emerald-500/10'
          }
        >
          <div
            className={
              variant === 'input'
                ? 'mb-1.5 text-[10px] font-semibold text-blue-700 dark:text-blue-400'
                : 'mb-1.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400'
            }
          >
            Example Payload
          </div>
          <pre className='overflow-x-auto rounded-lg bg-slate-900 p-2.5 font-mono text-[10px] leading-relaxed text-slate-300 dark:bg-slate-950 dark:text-slate-400'>
            <code>{JSON.stringify(event.payload, null, 2)}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
