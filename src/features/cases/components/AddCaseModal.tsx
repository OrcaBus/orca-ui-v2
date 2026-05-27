import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { cn } from '@/utils/cn';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { useCaseCreateModel, CASE_LIST_PATH } from '../api/cases.api';
import type { CaseRequestModel, CaseTypeEnum, CaseStudyTypeEnum } from '../api/cases.api';

// ─── constants ────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: CaseTypeEnum; label: string }[] = [
  { value: 'wgts', label: 'WGTS' },
  { value: 'cttso', label: 'ctTSO' },
  { value: 'wgs_n', label: 'WGS-N' },
];

const STUDY_TYPE_OPTIONS: { value: CaseStudyTypeEnum; label: string }[] = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
];

// ─── form schema ──────────────────────────────────────────────────────────────

// ─── form schema ──────────────────────────────────────────────────────────────

const addCaseSchema = z.object({
  requestFormId: z.string().min(1, 'Request Form ID is required'),
  type: z.enum(['wgts', 'cttso', 'wgs_n']),
  studyType: z.enum(['clinical', 'research']),
  isReportRequired: z.boolean(),
  isNataAccredited: z.boolean(),
  alias: z.array(z.object({ value: z.string() })),
  description: z.string(),
  links: z.array(z.object({ name: z.string(), url: z.string() })),
});

type FormValues = z.infer<typeof addCaseSchema>;

const DEFAULT_VALUES: FormValues = {
  requestFormId: '',
  type: 'wgts',
  studyType: 'research',
  isReportRequired: false,
  isNataAccredited: false,
  alias: [],
  description: '',
  links: [],
};

// ─── public types ─────────────────────────────────────────────────────────────

// Callers receive the API-shaped value on submit
export type AddCaseFormValues = CaseRequestModel;

export interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

function toRequestModel(values: FormValues): AddCaseFormValues {
  const linksDict: Record<string, string> = {};
  values.links.forEach(({ name, url }) => {
    if (name.trim() && url.trim()) linksDict[name.trim()] = url.trim();
  });
  return {
    requestFormId: values.requestFormId,
    type: values.type,
    studyType: values.studyType,
    isReportRequired: values.isReportRequired,
    isNataAccredited: values.isNataAccredited,
    alias: values.alias.map((a) => a.value).filter(Boolean),
    description: values.description || null,
    links: Object.keys(linksDict).length ? linksDict : undefined,
  };
}

const inputCls =
  'w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm ' +
  'focus:ring-2 focus:ring-blue-500 focus:outline-none ' +
  'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-100 dark:focus:ring-[#137fec]';

const labelCls = 'block text-sm font-medium text-neutral-700 dark:text-neutral-300';

const errorCls = 'text-sm font-medium text-red-500 dark:text-red-400';

// ─── component ────────────────────────────────────────────────────────────────

export function AddCaseModal({ isOpen, onClose, onSuccess }: AddCaseModalProps) {
  const queryClient = useQueryClient();
  const { mutateAsync: createCase } = useCaseCreateModel();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(addCaseSchema),
    defaultValues: DEFAULT_VALUES,
    mode: 'onChange',
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({ control, name: 'links' });

  const {
    fields: aliasFields,
    append: appendAlias,
    remove: removeAlias,
  } = useFieldArray({ control, name: 'alias' });

  useEffect(() => {
    if (isOpen) reset(DEFAULT_VALUES);
  }, [isOpen, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    try {
      await createCase({ body: toRequestModel(values) });
      await queryClient.invalidateQueries({ queryKey: ['get', CASE_LIST_PATH] });
      toast.success('Case created successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error('Failed to create case');
      console.error('Error creating case:', error);
    }
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Create New Case'
      description='Fill in the details below to create a new case.'
      icon={<Briefcase className='h-5 w-5' />}
      size='xl'
      footer={
        <div className='flex items-center justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            className={cn(
              'cursor-pointer rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors',
              'hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50',
              'focus:ring-2 focus:ring-blue-500 focus:outline-none',
              'dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
            )}
          >
            Cancel
          </button>
          <button
            type='submit'
            form='add-case-form'
            disabled={isSubmitting}
            className={cn(
              'cursor-pointer rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white transition-colors',
              'hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'dark:bg-green-700 dark:hover:bg-green-600'
            )}
          >
            {isSubmitting ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      }
    >
      <form
        id='add-case-form'
        onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}
        className='space-y-5'
      >
        {/* Request Form ID */}
        <div className='space-y-1.5'>
          <label htmlFor='add-case-requestFormId' className={labelCls}>
            Request Form Id
          </label>
          <input
            id='add-case-requestFormId'
            type='text'
            placeholder='Enter case requestFormId'
            aria-invalid={!!errors.requestFormId}
            {...register('requestFormId')}
            className={inputCls}
          />
          {errors.requestFormId && <p className={errorCls}>{errors.requestFormId.message}</p>}
        </div>

        {/* Type + Study Type */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1.5'>
            <label htmlFor='add-case-type' className={labelCls}>
              Type
            </label>
            <select id='add-case-type' {...register('type')} className={inputCls}>
              {TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className='space-y-1.5'>
            <label htmlFor='add-case-studyType' className={labelCls}>
              Study Type
            </label>
            <select id='add-case-studyType' {...register('studyType')} className={inputCls}>
              {STUDY_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Links */}
        <div className='space-y-1.5'>
          <label className={labelCls}>Links</label>
          <div className='space-y-2'>
            {linkFields.map((field, idx) => (
              <div key={field.id} className='flex items-center gap-2'>
                <input
                  type='text'
                  placeholder='Link name'
                  {...register(`links.${idx}.name`)}
                  className={cn(inputCls, 'flex-1')}
                />
                <input
                  type='url'
                  placeholder='https://...'
                  {...register(`links.${idx}.url`)}
                  className={cn(inputCls, 'flex-2')}
                />
                <button
                  type='button'
                  onClick={() => removeLink(idx)}
                  className='shrink-0 rounded px-2 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type='button'
            onClick={() => appendLink({ name: '', url: '' })}
            className='flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
          >
            <Plus className='h-3.5 w-3.5' />
            Add Link
          </button>
        </div>

        {/* Checkboxes */}
        <div className='flex flex-col gap-3'>
          <label className='flex cursor-pointer items-center gap-2.5'>
            <input
              type='checkbox'
              {...register('isReportRequired')}
              className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-[#2d3540]'
            />
            <span className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Report Required
            </span>
          </label>
          <label className='flex cursor-pointer items-center gap-2.5'>
            <input
              type='checkbox'
              {...register('isNataAccredited')}
              className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-[#2d3540]'
            />
            <span className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              NATA Accredited
            </span>
          </label>
        </div>

        {/* Alias */}
        <div className='space-y-1.5'>
          <label className={labelCls}>Alias</label>
          <div className='space-y-2'>
            {aliasFields.map((field, idx) => (
              <div key={field.id} className='flex items-center gap-2'>
                <input
                  type='text'
                  placeholder='Enter alias'
                  {...register(`alias.${idx}.value`)}
                  className={cn(inputCls, 'flex-1')}
                />
                <button
                  type='button'
                  onClick={() => removeAlias(idx)}
                  className='shrink-0 rounded px-2 py-1.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10'
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <button
            type='button'
            onClick={() => appendAlias({ value: '' })}
            className='flex items-center gap-1 rounded px-2 py-1 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10'
          >
            <Plus className='h-3.5 w-3.5' />
            Add Alias
          </button>
        </div>

        {/* Description */}
        <div className='space-y-1.5'>
          <label htmlFor='add-case-description' className={labelCls}>
            Description
          </label>
          <textarea
            id='add-case-description'
            rows={4}
            placeholder='Enter case description'
            {...register('description')}
            className={cn(inputCls, 'resize-none')}
          />
        </div>
      </form>
    </DialogFrame>
  );
}
