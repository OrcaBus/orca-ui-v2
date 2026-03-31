import { useState, useCallback } from 'react';
import { X, Tag, Cpu, ArrowRight, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import type { WorkflowNodeData, EventDef } from '../types/workflow-catalog.types';
import { ANALYSIS_LIST, ENGINE_COLORS } from '../data';
import { EventCard } from './EventCard';
import { EventModal } from './EventModal';
import { DeleteEventConfirmDialog } from './DeleteEventConfirmDialog';

type EventModalState =
  | null
  | { mode: 'add'; variant: 'input' | 'output'; id: number }
  | { mode: 'edit'; variant: 'input' | 'output'; index: number; initial: EventDef; id: number };

type EventDeleteConfirmState = null | {
  variant: 'input' | 'output';
  index: number;
  eventName: string;
};

interface WorkflowDrawerProps {
  workflowId: string;
  workflows: Record<string, WorkflowNodeData>;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateEvents: (
    id: string,
    patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] }
  ) => void;
}

export function WorkflowDrawer({
  workflowId,
  workflows,
  onClose,
  onEdit,
  onDelete,
  onUpdateEvents,
}: WorkflowDrawerProps) {
  const data = workflows[workflowId];
  const [eventModal, setEventModal] = useState<EventModalState>(null);
  const [eventDeleteConfirm, setEventDeleteConfirm] = useState<EventDeleteConfirmState>(null);

  const handleSaveEvent = useCallback(
    (evt: EventDef) => {
      const w = workflows[workflowId];
      if (!w) return;
      if (!eventModal || eventModal.mode === 'add') {
        if (eventModal?.variant === 'input') {
          onUpdateEvents(workflowId, { inputEvents: [...w.inputEvents, evt] });
        } else {
          onUpdateEvents(workflowId, { outputEvents: [...w.outputEvents, evt] });
        }
      } else {
        const list = eventModal.variant === 'input' ? [...w.inputEvents] : [...w.outputEvents];
        list[eventModal.index] = evt;
        if (eventModal.variant === 'input') {
          onUpdateEvents(workflowId, { inputEvents: list });
        } else {
          onUpdateEvents(workflowId, { outputEvents: list });
        }
      }
      setEventModal(null);
    },
    [workflowId, workflows, eventModal, onUpdateEvents]
  );

  const handleConfirmDeleteEvent = useCallback(() => {
    if (!eventDeleteConfirm) return;
    const w = workflows[workflowId];
    if (!w) return;
    if (eventDeleteConfirm.variant === 'input') {
      const next = w.inputEvents.filter((_, i) => i !== eventDeleteConfirm.index);
      onUpdateEvents(workflowId, { inputEvents: next });
    } else {
      const next = w.outputEvents.filter((_, i) => i !== eventDeleteConfirm.index);
      onUpdateEvents(workflowId, { outputEvents: next });
    }
    setEventDeleteConfirm(null);
  }, [workflowId, workflows, eventDeleteConfirm, onUpdateEvents]);

  if (!data) return null;
  const engineColor = ENGINE_COLORS[data.engine] ?? '#6b7280';

  return (
    <div className='flex h-full flex-col border-l border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      {/* Drawer header */}
      <div className='border-b border-slate-100 px-5 pt-5 pb-4 dark:border-[#2d3540]'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1 pr-3'>
            <div className='mb-1 flex items-center gap-2'>
              <span
                className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold'
                style={{ background: `${engineColor}18`, color: engineColor }}
              >
                <Cpu className='h-2.5 w-2.5' />
                {data.engine} ENGINE
              </span>
            </div>
            <h2 className='text-lg leading-tight font-bold text-slate-900 dark:text-white'>
              {data.label}
            </h2>
            <p className='mt-0.5 text-xs text-slate-400 dark:text-[#9dabb9]'>{data.version}</p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-white'
          >
            <X className='h-4 w-4' />
          </button>
        </div>

        <p className='mt-3 text-sm leading-relaxed text-slate-600 dark:text-[#9dabb9]'>
          {data.description}
        </p>

        {/* Action buttons */}
        <div className='mt-4 flex items-center gap-2'>
          <button
            type='button'
            onClick={() => onEdit(workflowId)}
            className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            <Pencil className='h-3.5 w-3.5' />
            Edit
          </button>
          <button
            type='button'
            onClick={() => onDelete(workflowId)}
            className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
          >
            <Trash2 className='h-3.5 w-3.5' />
            Remove
          </button>
        </div>
      </div>

      {/* Drawer body */}
      <div className='flex-1 space-y-6 overflow-y-auto px-5 py-4'>
        {/* Input Events */}
        <section>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h3 className='flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
              <ArrowRight className='h-3.5 w-3.5 text-blue-500 dark:text-blue-400' />
              Input Events
            </h3>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setEventModal({ mode: 'add', variant: 'input', id: Date.now() })}
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400'
                title='Add input event'
              >
                <Plus className='h-4 w-4' />
              </button>
              <span className='rounded-full bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'>
                {data.inputEvents.length} {data.inputEvents.length === 1 ? 'Source' : 'Sources'}
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {data.inputEvents.map((evt, i) => (
              <EventCard
                key={i}
                event={evt}
                variant='input'
                onEdit={() =>
                  setEventModal({
                    mode: 'edit',
                    variant: 'input',
                    index: i,
                    initial: evt,
                    id: Date.now(),
                  })
                }
                onDelete={() =>
                  setEventDeleteConfirm({ variant: 'input', index: i, eventName: evt.name })
                }
              />
            ))}
          </div>
        </section>

        {/* Output Events */}
        <section>
          <div className='mb-3 flex items-center justify-between gap-2'>
            <h3 className='flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
              <ChevronRight className='h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400' />
              Output Events
            </h3>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setEventModal({ mode: 'add', variant: 'output', id: Date.now() })}
                className='inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:border-emerald-500/50 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400'
                title='Add output event'
              >
                <Plus className='h-4 w-4' />
              </button>
              <span className='rounded-full bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'>
                {data.outputEvents.length} {data.outputEvents.length === 1 ? 'Target' : 'Targets'}
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {data.outputEvents.map((evt, i) => (
              <EventCard
                key={i}
                event={evt}
                variant='output'
                onEdit={() =>
                  setEventModal({
                    mode: 'edit',
                    variant: 'output',
                    index: i,
                    initial: evt,
                    id: Date.now(),
                  })
                }
                onDelete={() =>
                  setEventDeleteConfirm({ variant: 'output', index: i, eventName: evt.name })
                }
              />
            ))}
          </div>
        </section>

        {/* Analysis Tags */}
        <section>
          <h3 className='mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
            <Tag className='h-3.5 w-3.5 dark:text-[#9dabb9]' />
            Used In
          </h3>
          <div className='flex flex-wrap gap-2'>
            {data.analysisIds.map((aid) => {
              const analysis = ANALYSIS_LIST.find((a) => a.id === aid);
              if (!analysis || aid === 'ALL') return null;
              return (
                <span
                  key={aid}
                  className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium'
                  style={{
                    background: `${analysis.color}15`,
                    color: analysis.color,
                    border: `1px solid ${analysis.color}30`,
                  }}
                >
                  {analysis.label}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      {/* Event modals (owned by drawer) */}
      <EventModal
        key={`event-modal-${eventModal?.id ?? 'closed'}`}
        isOpen={eventModal !== null}
        mode={eventModal?.mode ?? 'add'}
        variant={eventModal?.variant ?? 'input'}
        initialEvent={eventModal?.mode === 'edit' ? eventModal.initial : undefined}
        onSave={handleSaveEvent}
        onClose={() => setEventModal(null)}
      />
      {eventDeleteConfirm && (
        <DeleteEventConfirmDialog
          eventName={eventDeleteConfirm.eventName}
          onConfirm={handleConfirmDeleteEvent}
          onCancel={() => setEventDeleteConfirm(null)}
        />
      )}
    </div>
  );
}
