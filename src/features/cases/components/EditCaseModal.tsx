import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import type { Case } from '../types/case.types';

const CASE_TYPES = [
  { value: 'clinical', label: 'Clinical' },
  { value: 'research', label: 'Research' },
  { value: 'validation', label: 'Validation' },
  { value: 'qc', label: 'QC' },
] as const;

const CASE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'archived', label: 'Archived' },
] as const;

const editCaseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  alias: z.string(),
  description: z.string(),
  caseType: z.string().min(1, 'Type is required'),
  status: z.enum(['active', 'pending', 'archived']),
});

export type EditCaseFormValues = z.infer<typeof editCaseSchema>;

interface EditCaseModalProps {
  isOpen: boolean;
  case_: Case;
  onClose: () => void;
  onSubmit: (values: EditCaseFormValues) => void;
}

export function EditCaseModal({ isOpen, case_, onClose, onSubmit }: EditCaseModalProps) {
  const form = useForm<EditCaseFormValues>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      title: case_.title,
      alias: case_.alias ?? '',
      description: case_.description ?? '',
      caseType: case_.type,
      status: case_.status,
    },
    mode: 'onChange',
  });
  const {
    formState: { errors },
  } = form;

  useEffect(() => {
    if (isOpen && case_) {
      form.reset({
        title: case_.title,
        alias: case_.alias ?? '',
        description: case_.description ?? '',
        caseType: case_.type,
        status: case_.status,
      });
    }
  }, [isOpen, case_, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleFormSubmit = (values: EditCaseFormValues) => {
    onSubmit(values);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/50' onClick={handleClose} />

      <div className='relative w-full max-w-lg rounded-xl border border-transparent bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <div className='border-b border-neutral-200 px-6 pt-6 pb-4 dark:border-[#2d3540]'>
          <div className='flex items-start justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-neutral-900 dark:text-slate-100'>
                Edit Case
              </h2>
              <p className='mt-0.5 text-sm text-neutral-500 dark:text-[#9dabb9]'>
                Update case metadata. Linked libraries cannot be changed here.
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

        <div className='px-6 py-5'>
          <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)}>
            <div className='mb-5 grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <label
                  htmlFor='edit-case-title'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Title <span className='text-red-500 dark:text-red-400'>*</span>
                </label>
                <Input
                  id='edit-case-title'
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'edit-case-title-error' : undefined}
                  {...form.register('title')}
                  placeholder='e.g. Lung Cancer Study 2024'
                  className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                />
                {errors.title && (
                  <p
                    id='edit-case-title-error'
                    className='text-sm font-medium text-red-500 dark:text-red-400'
                  >
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className='space-y-2'>
                <label
                  htmlFor='edit-case-alias'
                  className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
                >
                  Alias
                </label>
                <Input
                  id='edit-case-alias'
                  aria-invalid={!!errors.alias}
                  aria-describedby={errors.alias ? 'edit-case-alias-error' : undefined}
                  {...form.register('alias')}
                  placeholder='Internal ID (Optional)'
                  className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
                />
                {errors.alias && (
                  <p
                    id='edit-case-alias-error'
                    className='text-sm font-medium text-red-500 dark:text-red-400'
                  >
                    {errors.alias.message}
                  </p>
                )}
              </div>
            </div>

            <div className='mb-5 space-y-2'>
              <label
                htmlFor='edit-case-type'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Type <span className='text-red-500 dark:text-red-400'>*</span>
              </label>
              <select
                id='edit-case-type'
                aria-invalid={!!errors.caseType}
                aria-describedby={errors.caseType ? 'edit-case-type-error' : undefined}
                {...form.register('caseType')}
                className='w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
              >
                <option value='' disabled>
                  Select case type
                </option>
                {CASE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.caseType && (
                <p
                  id='edit-case-type-error'
                  className='text-sm font-medium text-red-500 dark:text-red-400'
                >
                  {errors.caseType.message}
                </p>
              )}
            </div>

            <div className='mb-5 space-y-2'>
              <label
                htmlFor='edit-case-status'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Status
              </label>
              <select
                id='edit-case-status'
                aria-invalid={!!errors.status}
                aria-describedby={errors.status ? 'edit-case-status-error' : undefined}
                {...form.register('status')}
                className='w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
              >
                {CASE_STATUSES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p
                  id='edit-case-status-error'
                  className='text-sm font-medium text-red-500 dark:text-red-400'
                >
                  {errors.status.message}
                </p>
              )}
            </div>

            <div className='mb-6 space-y-2'>
              <label
                htmlFor='edit-case-description'
                className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
              >
                Description
              </label>
              <Textarea
                id='edit-case-description'
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'edit-case-description-error' : undefined}
                {...form.register('description')}
                placeholder='Enter detailed description regarding the study goals, methodology or special handling requirements...'
                rows={4}
                className='min-h-0 resize-none rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e] dark:focus:border-[#137fec] dark:focus:ring-[#137fec]'
              />
              {errors.description && (
                <p
                  id='edit-case-description-error'
                  className='text-sm font-medium text-red-500 dark:text-red-400'
                >
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className='flex items-center justify-end gap-3 border-t border-neutral-200 pt-4 dark:border-[#2d3540]'>
              <button
                type='button'
                onClick={handleClose}
                className='rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
              >
                Cancel
              </button>
              <button
                type='submit'
                className='rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-[#137fec] dark:hover:bg-blue-600'
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
