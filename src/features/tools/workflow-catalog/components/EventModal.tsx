import { useState } from 'react';
import { X, Zap, Info } from 'lucide-react';
import { tryPrettyJson } from '@/utils/json';
import type { EventDef, EventFormData } from '../types/workflow-catalog.types';
import { defaultEventFormData, eventDefToForm, formToEventDef } from '../utils/eventForm';

interface EventModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  variant: 'input' | 'output';
  initialEvent?: EventDef;
  onSave: (event: EventDef) => void;
  onClose: () => void;
}

export function EventModal({
  isOpen,
  mode,
  variant,
  initialEvent,
  onSave,
  onClose,
}: EventModalProps) {
  const [form, setForm] = useState<EventFormData>(() =>
    initialEvent ? eventDefToForm(initialEvent) : defaultEventFormData
  );
  const [payloadError, setPayloadError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPayloadError(null);
    const evt = formToEventDef(form);
    if (!evt) {
      if (!form.name.trim()) return;
      setPayloadError('Invalid JSON in payload.');
      return;
    }
    onSave(evt);
    onClose();
  };

  const formatPayloadJson = () => {
    const pretty = tryPrettyJson(form.payloadJson);
    setForm((p) => ({ ...p, payloadJson: pretty }));
    if (pretty !== form.payloadJson) setPayloadError(null);
  };

  const handlePayloadBlur = () => {
    const pretty = tryPrettyJson(form.payloadJson);
    if (pretty !== form.payloadJson) {
      setForm((p) => ({ ...p, payloadJson: pretty }));
      setPayloadError(null);
    }
  };

  if (!isOpen) return null;

  const title = mode === 'add' ? 'Add Event' : 'Edit Event';
  const subtitle = variant === 'input' ? 'Input event' : 'Output event';

  return (
    <div className='fixed inset-0 z-60 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <form onSubmit={handleSubmit} className='contents'>
          <div className='flex items-start justify-between px-6 pt-6 pb-2'>
            <div className='flex items-center gap-2'>
              <Zap className='h-5 w-5 text-blue-500 dark:text-blue-400' />
              <div>
                <h2 className='text-lg font-bold text-slate-900 dark:text-white'>{title}</h2>
                <p className='mt-0.5 text-sm text-slate-500 dark:text-[#9dabb9]'>{subtitle}</p>
              </div>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1e252e] dark:hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='space-y-4 px-6 py-4'>
            <div>
              <label
                htmlFor='event-name'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Event Name <span className='text-red-500'>*</span>
              </label>
              <input
                id='event-name'
                type='text'
                placeholder='e.g. Sequencing_Run_Complete'
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400'
              />
            </div>

            <div>
              <label
                htmlFor='event-topic'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Topic
              </label>
              <input
                id='event-topic'
                type='text'
                placeholder='e.g. orcabus.bcl.converted'
                value={form.topic}
                onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
                className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400'
              />
            </div>

            <div>
              <label
                htmlFor='event-condition'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Condition
              </label>
              <input
                id='event-condition'
                type='text'
                placeholder="e.g. Status == 'PASS'"
                value={form.condition}
                onChange={(e) => setForm((p) => ({ ...p, condition: e.target.value }))}
                className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400'
              />
            </div>

            <div>
              <div className='mb-1.5 flex items-center justify-between'>
                <label
                  htmlFor='event-payload'
                  className='block text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Payload (JSON)
                </label>
                <button
                  type='button'
                  onClick={formatPayloadJson}
                  className='rounded px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#9dabb9] dark:hover:bg-[#2d3540] dark:hover:text-white'
                >
                  Format
                </button>
              </div>
              <textarea
                id='event-payload'
                value={form.payloadJson}
                onChange={(e) => setForm((p) => ({ ...p, payloadJson: e.target.value }))}
                onBlur={handlePayloadBlur}
                rows={6}
                className='w-full rounded-lg border border-slate-200 bg-slate-50 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400'
                placeholder='{}'
              />
              {payloadError && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{payloadError}</p>
              )}
              <p className='mt-1.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#9dabb9]'>
                <Info className='h-3.5 w-3.5 shrink-0' />
                Ensure payload follows the Orcabus schema definition.
              </p>
            </div>
          </div>

          <div className='flex justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-[#2d3540]'>
            <button
              type='button'
              onClick={onClose}
              className='rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            >
              {mode === 'add' ? 'Save Event' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
