import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown, Plus } from 'lucide-react';
import { ANALYSIS_LIST, ENGINE_COLORS } from '../data';

export interface WorkflowFormData {
  name: string;
  version: string;
  engine: string;
  analysisId: string;
  parentNodeIds: string[];
  description: string;
}

const workflowFormSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  version: z.string(),
  engine: z.string().min(1),
  analysisId: z.string(),
  parentNodeIds: z.array(z.string()),
  description: z.string(),
});

const ENGINE_OPTIONS = Object.keys(ENGINE_COLORS);
const ANALYSIS_OPTIONS = ANALYSIS_LIST.filter((a) => a.id !== 'ALL');

interface WorkflowModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: WorkflowFormData;
  allWorkflowIds: string[];
  allWorkflowLabels: Record<string, string>;
  onSubmit: (data: WorkflowFormData) => void;
  onClose: () => void;
}

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

export function WorkflowModal({
  isOpen,
  editingId,
  initialData,
  allWorkflowIds,
  allWorkflowLabels,
  onSubmit,
  onClose,
}: WorkflowModalProps) {
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowFormSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const parentNodeIds = useWatch({ control, name: 'parentNodeIds', defaultValue: [] }) ?? [];

  useEffect(() => {
    if (isOpen) reset(initialData);
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as HTMLElement)) {
        setIsParentDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const isEditing = editingId !== null;
  const availableParents = allWorkflowIds.filter(
    (id) => id !== editingId && !parentNodeIds.includes(id)
  );

  const onFormSubmit = (data: WorkflowFormData) => {
    onSubmit(data);
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' onClick={handleClose} />
      <div className='relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)} className='contents'>
          {/* Header */}
          <div className='flex items-start justify-between px-6 pt-6 pb-2'>
            <div>
              <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
                {isEditing ? 'Edit Workflow Node' : 'Add New Workflow Node'}
              </h2>
              <p className='mt-0.5 text-sm text-slate-500 dark:text-[#9dabb9]'>
                {isEditing
                  ? 'Update the properties for this workflow node.'
                  : 'Configure the properties for the new node in your workflow diagram.'}
              </p>
            </div>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#1e252e] dark:hover:text-white'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          {/* Form fields */}
          <div className='space-y-5 px-6 py-4'>
            {/* Workflow Name */}
            <div>
              <label
                htmlFor='workflow-name'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Workflow Name <span className='text-red-500'>*</span>
              </label>
              <input
                id='workflow-name'
                type='text'
                placeholder='Enter workflow name'
                {...register('name')}
                className={`${inputClassName} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name.message}</p>
              )}
            </div>

            {/* Version */}
            <div>
              <label
                htmlFor='workflow-version'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Version
              </label>
              <input
                id='workflow-version'
                type='text'
                placeholder='e.g. 1.0.0'
                {...register('version')}
                className={inputClassName}
              />
            </div>

            {/* Execution Engine */}
            <div>
              <label
                htmlFor='workflow-engine'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Execution Engine
              </label>
              <div className='relative'>
                <select
                  id='workflow-engine'
                  {...register('engine')}
                  className={inputClassName + ' appearance-none pr-8'}
                >
                  {ENGINE_OPTIONS.map((engine) => (
                    <option key={engine} value={engine}>
                      {engine}
                    </option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              </div>
            </div>

            {/* Analysis Type */}
            <div>
              <label
                htmlFor='workflow-analysis'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Analysis Type
              </label>
              <div className='relative'>
                <select
                  id='workflow-analysis'
                  {...register('analysisId')}
                  className={inputClassName + ' appearance-none pr-8'}
                >
                  <option value=''>None</option>
                  {ANALYSIS_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              </div>
            </div>

            {/* Parent Nodes */}
            <div>
              <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                Parent Nodes
              </label>
              <div className='relative' ref={dropdownRef}>
                <div
                  className='flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]'
                  onClick={() => setIsParentDropdownOpen(true)}
                >
                  {parentNodeIds.map((id) => (
                    <span
                      key={id}
                      className='inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                    >
                      {allWorkflowLabels[id] ?? id}
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation();
                          setValue(
                            'parentNodeIds',
                            parentNodeIds.filter((pid) => pid !== id),
                            { shouldValidate: true }
                          );
                        }}
                        className='ml-0.5 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-500/30'
                      >
                        <X className='h-2.5 w-2.5' />
                      </button>
                    </span>
                  ))}
                  {parentNodeIds.length === 0 && (
                    <span className='text-sm text-slate-400 dark:text-[#9dabb9]'>
                      Select parent nodes...
                    </span>
                  )}
                  <button
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsParentDropdownOpen((p) => !p);
                    }}
                    className='ml-auto shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                  >
                    <Plus className='h-4 w-4' />
                  </button>
                </div>

                {isParentDropdownOpen && availableParents.length > 0 && (
                  <div className='absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#2d3540] dark:bg-[#1e252e]'>
                    {availableParents.map((id) => (
                      <button
                        key={id}
                        type='button'
                        onClick={() => {
                          setValue('parentNodeIds', [...parentNodeIds, id], {
                            shouldValidate: true,
                          });
                          setIsParentDropdownOpen(false);
                        }}
                        className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                      >
                        <div
                          className='h-2 w-2 rounded-full'
                          style={{
                            background: ENGINE_COLORS[allWorkflowLabels[id] ? '' : ''] ?? '#6b7280',
                          }}
                        />
                        {allWorkflowLabels[id] ?? id}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor='workflow-description'
                className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
              >
                Description
              </label>
              <textarea
                id='workflow-description'
                placeholder="Enter a brief description of the node's role..."
                rows={3}
                {...register('description')}
                className={inputClassName + ' resize-none'}
              />
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-[#2d3540]'>
            <button
              type='button'
              onClick={handleClose}
              className='rounded-lg px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={!isValid || isSubmitting}
              className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600'
            >
              <Plus className='h-3.5 w-3.5' />
              {isEditing ? 'Save Changes' : 'Add Node'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
