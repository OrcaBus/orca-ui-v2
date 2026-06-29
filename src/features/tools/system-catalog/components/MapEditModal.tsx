import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, ChevronDown, NotebookText } from 'lucide-react';
import type { SystemCatalogMapStatus } from '../api/system-catalog.api';
import { DialogFrame } from '@/components/modals/DialogFrame';

// ─── Helpers ────────────────────────────────────────────────────────────────

function parseTagsJson(value: string): Record<string, string> | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Object.values(parsed as Record<string, unknown>).every((v) => typeof v === 'string')
    ) {
      return parsed as Record<string, string>;
    }
  } catch {
    // ignore
  }
  return null;
}

function tryPrettyTagsJson(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

// ─── Schema ─────────────────────────────────────────────────────────────────

const mapFormSchema = z.object({
  name: z.string().min(1, 'Map name is required'),
  description: z.string(),
  status: z.enum(['active', 'draft', 'archived']),
  tagsJson: z
    .string()
    .refine(
      (value) => parseTagsJson(value) !== null,
      'Tags must be a JSON object with string values'
    ),
});

export type MapFormData = z.infer<typeof mapFormSchema>;

// ─── Constants ──────────────────────────────────────────────────────────────

const STATUS_OPTIONS: Array<{ value: SystemCatalogMapStatus; label: string; description: string }> =
  [
    { value: 'draft', label: 'Draft', description: 'Work in progress' },
    { value: 'active', label: 'Active', description: 'Production ready' },
    { value: 'archived', label: 'Archived', description: 'No longer in use' },
  ];

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

// ─── Props ──────────────────────────────────────────────────────────────────

interface MapEditModalProps {
  isOpen: boolean;
  initialData: MapFormData;
  isEditing: boolean;
  onSubmit: (data: MapFormData) => void | Promise<void>;
  onClose: () => void;
  /** Override the dialog title (defaults to Edit/Create based on `isEditing`). */
  title?: string;
  /** Override the dialog subtitle. */
  description?: string;
  /** Override the submit button label. */
  submitLabel?: string;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function MapEditModal({
  isOpen,
  initialData,
  isEditing,
  onSubmit,
  onClose,
  title,
  description,
  submitLabel,
}: MapEditModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<MapFormData>({
    resolver: zodResolver(mapFormSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const tagsJson = useWatch({ control, name: 'tagsJson', defaultValue: '{}' }) ?? '{}';

  useEffect(() => {
    if (isOpen && !isSubmitting) {
      reset(initialData);
    }
  }, [isOpen, initialData, isSubmitting, reset]);

  const [tagKey, setTagKey] = useState('');
  const [tagValue, setTagValue] = useState('');

  const formatTagsJson = () => {
    const pretty = tryPrettyTagsJson(tagsJson);
    setValue('tagsJson', pretty, { shouldValidate: true });
  };

  const handleTagsBlur = () => {
    const pretty = tryPrettyTagsJson(tagsJson);
    if (pretty !== tagsJson) {
      setValue('tagsJson', pretty, { shouldValidate: true });
    }
  };

  const addTag = () => {
    const key = tagKey.trim();
    const value = tagValue.trim();
    if (!key) return;
    const current = parseTagsJson(tagsJson);
    if (!current) return;
    current[key] = value;
    setValue('tagsJson', JSON.stringify(current, null, 2), { shouldValidate: true });
    setTagKey('');
    setTagValue('');
  };

  const removeTag = (keyToRemove: string) => {
    const current = parseTagsJson(tagsJson);
    if (!current) return;
    delete current[keyToRemove];
    setValue('tagsJson', JSON.stringify(current, null, 2), { shouldValidate: true });
  };

  const parsedTags = parseTagsJson(tagsJson) ?? {};

  const handleClose = () => {
    reset();
    setTagKey('');
    setTagValue('');
    onClose();
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title={title ?? (isEditing ? 'Edit Map' : 'Create New Map')}
      description={
        description ?? (isEditing ? 'Update map properties.' : 'Set up a new map from scratch.')
      }
      icon={<NotebookText className='h-5 w-5' />}
      size='md'
      closeDisabled={isSubmitting}
      footer={
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='map-edit-form'
            disabled={!isValid || isSubmitting}
            className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
          >
            <Plus className='h-3.5 w-3.5' />
            {submitLabel ?? (isEditing ? 'Save Changes' : 'Create Map')}
          </button>
        </div>
      }
    >
      <form
        id='map-edit-form'
        onSubmit={(e) => void handleSubmit(onSubmit)(e)}
        className='space-y-4'
      >
        {/* Name */}
        <div>
          <label
            htmlFor='map-name'
            className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
          >
            Map Name <span className='text-red-500'>*</span>
          </label>
          <input
            id='map-name'
            type='text'
            placeholder='Enter map name'
            {...register('name')}
            className={`${inputClassName} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
          />
          {errors.name && (
            <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor='map-status'
            className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
          >
            Status
          </label>
          <div className='relative'>
            <select
              id='map-status'
              {...register('status')}
              className={inputClassName + ' appearance-none pr-8'}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.description}
                </option>
              ))}
            </select>
            <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor='map-description'
            className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
          >
            Description
          </label>
          <textarea
            id='map-description'
            placeholder='Describe the purpose and scope of this map...'
            rows={3}
            {...register('description')}
            className={inputClassName + ' resize-none'}
          />
        </div>

        {/* Tags — visual pill manager */}
        <div>
          <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
            Tags
          </label>

          {/* Existing tags as pills */}
          {Object.keys(parsedTags).length > 0 && (
            <div className='mb-2 flex flex-wrap gap-1.5'>
              {Object.entries(parsedTags).map(([key, value]) => (
                <span
                  key={key}
                  className='inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-0.5 pr-1.5 pl-2.5 text-xs font-medium text-slate-600 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9]'
                >
                  <span className='text-slate-900 dark:text-white'>{key}</span>
                  <span className='text-slate-400 dark:text-[#6b7a8d]'>:</span>
                  <span>{value}</span>
                  <button
                    type='button'
                    onClick={() => removeTag(key)}
                    className='ml-0.5 rounded-full p-0.5 text-slate-300 transition-colors hover:bg-slate-200 hover:text-slate-500 dark:text-[#4a5568] dark:hover:bg-[#2d3540] dark:hover:text-white'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Add tag inline input */}
          <div className='flex items-center gap-2'>
            <input
              type='text'
              placeholder='Key'
              value={tagKey}
              onChange={(e) => setTagKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className={inputClassName + ' flex-1'}
            />
            <input
              type='text'
              placeholder='Value'
              value={tagValue}
              onChange={(e) => setTagValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className={inputClassName + ' flex-1'}
            />
            <button
              type='button'
              onClick={addTag}
              disabled={!tagKey.trim()}
              className='flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-[#2d3540] dark:hover:bg-[#1e252e] dark:hover:text-white'
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>

          {/* Raw JSON toggle */}
          <details className='mt-2'>
            <summary className='cursor-pointer text-xs text-slate-400 hover:text-slate-600 dark:text-[#6b7a8d] dark:hover:text-[#9dabb9]'>
              Edit raw JSON
            </summary>
            <div className='mt-1.5'>
              <div className='mb-1 flex items-center justify-end'>
                <button
                  type='button'
                  onClick={formatTagsJson}
                  className='rounded px-2 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#9dabb9] dark:hover:bg-[#2d3540] dark:hover:text-white'
                >
                  Format
                </button>
              </div>
              <textarea
                rows={3}
                {...register('tagsJson')}
                onBlur={handleTagsBlur}
                className={
                  inputClassName +
                  ' resize-none bg-slate-50 font-mono text-sm dark:bg-[#1e252e]' +
                  (errors.tagsJson
                    ? ' border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : '')
                }
                placeholder={'{\n  "key": "value"\n}'}
              />
              {errors.tagsJson && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                  {errors.tagsJson.message}
                </p>
              )}
            </div>
          </details>
        </div>
      </form>
    </DialogFrame>
  );
}
