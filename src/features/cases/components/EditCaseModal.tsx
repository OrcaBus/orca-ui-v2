import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { useCaseUpdateModel, type CaseTypeEnum, type CaseStudyTypeEnum } from '../api/cases.api';

const CASE_TYPES: { value: CaseTypeEnum; label: string }[] = [
  { value: 'wgts', label: 'WGTS T-N' },
  { value: 'cttso', label: 'ctTSO500' },
  { value: 'wgs_n', label: 'WGS_N' },
];

const STUDY_TYPES: { value: CaseStudyTypeEnum; label: string }[] = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
];

const editCaseSchema = z.object({
  requestFormId: z.string().min(1, 'Request Form ID is required'),
  type: z.enum(['wgts', 'cttso', 'wgs_n']),
  studyType: z.enum(['clinical', 'research']),
  isReportRequired: z.boolean(),
  isNataAccredited: z.boolean(),
  alias: z.array(z.object({ value: z.string() })),
  links: z.array(z.object({ key: z.string(), value: z.string() })),
  description: z.string(),
});

type EditCaseFormValues = z.infer<typeof editCaseSchema>;

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function parseLinks(links: unknown): { key: string; value: string }[] {
  if (!links || typeof links !== 'object' || Array.isArray(links)) return [];
  return Object.entries(links as Record<string, string>).map(([key, value]) => ({ key, value }));
}

export function EditCaseModal({ isOpen, onClose }: EditCaseModalProps) {
  const { caseDetail, refresh } = useCaseDetailsContext();
  const updateMutation = useCaseUpdateModel();

  const form = useForm<EditCaseFormValues>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      requestFormId: caseDetail?.requestFormId ?? '',
      type: caseDetail?.type ?? 'wgts',
      studyType: caseDetail?.studyType ?? 'clinical',
      isReportRequired: caseDetail?.isReportRequired ?? false,
      isNataAccredited: caseDetail?.isNataAccredited ?? false,
      alias: (caseDetail?.alias ?? []).map((v) => ({ value: v })),
      links: parseLinks(caseDetail?.links),
      description: caseDetail?.description ?? '',
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: aliasFields,
    append: appendAlias,
    remove: removeAlias,
  } = useFieldArray({
    control: form.control,
    name: 'alias',
  });

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  useEffect(() => {
    if (isOpen && caseDetail) {
      form.reset({
        requestFormId: caseDetail.requestFormId,
        type: caseDetail.type,
        studyType: caseDetail.studyType,
        isReportRequired: caseDetail.isReportRequired ?? false,
        isNataAccredited: caseDetail.isNataAccredited ?? false,
        alias: (caseDetail.alias ?? []).map((v) => ({ value: v })),
        links: parseLinks(caseDetail.links),
        description: caseDetail.description ?? '',
      });
    }
  }, [isOpen, caseDetail, form]);

  const handleClose = () => {
    form.reset();
    updateMutation.reset();
    onClose();
  };

  const handleFormSubmit = async (values: EditCaseFormValues) => {
    if (!caseDetail) return;
    try {
      await updateMutation.mutateAsync({
        params: { path: { orcabusId: caseDetail.orcabusId } },
        body: {
          requestFormId: values.requestFormId,
          type: values.type,
          studyType: values.studyType,
          isReportRequired: values.isReportRequired,
          isNataAccredited: values.isNataAccredited,
          alias: values.alias.map((a) => a.value).filter(Boolean),
          links: Object.fromEntries(values.links.map(({ key, value }) => [key, value])),
          description: values.description || null,
        },
      });
      toast.success('Case updated successfully');
      refresh();
      handleClose();
    } catch {
      toast.error('Failed to update case');
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />

      <div className='relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-transparent bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        {/* Header */}
        <div className='border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-[#2d3540]'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                Edit Case
              </h2>
              <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
                Update case details for{' '}
                <span className='rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'>
                  {caseDetail?.orcabusId}
                </span>
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className='overflow-y-auto px-6 py-5'>
          <form id='edit-case-form' onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)}>
            {/* Request Form ID */}
            <div className='mb-5 space-y-2'>
              <label
                htmlFor='edit-requestFormId'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Request Form ID <span className='text-red-500 dark:text-red-400'>*</span>
              </label>
              <Input
                id='edit-requestFormId'
                {...form.register('requestFormId')}
                placeholder='e.g. 1000060'
                className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
              />
              {errors.requestFormId && (
                <p className='text-sm text-red-500 dark:text-red-400'>
                  {errors.requestFormId.message}
                </p>
              )}
            </div>

            {/* Type + Study Type */}
            <div className='mb-5 grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label
                  htmlFor='edit-type'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Type <span className='text-red-500 dark:text-red-400'>*</span>
                </label>
                <select
                  id='edit-type'
                  {...form.register('type')}
                  className='w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                >
                  {CASE_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className='space-y-2'>
                <label
                  htmlFor='edit-studyType'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Study Type <span className='text-red-500 dark:text-red-400'>*</span>
                </label>
                <select
                  id='edit-studyType'
                  {...form.register('studyType')}
                  className='w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                >
                  {STUDY_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Links */}
            <div className='mb-5 space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                  Links
                </label>
                <button
                  type='button'
                  onClick={() => appendLink({ key: '', value: '' })}
                  className='flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-neutral-300 dark:hover:bg-[#1e252e]'
                >
                  <Plus className='h-3 w-3' />
                  Add Link
                </button>
              </div>
              <div className='space-y-2'>
                {linkFields.map((field, idx) => (
                  <div key={field.id} className='flex items-center gap-2'>
                    <Input
                      {...form.register(`links.${idx}.key`)}
                      placeholder='Name (e.g. trello)'
                      className='w-36 shrink-0 rounded-lg border-neutral-300 text-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
                    />
                    <Input
                      {...form.register(`links.${idx}.value`)}
                      placeholder='URL'
                      className='flex-1 rounded-lg border-neutral-300 text-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
                    />
                    <button
                      type='button'
                      onClick={() => removeLink(idx)}
                      className='rounded p-1 text-neutral-400 transition-colors hover:text-red-500 dark:hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkboxes */}
            <div className='mb-5 space-y-3'>
              <label className='flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300'>
                <input
                  type='checkbox'
                  {...form.register('isReportRequired')}
                  className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-[#2d3540] dark:bg-[#1e252e]'
                />
                Report Required
              </label>
              <label className='flex cursor-pointer items-center gap-2 text-sm text-neutral-700 dark:text-neutral-300'>
                <input
                  type='checkbox'
                  {...form.register('isNataAccredited')}
                  className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-[#2d3540] dark:bg-[#1e252e]'
                />
                NATA Accredited
              </label>
            </div>

            {/* Alias */}
            <div className='mb-5 space-y-2'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
                  Alias
                </label>
                <button
                  type='button'
                  onClick={() => appendAlias({ value: '' })}
                  className='flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-neutral-300 dark:hover:bg-[#1e252e]'
                >
                  <Plus className='h-3 w-3' />
                  Add Alias
                </button>
              </div>
              <div className='space-y-2'>
                {aliasFields.map((field, idx) => (
                  <div key={field.id} className='flex items-center gap-2'>
                    <Input
                      {...form.register(`alias.${idx}.value`)}
                      placeholder='Alias value'
                      className='flex-1 rounded-lg border-neutral-300 text-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
                    />
                    <button
                      type='button'
                      onClick={() => removeAlias(idx)}
                      className='rounded p-1 text-neutral-400 transition-colors hover:text-red-500 dark:hover:text-red-400'
                    >
                      <Trash2 className='h-4 w-4' />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className='mb-4 space-y-2'>
              <label
                htmlFor='edit-description'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Description
              </label>
              <Textarea
                id='edit-description'
                {...form.register('description')}
                placeholder='Enter case description'
                rows={4}
                className='min-h-0 resize-none rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 border-t border-neutral-200 px-6 py-4 dark:border-[#2d3540]'>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
          >
            Cancel
          </button>
          <button
            type='submit'
            form='edit-case-form'
            disabled={isSubmitting}
            className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 dark:bg-[#137fec] dark:hover:bg-blue-600'
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
