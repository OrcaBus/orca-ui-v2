import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown, Plus } from 'lucide-react';
import { tryPrettyJson } from '@/utils/json';
import { GROUP_LIST, ENGINE_COLORS } from '../data';
import type { EdgeType, WorkflowFormData, WorkflowNodeData } from '../types/workflow-catalog.types';
import { parseWorkflowConfigJson } from '../utils/workflowForm';

const workflowFormSchema = z.object({
  name: z.string().min(1, 'Workflow name is required'),
  version: z.string(),
  engine: z.string().min(1),
  groupId: z.string(),
  parentLinks: z.array(
    z.object({
      workflowId: z.string().min(1),
      edgeType: z.enum(['trigger', 'trigger_input', 'input_dependency']),
    })
  ),
  description: z.string(),
  configJson: z
    .string()
    .refine(
      (value) => parseWorkflowConfigJson(value) !== null,
      'Tags must be a JSON object with string values'
    ),
});

const ENGINE_OPTIONS = Object.keys(ENGINE_COLORS);
const GROUP_OPTIONS = GROUP_LIST.filter((a) => a.id !== 'ALL');
const EDGE_TYPE_OPTIONS: Array<{ value: EdgeType; label: string }> = [
  { value: 'trigger', label: 'Trigger only' },
  { value: 'trigger_input', label: 'Trigger + input' },
  { value: 'input_dependency', label: 'Input only' },
];

interface WorkflowModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: WorkflowFormData;
  allWorkflows: Record<string, Pick<WorkflowNodeData, 'label' | 'engine'>>;
  onSubmit: (data: WorkflowFormData) => void;
  onClose: () => void;
}

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

export function WorkflowModal({
  isOpen,
  editingId,
  initialData,
  allWorkflows,
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

  const parentLinks = useWatch({ control, name: 'parentLinks', defaultValue: [] }) ?? [];
  const configJson = useWatch({ control, name: 'configJson', defaultValue: '{}' }) ?? '{}';

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
  const availableParents = Object.entries(allWorkflows).filter(
    ([id]) => id !== editingId && !parentLinks.some((parentLink) => parentLink.workflowId === id)
  );

  const formatConfigJson = () => {
    const pretty = tryPrettyJson(configJson);
    setValue('configJson', pretty, { shouldValidate: true });
  };

  const handleConfigBlur = () => {
    const pretty = tryPrettyJson(configJson);
    if (pretty !== configJson) {
      setValue('configJson', pretty, { shouldValidate: true });
    }
  };

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
      <div className='relative flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)} className='contents'>
          {/* Header */}
          <div className='flex shrink-0 items-start justify-between px-6 pt-6 pb-2'>
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

          {/* Form fields — scrollable area */}
          <div className='overflow-y-auto px-6 py-4'>
            <div className='grid grid-cols-2 gap-x-5 gap-y-4'>
              {/* Row 1: Name + Version */}
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
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.name.message}
                  </p>
                )}
              </div>
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

              {/* Row 2: Engine + Group */}
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
              <div>
                <label
                  htmlFor='workflow-group'
                  className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Group
                </label>
                <div className='relative'>
                  <select
                    id='workflow-group'
                    {...register('groupId')}
                    className={inputClassName + ' appearance-none pr-8'}
                  >
                    <option value=''>None</option>
                    {GROUP_OPTIONS.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
                </div>
              </div>

              {/* Row 3: Parent Nodes — full width */}
              <div className='col-span-2'>
                <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Parent Nodes
                </label>
                <div className='relative' ref={dropdownRef}>
                  <div
                    className='flex min-h-10.5 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]'
                    onClick={() => setIsParentDropdownOpen(true)}
                  >
                    <span className='min-w-0 flex-1 text-sm text-slate-400 dark:text-[#9dabb9]'>
                      {parentLinks.length === 0
                        ? 'Select parent nodes...'
                        : `${parentLinks.length} parent node${parentLinks.length === 1 ? '' : 's'} selected`}
                    </span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsParentDropdownOpen((open) => !open);
                      }}
                      className='ml-auto shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                    >
                      <Plus className='h-4 w-4' />
                    </button>
                  </div>

                  {parentLinks.length > 0 && (
                    <div className='mt-2 grid grid-cols-2 gap-2'>
                      {parentLinks.map((parentLink) => {
                        const parentWorkflow = allWorkflows[parentLink.workflowId];
                        const engineColor = parentWorkflow
                          ? (ENGINE_COLORS[parentWorkflow.engine] ?? '#6b7280')
                          : '#6b7280';

                        return (
                          <div
                            key={parentLink.workflowId}
                            className='flex h-10.5 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 dark:border-[#2d3540] dark:bg-[#1e252e]'
                          >
                            <div className='flex min-w-0 flex-1 items-center gap-2'>
                              <div
                                className='h-2 w-2 shrink-0 rounded-full'
                                style={{ background: engineColor }}
                              />
                              <span className='truncate text-sm font-medium text-slate-700 dark:text-slate-300'>
                                {parentWorkflow?.label ?? parentLink.workflowId}
                              </span>
                            </div>
                            <div className='relative shrink-0'>
                              <select
                                value={parentLink.edgeType}
                                onChange={(e) => {
                                  setValue(
                                    'parentLinks',
                                    parentLinks.map((currentLink) =>
                                      currentLink.workflowId === parentLink.workflowId
                                        ? {
                                            ...currentLink,
                                            edgeType: e.target.value as EdgeType,
                                          }
                                        : currentLink
                                    ),
                                    { shouldValidate: true }
                                  );
                                }}
                                className='appearance-none rounded-md border-0 bg-slate-50 py-1 pr-6 pl-2 text-xs text-slate-600 transition-colors focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:bg-[#1a2130] dark:text-slate-400'
                              >
                                {EDGE_TYPE_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className='pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 text-slate-400' />
                            </div>
                            <button
                              type='button'
                              onClick={() => {
                                setValue(
                                  'parentLinks',
                                  parentLinks.filter(
                                    (currentLink) =>
                                      currentLink.workflowId !== parentLink.workflowId
                                  ),
                                  { shouldValidate: true }
                                );
                              }}
                              className='-mr-1 rounded-md p-1 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:text-[#4a5568] dark:hover:bg-[#2d3540] dark:hover:text-white'
                            >
                              <X className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isParentDropdownOpen && availableParents.length > 0 && (
                    <div className='absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#2d3540] dark:bg-[#1e252e]'>
                      {availableParents.map(([id, workflow]) => (
                        <button
                          key={id}
                          type='button'
                          onClick={() => {
                            setValue(
                              'parentLinks',
                              [...parentLinks, { workflowId: id, edgeType: 'trigger_input' }],
                              { shouldValidate: true }
                            );
                            setIsParentDropdownOpen(false);
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                        >
                          <div
                            className='h-2 w-2 rounded-full'
                            style={{ background: ENGINE_COLORS[workflow.engine] ?? '#6b7280' }}
                          />
                          {workflow.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Config Tags — full width */}
              <div className='col-span-2'>
                <div className='mb-1.5 flex items-center justify-between'>
                  <label
                    htmlFor='workflow-config'
                    className='block text-sm font-medium text-slate-700 dark:text-slate-300'
                  >
                    Config Tags (JSON)
                  </label>
                  <button
                    type='button'
                    onClick={formatConfigJson}
                    className='rounded px-2 py-0.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-[#9dabb9] dark:hover:bg-[#2d3540] dark:hover:text-white'
                  >
                    Format
                  </button>
                </div>
                <textarea
                  id='workflow-config'
                  rows={3}
                  {...register('configJson')}
                  onBlur={handleConfigBlur}
                  className={
                    inputClassName +
                    ' resize-none bg-slate-50 font-mono text-sm dark:bg-[#1e252e]' +
                    (errors.configJson
                      ? ' border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : '')
                  }
                  placeholder={'{\n  "key": "value"\n}'}
                />
                {errors.configJson && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.configJson.message}
                  </p>
                )}
                <p className='mt-1 text-xs text-slate-500 dark:text-[#9dabb9]'>
                  JSON object with string values.
                </p>
              </div>

              {/* Row 5: Description — full width */}
              <div className='col-span-2'>
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
          </div>

          {/* Footer */}
          <div className='flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 dark:border-[#2d3540]'>
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
