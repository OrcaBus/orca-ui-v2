import { useState, useCallback } from 'react';
import { X, Tag, Cpu, ArrowRight, ChevronRight, Plus, Pencil, Trash2 } from 'lucide-react';
import type { EventDef, MapGroup, MapNode } from '../data/dynamodb-schema';
import { EventCard } from './EventCard';
import { Button } from '@/components/ui/Button';
import { EventModal } from './EventModal';
import { DeleteEventConfirmDialog } from './DeleteEventConfirmDialog';
import { getNodeAccentColor, getNodeDetailLabel, getNodeKindLabel } from '../utils/nodeDisplay';

type EventModalState =
  | null
  | { mode: 'add'; variant: 'input' | 'output'; id: number }
  | { mode: 'edit'; variant: 'input' | 'output'; index: number; initial: EventDef; id: number };

type EventDeleteConfirmState = null | {
  variant: 'input' | 'output';
  index: number;
  eventName: string;
};

interface NodeDrawerProps {
  nodeId: string;
  nodes: Record<string, MapNode>;
  groups: MapGroup[];
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateEvents: (
    id: string,
    patch: { inputEvents?: EventDef[]; outputEvents?: EventDef[] }
  ) => void;
}

export function NodeDrawer({
  nodeId,
  nodes,
  groups,
  onClose,
  onEdit,
  onDelete,
  onUpdateEvents,
}: NodeDrawerProps) {
  const node = nodes[nodeId];
  const [eventModal, setEventModal] = useState<EventModalState>(null);
  const [eventDeleteConfirm, setEventDeleteConfirm] = useState<EventDeleteConfirmState>(null);

  const handleSaveEvent = useCallback(
    (eventDef: EventDef) => {
      const currentNode = nodes[nodeId];
      if (!currentNode) {
        return;
      }

      if (!eventModal || eventModal.mode === 'add') {
        if (eventModal?.variant === 'input') {
          onUpdateEvents(nodeId, { inputEvents: [...currentNode.inputEvents, eventDef] });
        } else {
          onUpdateEvents(nodeId, { outputEvents: [...currentNode.outputEvents, eventDef] });
        }
      } else {
        const nextEvents =
          eventModal.variant === 'input'
            ? [...currentNode.inputEvents]
            : [...currentNode.outputEvents];

        nextEvents[eventModal.index] = eventDef;

        if (eventModal.variant === 'input') {
          onUpdateEvents(nodeId, { inputEvents: nextEvents });
        } else {
          onUpdateEvents(nodeId, { outputEvents: nextEvents });
        }
      }

      setEventModal(null);
    },
    [nodeId, nodes, eventModal, onUpdateEvents]
  );

  const handleConfirmDeleteEvent = useCallback(() => {
    if (!eventDeleteConfirm) {
      return;
    }

    const currentNode = nodes[nodeId];
    if (!currentNode) {
      return;
    }

    if (eventDeleteConfirm.variant === 'input') {
      onUpdateEvents(nodeId, {
        inputEvents: currentNode.inputEvents.filter(
          (_, index) => index !== eventDeleteConfirm.index
        ),
      });
    } else {
      onUpdateEvents(nodeId, {
        outputEvents: currentNode.outputEvents.filter(
          (_, index) => index !== eventDeleteConfirm.index
        ),
      });
    }

    setEventDeleteConfirm(null);
  }, [nodeId, nodes, eventDeleteConfirm, onUpdateEvents]);

  if (!node) {
    return null;
  }

  const nodeColor = getNodeAccentColor(node);
  const tagEntries = Object.entries(node.tags);

  return (
    <div className='flex h-full flex-col border-l border-slate-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      <div className='border-b border-slate-100 px-5 pt-5 pb-4 dark:border-[#2d3540]'>
        <div className='flex items-start justify-between'>
          <div className='min-w-0 flex-1 pr-3'>
            <div className='mb-1 flex items-center gap-2'>
              <span
                className='inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold'
                style={{ background: `${nodeColor}18`, color: nodeColor }}
              >
                <Cpu className='h-2.5 w-2.5' />
                {getNodeKindLabel(node)}
              </span>
              <span
                className='inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold'
                style={{ background: `${nodeColor}18`, color: nodeColor }}
              >
                {getNodeDetailLabel(node)}
              </span>
            </div>
            <h2 className='text-lg leading-tight font-bold text-slate-900 dark:text-white'>
              {node.label}
            </h2>
            <p className='mt-0.5 text-xs text-slate-400 dark:text-[#9dabb9]'>{node.version}</p>
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
          {node.description}
        </p>

        <div className='mt-4 flex items-center gap-2'>
          <Button type='button' onClick={() => onEdit(nodeId)} className='flex-1'>
            <Pencil />
            Edit
          </Button>
          <button
            type='button'
            onClick={() => onDelete(nodeId)}
            className='inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10'
          >
            <Trash2 className='h-3.5 w-3.5' />
            Remove
          </button>
        </div>
      </div>

      <div className='flex-1 space-y-6 overflow-y-auto px-5 py-4'>
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
                {node.inputEvents.length} {node.inputEvents.length === 1 ? 'Source' : 'Sources'}
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {node.inputEvents.map((eventDef, index) => (
              <EventCard
                key={`${eventDef.name}-${index}`}
                event={eventDef}
                variant='input'
                onEdit={() =>
                  setEventModal({
                    mode: 'edit',
                    variant: 'input',
                    index,
                    initial: eventDef,
                    id: Date.now(),
                  })
                }
                onDelete={() =>
                  setEventDeleteConfirm({
                    variant: 'input',
                    index,
                    eventName: eventDef.name,
                  })
                }
              />
            ))}
          </div>
        </section>

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
                {node.outputEvents.length} {node.outputEvents.length === 1 ? 'Target' : 'Targets'}
              </span>
            </div>
          </div>
          <div className='space-y-3'>
            {node.outputEvents.map((eventDef, index) => (
              <EventCard
                key={`${eventDef.name}-${index}`}
                event={eventDef}
                variant='output'
                onEdit={() =>
                  setEventModal({
                    mode: 'edit',
                    variant: 'output',
                    index,
                    initial: eventDef,
                    id: Date.now(),
                  })
                }
                onDelete={() =>
                  setEventDeleteConfirm({
                    variant: 'output',
                    index,
                    eventName: eventDef.name,
                  })
                }
              />
            ))}
          </div>
        </section>

        <section>
          <h3 className='mb-3 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
            Tags
          </h3>
          {tagEntries.length > 0 ? (
            <div className='flex flex-wrap gap-2'>
              {tagEntries.map(([key, value]) => (
                <span
                  key={key}
                  className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-300'
                >
                  <span className='font-semibold'>{key}</span>
                  <span className='text-slate-400 dark:text-[#9dabb9]'>=</span>
                  <span className='font-mono'>{value}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className='text-sm text-slate-500 dark:text-[#9dabb9]'>No tags configured.</p>
          )}
        </section>

        <section>
          <h3 className='mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-[#9dabb9]'>
            <Tag className='h-3.5 w-3.5 dark:text-[#9dabb9]' />
            Used In
          </h3>
          <div className='flex flex-wrap gap-2'>
            {node.groupIds.map((groupId) => {
              const group = groups.find((candidate) => candidate.groupId === groupId);
              if (!group) {
                return null;
              }

              return (
                <span
                  key={groupId}
                  className='inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium'
                  style={{
                    background: `${group.color}15`,
                    color: group.color,
                    border: `1px solid ${group.color}30`,
                  }}
                >
                  {group.name}
                </span>
              );
            })}
          </div>
        </section>
      </div>

      <EventModal
        isOpen={eventModal !== null}
        mode={eventModal?.mode ?? null}
        variant={eventModal?.variant ?? null}
        initialEvent={eventModal?.mode === 'edit' ? eventModal.initial : undefined}
        onSave={handleSaveEvent}
        onClose={() => setEventModal(null)}
      />

      <DeleteEventConfirmDialog
        isOpen={eventDeleteConfirm !== null}
        eventName={eventDeleteConfirm?.eventName ?? null}
        onConfirm={handleConfirmDeleteEvent}
        onCancel={() => setEventDeleteConfirm(null)}
      />
    </div>
  );
}
