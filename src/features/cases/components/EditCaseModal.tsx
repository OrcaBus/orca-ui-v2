import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { useCaseUpdateModel } from '../api/cases.api';
import { buildCaseUpdateRequest, editCaseSchema, type EditCaseFormValues } from '../utils/editCase';

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
  const { reset: resetUpdateMutation, mutateAsync: mutateAsyncUpdate } = useCaseUpdateModel();

  const form = useForm<EditCaseFormValues>({
    resolver: zodResolver(editCaseSchema),
    defaultValues: {
      dueDate: caseDetail?.dueDate ?? '',
      links: parseLinks(caseDetail?.links),
      description: caseDetail?.description ?? '',
    },
    mode: 'onChange',
  });

  const {
    formState: { errors, isSubmitting },
  } = form;

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
  } = useFieldArray({
    control: form.control,
    name: 'links',
  });

  useEffect(() => {
    if (!caseDetail) return;

    if (isOpen || !isSubmitting) {
      form.reset({
        dueDate: caseDetail.dueDate ?? '',
        links: parseLinks(caseDetail.links),
        description: caseDetail.description ?? '',
      });
    }
  }, [isOpen, caseDetail, form, isSubmitting]);

  const handleFormSubmit = async (values: EditCaseFormValues) => {
    if (!caseDetail) return;
    try {
      await mutateAsyncUpdate({
        params: { path: { orcabusId: caseDetail.orcabusId } },
        body: buildCaseUpdateRequest(values),
      });
      toast.success('Case updated successfully');
      resetUpdateMutation();
      refresh();
      onClose();
    } catch {
      toast.error('Failed to update case');
    }
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Case'
      description={
        <>
          Update case details for{' '}
          <span className='rounded bg-blue-100 px-1.5 py-0.5 font-mono text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'>
            {caseDetail?.orcabusId}
          </span>
          .
        </>
      }
      size='xl'
      panelClassName='flex max-h-[90vh] flex-col'
      bodyClassName='min-h-0 flex-1 overflow-y-auto px-6 py-5'
      footer={
        <>
          <Button
            variant='ghost'
            type='button'
            onClick={onClose}
            className='rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-[#2d3540] dark:text-slate-200 dark:hover:bg-[#2d3540]/80'
          >
            Cancel
          </Button>
          <Button type='submit' form='edit-case-form' disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <form id='edit-case-form' onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)}>
        {/* Due Date */}
        <div className='mb-5 space-y-2'>
          <label
            htmlFor='edit-dueDate'
            className='text-sm font-medium text-neutral-700 dark:text-neutral-300'
          >
            Due Date
          </label>
          <Input
            id='edit-dueDate'
            type='date'
            {...form.register('dueDate')}
            className='rounded-lg border-neutral-300 shadow-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
          />
        </div>

        {/* Links */}
        <div className='mb-5 space-y-2'>
          <div className='flex items-center justify-between'>
            <label className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>
              Links
            </label>
            <Button
              variant='ghost'
              type='button'
              onClick={() => appendLink({ key: '', value: '' })}
              className='flex items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-neutral-300 dark:hover:bg-[#1e252e]'
            >
              <Plus className='h-3 w-3' />
              Add Link
            </Button>
          </div>
          <div className='space-y-2'>
            {linkFields.map((field, idx) => (
              <div key={field.id} className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <Input
                    {...form.register(`links.${idx}.key`)}
                    placeholder='Name (e.g. trello)'
                    aria-invalid={!!errors.links?.[idx]?.key}
                    className='w-36 shrink-0 rounded-lg border-neutral-300 text-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
                  />
                  <Input
                    type='url'
                    {...form.register(`links.${idx}.value`)}
                    placeholder='https://...'
                    aria-invalid={!!errors.links?.[idx]?.value}
                    className='flex-1 rounded-lg border-neutral-300 text-sm dark:border-[#2d3540] dark:bg-[#1e252e]'
                  />
                  <Button
                    variant='ghost'
                    type='button'
                    onClick={() => removeLink(idx)}
                    aria-label={`Remove link ${idx + 1}`}
                    className='rounded p-1 text-neutral-400 transition-colors hover:text-red-500 dark:hover:text-red-400'
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                </div>
                {(errors.links?.[idx]?.key || errors.links?.[idx]?.value) && (
                  <p className='text-destructive text-sm'>
                    {errors.links[idx]?.key?.message ?? errors.links[idx]?.value?.message}
                  </p>
                )}
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
    </DialogFrame>
  );
}
