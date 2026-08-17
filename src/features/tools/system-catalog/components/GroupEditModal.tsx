import { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, ChevronDown } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import type { CatalogNodeLookupItem } from '../types/system-catalog.types';
import { getNodeAccentColor, getNodeDetailLabel } from '../utils/nodeDisplay';

const GROUP_FORM_ID = 'system-catalog-group-form';

const GROUP_TYPES = ['infrastructure', 'ingestion', 'analysis', 'flows', 'service'] as const;
export type GroupType = (typeof GROUP_TYPES)[number];

const groupFormSchema = z.object({
  name: z.string().min(1, 'Group name is required'),
  description: z.string(),
  type: z.enum(GROUP_TYPES),
  color: z.string().min(1, 'Color is required'),
  nodeIds: z.array(z.string()),
});

export type GroupFormData = z.infer<typeof groupFormSchema>;

const COLOR_PRESETS = [
  '#6366f1',
  '#06b6d4',
  '#a855f7',
  '#f59e0b',
  '#3b82f6',
  '#10b981',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#14b8a6',
  '#8b5cf6',
  '#84cc16',
];

const TYPE_LABELS: Record<GroupType, string> = {
  infrastructure: 'Infrastructure',
  ingestion: 'Ingestion',
  analysis: 'Analysis',
  flows: 'Flows',
  service: 'Service',
};

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

interface GroupEditModalProps {
  isOpen: boolean;
  isEditing: boolean;
  initialData: GroupFormData;
  allNodes: Record<string, CatalogNodeLookupItem>;
  engineColors: Record<string, string>;
  onSubmit: (data: GroupFormData) => void;
  onClose: () => void;
}

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
    if (isOpen && !isSubmitting) {
      reset(initialData);
    }
  }, [isOpen, initialData, isSubmitting, reset]);

  const availableNodes = Object.entries(allNodes).filter(
    ([nodeId]) => !selectedNodeIds.includes(nodeId)
  );

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Group' : 'Add New Group'}
      description={
        isEditing
          ? 'Update the properties for this group.'
          : 'Configure a new group to organize nodes.'
      }
      size='md'
      panelClassName='flex max-h-[calc(100vh-4rem)] flex-col'
      bodyClassName='min-h-0 flex-1 overflow-y-auto px-6 py-4'
      footer={
        <>
          <button
            type='button'
            onClick={handleClose}
            className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:bg-transparent dark:text-neutral-300 dark:hover:bg-[#2d3540]'
          >
            Cancel
          </button>
          <Button type='submit' form={GROUP_FORM_ID} disabled={!isValid || isSubmitting}>
            <Plus />
            {isEditing ? 'Save Changes' : 'Add Group'}
          </Button>
        </>
      }
    >
      <form id={GROUP_FORM_ID} onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className='space-y-4'>
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
              <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='group-description'
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              Description
            </label>
            <textarea
              id='group-description'
              rows={3}
              placeholder='Describe what this group represents...'
              {...register('description')}
              className={inputClassName + ' resize-none'}
            />
          </div>

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
                {GROUP_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            </div>
          </div>

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
              <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.color.message}</p>
            )}
          </div>

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
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsNodeDropdownOpen((open) => !open);
                  }}
                  className='ml-auto shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                >
                  <Plus className='h-4 w-4' />
                </button>
              </div>

              {selectedNodeIds.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                  {selectedNodeIds.map((nodeId) => {
                    const node = allNodes[nodeId];
                    const nodeColor = node ? getNodeAccentColor(node, engineColors) : '#6b7280';

                    return (
                      <div
                        key={nodeId}
                        className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-[#2d3540] dark:bg-[#1e252e]'
                      >
                        <div
                          className='h-2 w-2 shrink-0 rounded-full'
                          style={{ background: nodeColor }}
                        />
                        <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                          {node?.label ?? nodeId}
                        </span>
                        <button
                          type='button'
                          onClick={() =>
                            setValue(
                              'nodeIds',
                              selectedNodeIds.filter((selectedId) => selectedId !== nodeId),
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
                  {availableNodes.map(([nodeId, node]) => (
                    <button
                      key={nodeId}
                      type='button'
                      onClick={() => {
                        setValue('nodeIds', [...selectedNodeIds, nodeId], {
                          shouldValidate: true,
                        });
                        setIsNodeDropdownOpen(false);
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                    >
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{ background: getNodeAccentColor(node, engineColors) }}
                      />
                      <span className='min-w-0 flex-1 truncate'>{node.label}</span>
                      <span className='shrink-0 text-xs text-slate-400 dark:text-[#6b7a8d]'>
                        {getNodeDetailLabel(node)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </DialogFrame>
  );
}
