import { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { useLastPresent } from '@/hooks/useLastPresent';
import { tryPrettyJson } from '@/utils/json';
import type { EventDef } from '../data/dynamodb-schema';
import type { EventFormData } from '../types/system-catalog.types';
import { defaultEventFormData, eventDefToForm, formToEventDef } from '../utils/eventForm';

interface EventModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit' | null;
  variant: 'input' | 'output' | null;
  initialEvent?: EventDef;
  onSave: (event: EventDef) => void;
  onClose: () => void;
}

const FORM_ID = 'system-catalog-event-form';

export function EventModal({
  isOpen,
  mode,
  variant,
  initialEvent,
  onSave,
  onClose,
}: EventModalProps) {
  const [form, setForm] = useState<EventFormData>(defaultEventFormData);
  const [payloadError, setPayloadError] = useState<string | null>(null);
  const [wasOpen, setWasOpen] = useState(isOpen);

  // Re-sync the form each time the modal opens (adjust state while rendering — no
  // effect needed; the component stays mounted across open/close).
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setForm(initialEvent ? eventDefToForm(initialEvent) : defaultEventFormData);
      setPayloadError(null);
    }
  }

  // Keep mode/variant stable while the dialog animates closed.
  const shownMode = useLastPresent(mode) ?? 'add';
  const shownVariant = useLastPresent(variant) ?? 'input';
  const title = shownMode === 'add' ? 'Add Event' : 'Edit Event';
  const subtitle = shownVariant === 'input' ? 'Input event' : 'Output event';

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

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={subtitle}
      icon={<Zap className='h-5 w-5' />}
      size='lg'
      closeLabel='Close event editor'
      footer={
        <>
          <button
            type='button'
            onClick={onClose}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <Button type='submit' form={FORM_ID}>
            {shownMode === 'add' ? 'Save Event' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className='space-y-4'>
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
          <p className='text-muted-foreground mt-1.5 flex items-center gap-1.5 text-xs'>
            <Info className='h-3.5 w-3.5 shrink-0' />
            Ensure payload follows the Orcabus schema definition.
          </p>
        </div>
      </form>
    </DialogFrame>
  );
}
