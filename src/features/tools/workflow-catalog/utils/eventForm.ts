import type { EventDef, EventFormData } from '../types/workflow-catalog.types';

export const defaultEventFormData: EventFormData = {
  name: '',
  topic: '',
  condition: '',
  payloadJson: '{}',
};

export function eventDefToForm(evt: EventDef): EventFormData {
  return {
    name: evt.name,
    topic: evt.topic ?? '',
    condition: evt.condition ?? '',
    payloadJson: JSON.stringify(evt.payload, null, 2),
  };
}

export function formToEventDef(form: EventFormData): EventDef | null {
  if (!form.name.trim()) return null;
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(form.payloadJson || '{}') as Record<string, unknown>;
  } catch {
    return null;
  }
  return {
    name: form.name.trim(),
    ...(form.topic.trim() ? { topic: form.topic.trim() } : {}),
    ...(form.condition.trim() ? { condition: form.condition.trim() } : {}),
    payload,
  };
}
