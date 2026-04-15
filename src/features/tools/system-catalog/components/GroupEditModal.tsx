import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, ChevronDown } from 'lucide-react';
import type { CatalogNodeData } from '../types/system-catalog.types';

// ─── Schema ─────────────────────────────────────────────────────────────────

const GROUP_TYPES = ['analysis', 'flows', 'service'] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

const groupFormSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  type: z.enum(GROUP_TYPES),
  color: z.string().min(1, 'Color is required'),
  nodeIds: z.array(z.string()),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

// ─── Constants ──────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#a855f7', // purple
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#10b981', // emerald
  '#ec4899', // pink
  '#ef4444', // red
  '#f97316', // orange
  '#14b8a6', // teal
  '#8b5cf6', // violet
  '#84cc16', // lime
];

const TYPE_LABELS: Record<GroupType, string> = {
  analysis: 'Analysis',
  flows: 'Flows',
  service: 'Service',
};

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

// ─── Props ──────────────────────────────────────────────────────────────────

interface GroupEditModalProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData: GroupFormData;
  allNodes: Record<string, Pick<CatalogNodeData, 'label' | 'engine'>>;
  engineColors: Record<string, string>;
  onSubmit: (data: GroupFormData) => void;
  onClose: () => void;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function GroupEditModal({
  isOpen,
  isEditing,
  initialData,
  allNodes,
  engineColors,
  onSubmit,
  onClose,
}: GroupEditModalProps) {
  const [isNodeDropdownOpen, setIsNodeDropdownOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid },
  } = useForm<GroupFormData>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const currentColor = useWatch({ control, name: 'color', defaultValue: initialData.color });
  const selectedNodeIds =
    useWatch({ control, name: 'nodeIds', defaultValue: initialData.nodeIds }) ?? [];

  useEffect(() => {
    if (isOpen) reset(initialData);
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const availableNodes = Object.entries(allNodes).filter(([id]) => !selectedNodeIds.includes(id));

  const onFormSubmit = (data: GroupFormData) => {
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
      <div className='relative flex max-h-[calc(100vh-4rem)] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-[#2d3540] dark:bg-[#111418]'>
        <form onSubmit={(e) => void handleSubmit(onFormSubmit)(e)} className='contents'>
          {/* Header */}
          <div className='flex shrink-0 items-start justify-between px-6 pt-6 pb-2'>
            <div>
              <h2 className='text-lg font-bold text-slate-900 dark:text-white'>
                {isEditing ? 'Edit Group' : 'Add New Group'}
              </h2>
              <p className='mt-0.5 text-sm text-slate-500 dark:text-[#9dabb9]'>
                {isEditing
                  ? 'Update the properties for this group.'
                  : 'Configure a new group to organize nodes.'}
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
            <div className='space-y-4'>
              {/* Group Name */}
              <div>
                <label
                  htmlFor='group-name'
                  className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Group Name <span className='text-red-500'>*</span>
                </label>
                <input
                  id='group-name'
                  type='text'
                  placeholder='Enter group name'
                  {...register('name')}
                  className={`${inputClassName} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                />
                {errors.name && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label
                  htmlFor='group-type'
                  className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
                >
                  Type
                </label>
                <div className='relative'>
                  <select
                    id='group-type'
                    {...register('type')}
                    className={inputClassName + ' appearance-none pr-8'}
                  >
                    {GROUP_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
                </div>
              </div>

              {/* Color */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Color
                </label>
                <div className='flex flex-wrap gap-2'>
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type='button'
                      onClick={() => setValue('color', color, { shouldValidate: true })}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${
                        currentColor === color
                          ? 'scale-110 border-slate-900 dark:border-white'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ background: color }}
                      title={color}
                    />
                  ))}
                </div>
                <div className='mt-2 flex items-center gap-2'>
                  <div
                    className='h-7 w-7 shrink-0 rounded-full border border-slate-200 dark:border-[#2d3540]'
                    style={{ background: currentColor || '#6366f1' }}
                  />
                  <input
                    type='text'
                    placeholder='#6366f1'
                    {...register('color')}
                    className={inputClassName + ' font-mono text-sm'}
                  />
                </div>
                {errors.color && (
                  <p className='mt-1 text-sm text-red-600 dark:text-red-400'>
                    {errors.color.message}
                  </p>
                )}
              </div>

              {/* Nodes Included */}
              <div>
                <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
                  Nodes Included
                </label>
                <div className='relative'>
                  <div
                    className='flex min-h-10.5 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]'
                    onClick={() => setIsNodeDropdownOpen(true)}
                  >
                    <span className='min-w-0 flex-1 text-sm text-slate-400 dark:text-[#9dabb9]'>
                      {selectedNodeIds.length === 0
                        ? 'Select nodes...'
                        : `${selectedNodeIds.length} node${selectedNodeIds.length === 1 ? '' : 's'} selected`}
                    </span>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsNodeDropdownOpen((open) => !open);
                      }}
                      className='ml-auto shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                    >
                      <Plus className='h-4 w-4' />
                    </button>
                  </div>

                  {selectedNodeIds.length > 0 && (
                    <div className='mt-2 flex flex-wrap gap-2'>
                      {selectedNodeIds.map((wfId) => {
                        const wf = allNodes[wfId];
                        const engineColor = wf ? (engineColors[wf.engine] ?? '#6b7280') : '#6b7280';
                        return (
                          <div
                            key={wfId}
                            className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-[#2d3540] dark:bg-[#1e252e]'
                          >
                            <div
                              className='h-2 w-2 shrink-0 rounded-full'
                              style={{ background: engineColor }}
                            />
                            <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                              {wf?.label ?? wfId}
                            </span>
                            <button
                              type='button'
                              onClick={() =>
                                setValue(
                                  'nodeIds',
                                  selectedNodeIds.filter((id) => id !== wfId),
                                  { shouldValidate: true }
                                )
                              }
                              className='rounded-md p-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500 dark:text-[#4a5568] dark:hover:bg-[#2d3540] dark:hover:text-white'
                            >
                              <X className='h-3 w-3' />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isNodeDropdownOpen && availableNodes.length > 0 && (
                    <div className='absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#2d3540] dark:bg-[#1e252e]'>
                      {availableNodes.map(([id, catalogNode]) => (
                        <button
                          key={id}
                          type='button'
                          onClick={() => {
                            setValue('nodeIds', [...selectedNodeIds, id], {
                              shouldValidate: true,
                            });
                            setIsNodeDropdownOpen(false);
                          }}
                          className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                        >
                          <div
                            className='h-2 w-2 rounded-full'
                            style={{
                              background: engineColors[catalogNode.engine] ?? '#6b7280',
                            }}
                          />
                          {catalogNode.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
              {isEditing ? 'Save Changes' : 'Add Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
