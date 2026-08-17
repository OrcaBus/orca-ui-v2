import { useState, useEffect, useRef } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, ChevronDown, Plus } from 'lucide-react';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { Button } from '@/components/ui/Button';
import { tryPrettyJson } from '@/utils/json';
import type { MapEdgeType, MapGroup, ResourceType, WorkflowEngine } from '../data/dynamodb-schema';
import type { CatalogNodeLookupItem, NodeFormData } from '../types/system-catalog.types';
import { parseNodeConfigJson } from '../utils/nodeForm';
import {
  getNodeAccentColor,
  getNodeDetailLabel,
  NODE_TYPE_OPTIONS,
  RESOURCE_TYPE_OPTIONS,
  WORKFLOW_ENGINE_OPTIONS,
} from '../utils/nodeDisplay';

const EDGE_TYPE_OPTIONS: Array<{ value: MapEdgeType; label: string }> = [
  { value: 'trigger', label: 'Trigger only' },
  { value: 'trigger_input', label: 'Trigger + input' },
  { value: 'input_dependency', label: 'Input only' },
  { value: 'event_publish', label: 'Event publish' },
  { value: 'event_subscribe', label: 'Event subscribe' },
  { value: 'state_change', label: 'State change' },
  { value: 'execution_request', label: 'Execution request' },
  { value: 'rest_call', label: 'REST call' },
];

const nodeFormSchema = z.object({
  name: z.string().min(1, 'Node name is required'),
  version: z.string(),
  nodeType: z.enum(
    NODE_TYPE_OPTIONS.map((option) => option.value) as [
      'resource' | 'workflow',
      ...Array<'resource' | 'workflow'>,
    ]
  ),
  resourceType: z.enum(
    RESOURCE_TYPE_OPTIONS.map((option) => option.value) as [ResourceType, ...ResourceType[]]
  ),
  workflowEngine: z.enum(
    WORKFLOW_ENGINE_OPTIONS.map((option) => option.value) as [WorkflowEngine, ...WorkflowEngine[]]
  ),
  groupIds: z.array(z.string()),
  parentLinks: z.array(
    z.object({
      nodeId: z.string().min(1),
      edgeType: z.enum(
        EDGE_TYPE_OPTIONS.map((option) => option.value) as [MapEdgeType, ...MapEdgeType[]]
      ),
    })
  ),
  description: z.string(),
  configJson: z
    .string()
    .refine(
      (value) => parseNodeConfigJson(value) !== null,
      'Tags must be a JSON object with string values'
    ),
});

const inputClassName =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-white dark:placeholder:text-[#9dabb9] dark:focus:border-blue-400';

interface NodeModalProps {
  isOpen: boolean;
  editingId: string | null;
  initialData: NodeFormData;
  allNodes: Record<string, CatalogNodeLookupItem>;
  groups: MapGroup[];
  onSubmit: (data: NodeFormData) => void;
  onClose: () => void;
}

export function NodeModal({
  isOpen,
  editingId,
  initialData,
  allNodes,
  groups,
  onSubmit,
  onClose,
}: NodeModalProps) {
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);
  const parentDropdownRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<NodeFormData>({
    resolver: zodResolver(nodeFormSchema),
    defaultValues: initialData,
    mode: 'onChange',
  });

  const selectedGroupIds = useWatch({ control, name: 'groupIds', defaultValue: [] }) ?? [];
  const parentLinks = useWatch({ control, name: 'parentLinks', defaultValue: [] }) ?? [];
  const configJson = useWatch({ control, name: 'configJson', defaultValue: '{}' }) ?? '{}';
  const selectedNodeType = useWatch({ control, name: 'nodeType', defaultValue: 'workflow' });

  useEffect(() => {
    if (isOpen) {
      reset(initialData);
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (groupDropdownRef.current && !groupDropdownRef.current.contains(target)) {
        setIsGroupDropdownOpen(false);
      }

      if (parentDropdownRef.current && !parentDropdownRef.current.contains(target)) {
        setIsParentDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isEditing = editingId !== null;
  const availableGroups = groups.filter((group) => !selectedGroupIds.includes(group.groupId));
  const availableParents = Object.entries(allNodes).filter(
    ([nodeId]) =>
      nodeId !== editingId && !parentLinks.some((parentLink) => parentLink.nodeId === nodeId)
  );

  const formatConfigJson = () => {
    setValue('configJson', tryPrettyJson(configJson), { shouldValidate: true });
  };

  const handleConfigBlur = () => {
    const prettyConfig = tryPrettyJson(configJson);
    if (prettyConfig !== configJson) {
      setValue('configJson', prettyConfig, { shouldValidate: true });
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Node' : 'Add New Node'}
      description={
        isEditing
          ? 'Update the properties for this node.'
          : 'Configure the properties for the new node in this map.'
      }
      size='xl'
      panelClassName='flex max-h-[calc(100vh-4rem)] max-w-3xl flex-col'
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
          <Button type='submit' form='system-catalog-node-form' disabled={!isValid || isSubmitting}>
            <Plus />
            {isEditing ? 'Save Changes' : 'Add Node'}
          </Button>
        </>
      }
    >
      <form id='system-catalog-node-form' onSubmit={(event) => void handleSubmit(onSubmit)(event)}>
        <div className='grid grid-cols-2 gap-x-5 gap-y-4'>
          <div>
            <label
              htmlFor='node-name'
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              Node Name <span className='text-red-500'>*</span>
            </label>
            <input
              id='node-name'
              type='text'
              placeholder='Enter node name'
              {...register('name')}
              className={`${inputClassName} ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            />
            {errors.name && (
              <p className='mt-1 text-sm text-red-600 dark:text-red-400'>{errors.name.message}</p>
            )}
          </div>

          <div>
            <label
              htmlFor='node-version'
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              Version
            </label>
            <input
              id='node-version'
              type='text'
              placeholder='e.g. 1.0.0'
              {...register('version')}
              className={inputClassName}
            />
          </div>

          <div>
            <label
              htmlFor='node-type'
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              Node Type
            </label>
            <div className='relative'>
              <select
                id='node-type'
                {...register('nodeType')}
                className={inputClassName + ' appearance-none pr-8'}
              >
                {NODE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            </div>
          </div>

          <div>
            <label
              htmlFor={
                selectedNodeType === 'resource' ? 'node-resource-type' : 'node-workflow-engine'
              }
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              {selectedNodeType === 'resource' ? 'Resource Type' : 'Workflow Engine'}
            </label>
            <div className='relative'>
              {selectedNodeType === 'resource' ? (
                <select
                  id='node-resource-type'
                  {...register('resourceType')}
                  className={inputClassName + ' appearance-none pr-8'}
                >
                  {RESOURCE_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  id='node-workflow-engine'
                  {...register('workflowEngine')}
                  className={inputClassName + ' appearance-none pr-8'}
                >
                  {WORKFLOW_ENGINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              <ChevronDown className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
            </div>
          </div>

          <div className='col-span-2'>
            <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Groups
            </label>
            <div className='relative' ref={groupDropdownRef}>
              <div
                className='flex min-h-10.5 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-[#2d3540] dark:bg-[#1e252e]'
                onClick={() => setIsGroupDropdownOpen(true)}
              >
                <span className='min-w-0 flex-1 text-sm text-slate-400 dark:text-[#9dabb9]'>
                  {selectedGroupIds.length === 0
                    ? 'Select groups...'
                    : `${selectedGroupIds.length} group${selectedGroupIds.length === 1 ? '' : 's'} selected`}
                </span>
                <button
                  type='button'
                  onClick={(event) => {
                    event.stopPropagation();
                    setIsGroupDropdownOpen((open) => !open);
                  }}
                  className='ml-auto shrink-0 rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-[#2d3540] dark:hover:text-white'
                >
                  <Plus className='h-4 w-4' />
                </button>
              </div>

              {selectedGroupIds.length > 0 && (
                <div className='mt-2 flex flex-wrap gap-2'>
                  {selectedGroupIds.map((groupId) => {
                    const group = groups.find((candidate) => candidate.groupId === groupId);
                    if (!group) {
                      return null;
                    }

                    return (
                      <div
                        key={groupId}
                        className='flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 dark:border-[#2d3540] dark:bg-[#1e252e]'
                      >
                        <div
                          className='h-2 w-2 shrink-0 rounded-full'
                          style={{ background: group.color }}
                        />
                        <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>
                          {group.name}
                        </span>
                        <button
                          type='button'
                          onClick={() =>
                            setValue(
                              'groupIds',
                              selectedGroupIds.filter((selectedId) => selectedId !== groupId),
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

              {isGroupDropdownOpen && availableGroups.length > 0 && (
                <div className='absolute top-full right-0 left-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg dark:border-[#2d3540] dark:bg-[#1e252e]'>
                  {availableGroups.map((group) => (
                    <button
                      key={group.groupId}
                      type='button'
                      onClick={() => {
                        setValue('groupIds', [...selectedGroupIds, group.groupId], {
                          shouldValidate: true,
                        });
                        setIsGroupDropdownOpen(false);
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                    >
                      <div className='h-2 w-2 rounded-full' style={{ background: group.color }} />
                      {group.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className='col-span-2'>
            <label className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'>
              Parent Nodes
            </label>
            <div className='relative' ref={parentDropdownRef}>
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
                  onClick={(event) => {
                    event.stopPropagation();
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
                    const parentNode = allNodes[parentLink.nodeId];
                    const nodeColor = parentNode ? getNodeAccentColor(parentNode) : '#6b7280';

                    return (
                      <div
                        key={parentLink.nodeId}
                        className='flex h-10.5 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 dark:border-[#2d3540] dark:bg-[#1e252e]'
                      >
                        <div className='flex min-w-0 flex-1 items-center gap-2'>
                          <div
                            className='h-2 w-2 shrink-0 rounded-full'
                            style={{ background: nodeColor }}
                          />
                          <span className='truncate text-sm font-medium text-slate-700 dark:text-slate-300'>
                            {parentNode?.label ?? parentLink.nodeId}
                          </span>
                        </div>
                        <div className='relative shrink-0'>
                          <select
                            value={parentLink.edgeType}
                            onChange={(event) => {
                              setValue(
                                'parentLinks',
                                parentLinks.map((currentLink) =>
                                  currentLink.nodeId === parentLink.nodeId
                                    ? {
                                        ...currentLink,
                                        edgeType: event.target.value as MapEdgeType,
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
                                (currentLink) => currentLink.nodeId !== parentLink.nodeId
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
                  {availableParents.map(([nodeId, node]) => (
                    <button
                      key={nodeId}
                      type='button'
                      onClick={() => {
                        setValue(
                          'parentLinks',
                          [...parentLinks, { nodeId, edgeType: 'trigger_input' }],
                          { shouldValidate: true }
                        );
                        setIsParentDropdownOpen(false);
                      }}
                      className='flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#2d3540]'
                    >
                      <div
                        className='h-2 w-2 rounded-full'
                        style={{ background: getNodeAccentColor(node) }}
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

          <div className='col-span-2'>
            <div className='mb-1.5 flex items-center justify-between'>
              <label
                htmlFor='node-config'
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
              id='node-config'
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

          <div className='col-span-2'>
            <label
              htmlFor='node-description'
              className='mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300'
            >
              Description
            </label>
            <textarea
              id='node-description'
              placeholder="Enter a brief description of the node's role..."
              rows={3}
              {...register('description')}
              className={inputClassName + ' resize-none'}
            />
          </div>
        </div>
      </form>
    </DialogFrame>
  );
}
