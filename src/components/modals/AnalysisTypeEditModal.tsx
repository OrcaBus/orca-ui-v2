import { X, Search, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { AnalysisType, mockAnalysisContexts, mockWorkflowDetails } from '../../data/mockData';
import { getExecutionEnginePillVariant } from '@/features/workflows/shared/utils/executionEnginePill';
import { PillTag } from '../ui/PillTag';

interface AnalysisTypeEditModalProps {
  analysisType: AnalysisType;
  onClose: () => void;
  onSave: (updatedAnalysisType: AnalysisType) => void;
}

export function AnalysisTypeEditModal({
  analysisType,
  onClose,
  onSave,
}: AnalysisTypeEditModalProps) {
  // Form state
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>(analysisType.status);
  const [description, setDescription] = useState(analysisType.description);
  const [linkedContexts, setLinkedContexts] = useState<string[]>(analysisType.contexts);
  const [linkedWorkflows, setLinkedWorkflows] = useState<string[]>(analysisType.linkedWorkflows);

  // UI state
  const [showContextSearch, setShowContextSearch] = useState(false);
  const [contextSearchQuery, setContextSearchQuery] = useState('');
  const [showWorkflowSearch, setShowWorkflowSearch] = useState(false);
  const [workflowSearchQuery, setWorkflowSearchQuery] = useState('');

  // Get available contexts (not already linked)
  const availableContexts = mockAnalysisContexts.filter(
    (ctx) => !linkedContexts.includes(ctx.name)
  );

  // Get available workflows (not already linked)
  const availableWorkflows = mockWorkflowDetails.filter((wf) => !linkedWorkflows.includes(wf.name));

  // Filter contexts by search
  const filteredContexts = availableContexts.filter(
    (ctx) =>
      ctx.name.toLowerCase().includes(contextSearchQuery.toLowerCase()) ||
      ctx.usecase.toLowerCase().includes(contextSearchQuery.toLowerCase()) ||
      ctx.orcabusId.toLowerCase().includes(contextSearchQuery.toLowerCase())
  );

  // Filter workflows by search
  const filteredWorkflows = availableWorkflows.filter(
    (wf) =>
      wf.name.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
      wf.version.toLowerCase().includes(workflowSearchQuery.toLowerCase()) ||
      wf.orcabusId.toLowerCase().includes(workflowSearchQuery.toLowerCase())
  );

  const handleAddContext = (contextName: string) => {
    setLinkedContexts([...linkedContexts, contextName]);
    setContextSearchQuery('');
    setShowContextSearch(false);
  };

  const handleRemoveContext = (contextName: string) => {
    setLinkedContexts(linkedContexts.filter((name) => name !== contextName));
  };

  const handleAddWorkflow = (workflowName: string) => {
    setLinkedWorkflows([...linkedWorkflows, workflowName]);
    setWorkflowSearchQuery('');
    setShowWorkflowSearch(false);
  };

  const handleRemoveWorkflow = (workflowName: string) => {
    setLinkedWorkflows(linkedWorkflows.filter((name) => name !== workflowName));
  };

  const handleSave = () => {
    const updatedAnalysisType: AnalysisType = {
      ...analysisType,
      status,
      description,
      contexts: linkedContexts,
      linkedWorkflows,
    };
    onSave(updatedAnalysisType);
  };

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-50 bg-black/50' onClick={onClose} />

      {/* Modal */}
      <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
        <div
          className='flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-2xl'
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4'>
            <h2 className='text-lg font-semibold text-neutral-900'>
              Edit Analysis — {analysisType.name} v{analysisType.version}
            </h2>
            <button
              onClick={onClose}
              className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600'
            >
              <X className='h-5 w-5' />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto px-6 py-6'>
            {/* Status Field */}
            <div className='mb-6'>
              <label className='mb-2 block text-sm font-medium text-neutral-700'>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                className='w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
              >
                <option value='ACTIVE'>ACTIVE</option>
                <option value='INACTIVE'>INACTIVE</option>
              </select>
            </div>

            {/* Description Field */}
            <div className='mb-6'>
              <label className='mb-2 block text-sm font-medium text-neutral-700'>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className='w-full resize-none rounded-md border border-neutral-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                placeholder='Enter analysis description...'
              />
            </div>

            {/* Contexts Section */}
            <div className='mb-6'>
              <div className='mb-3 flex items-center justify-between'>
                <label className='block text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
                  Contexts ({linkedContexts.length})
                </label>
                <button
                  onClick={() => setShowContextSearch(!showContextSearch)}
                  className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700'
                >
                  <Plus className='h-4 w-4' />
                  Add Context
                </button>
              </div>

              {/* Context Search */}
              {showContextSearch && (
                <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <div className='relative mb-3'>
                    <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400' />
                    <input
                      type='text'
                      value={contextSearchQuery}
                      onChange={(e) => setContextSearchQuery(e.target.value)}
                      placeholder='Search contexts by name, usecase, or ID...'
                      className='w-full rounded-md border border-neutral-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                      autoFocus
                    />
                  </div>
                  <div className='max-h-48 overflow-y-auto rounded-md border border-neutral-200 bg-white'>
                    {filteredContexts.length > 0 ? (
                      filteredContexts.map((ctx) => (
                        <button
                          key={ctx.id}
                          onClick={() => handleAddContext(ctx.name)}
                          className='w-full border-b border-neutral-100 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-blue-50'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <div className='text-sm font-medium text-neutral-900'>{ctx.name}</div>
                              <div className='mt-0.5 text-xs text-neutral-600'>{ctx.usecase}</div>
                              <div className='mt-0.5 font-mono text-xs text-neutral-500'>
                                {ctx.orcabusId}
                              </div>
                            </div>
                            <span
                              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                ctx.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {ctx.status}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className='px-4 py-8 text-center text-sm text-neutral-500'>
                        {contextSearchQuery
                          ? 'No contexts found matching your search'
                          : 'No available contexts to add'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linked Contexts List */}
              {linkedContexts.length > 0 ? (
                <div className='overflow-hidden rounded-lg border border-neutral-200'>
                  <div className='divide-y divide-neutral-200'>
                    {linkedContexts.map((contextName) => {
                      const context = mockAnalysisContexts.find((c) => c.name === contextName);
                      if (!context) return null;
                      return (
                        <div
                          key={context.id}
                          className='flex items-center justify-between px-4 py-3 hover:bg-neutral-50'
                        >
                          <div className='min-w-0 flex-1'>
                            <div className='text-sm font-medium text-neutral-900'>
                              {context.name}
                            </div>
                            <div className='mt-0.5 text-xs text-neutral-600'>{context.usecase}</div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <span
                              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                context.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {context.status}
                            </span>
                            <button
                              onClick={() => handleRemoveContext(contextName)}
                              className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600'
                              title='Remove context'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className='rounded-lg border border-neutral-200 bg-neutral-50 py-4 text-center text-sm text-neutral-500'>
                  No contexts linked. Click "Add Context" to link contexts.
                </div>
              )}
            </div>

            {/* Workflows Section */}
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <label className='block text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
                  Workflows ({linkedWorkflows.length})
                </label>
                <button
                  onClick={() => setShowWorkflowSearch(!showWorkflowSearch)}
                  className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700'
                >
                  <Plus className='h-4 w-4' />
                  Add Workflow
                </button>
              </div>

              {/* Workflow Search */}
              {showWorkflowSearch && (
                <div className='mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <div className='relative mb-3'>
                    <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400' />
                    <input
                      type='text'
                      value={workflowSearchQuery}
                      onChange={(e) => setWorkflowSearchQuery(e.target.value)}
                      placeholder='Search workflows by name, version, or ID...'
                      className='w-full rounded-md border border-neutral-300 py-2 pr-4 pl-10 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none'
                      autoFocus
                    />
                  </div>
                  <div className='max-h-48 overflow-y-auto rounded-md border border-neutral-200 bg-white'>
                    {filteredWorkflows.length > 0 ? (
                      filteredWorkflows.map((wf) => (
                        <button
                          key={wf.id}
                          onClick={() => handleAddWorkflow(wf.name)}
                          className='w-full border-b border-neutral-100 px-4 py-2.5 text-left transition-colors last:border-b-0 hover:bg-blue-50'
                        >
                          <div className='flex items-start justify-between gap-3'>
                            <div className='min-w-0 flex-1'>
                              <div className='text-sm font-medium text-neutral-900'>
                                {wf.name} <span className='text-neutral-500'>v{wf.version}</span>
                              </div>
                              <div className='mt-0.5 font-mono text-xs text-neutral-600'>
                                {wf.codeVersion}
                              </div>
                              <div className='mt-0.5 font-mono text-xs text-neutral-500'>
                                {wf.orcabusId}
                              </div>
                            </div>
                            <div className='flex flex-col items-end gap-1'>
                              <PillTag variant={getExecutionEnginePillVariant(wf.executionEngine)}>
                                {wf.executionEngine}
                              </PillTag>

                              <span
                                className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                  wf.validationState === 'validated'
                                    ? 'bg-green-100 text-green-700'
                                    : wf.validationState === 'unvalidated'
                                      ? 'bg-amber-100 text-amber-700'
                                      : wf.validationState === 'deprecated'
                                        ? 'bg-neutral-100 text-neutral-600'
                                        : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {wf.validationState}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className='px-4 py-8 text-center text-sm text-neutral-500'>
                        {workflowSearchQuery
                          ? 'No workflows found matching your search'
                          : 'No available workflows to add'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Linked Workflows List */}
              {linkedWorkflows.length > 0 ? (
                <div className='overflow-hidden rounded-lg border border-neutral-200'>
                  <div className='divide-y divide-neutral-200'>
                    {linkedWorkflows.map((workflowName) => {
                      const workflow = mockWorkflowDetails.find((w) => w.name === workflowName);
                      if (!workflow) return null;
                      return (
                        <div
                          key={workflow.id}
                          className='flex items-center justify-between px-4 py-3 hover:bg-neutral-50'
                        >
                          <div className='min-w-0 flex-1'>
                            <div className='text-sm font-medium text-neutral-900'>
                              {workflow.name}{' '}
                              <span className='text-neutral-500'>v{workflow.version}</span>
                            </div>
                            <div className='mt-0.5 font-mono text-xs text-neutral-600'>
                              {workflow.codeVersion}
                            </div>
                          </div>
                          <div className='flex items-center gap-3'>
                            <PillTag
                              variant={getExecutionEnginePillVariant(workflow.executionEngine)}
                            >
                              {workflow.executionEngine}
                            </PillTag>
                            <span
                              className={`shrink-0 rounded px-2 py-0.5 text-xs font-medium ${
                                workflow.validationState === 'validated'
                                  ? 'bg-green-100 text-green-700'
                                  : workflow.validationState === 'unvalidated'
                                    ? 'bg-amber-100 text-amber-700'
                                    : workflow.validationState === 'deprecated'
                                      ? 'bg-neutral-100 text-neutral-600'
                                      : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {workflow.validationState}
                            </span>
                            <button
                              onClick={() => handleRemoveWorkflow(workflowName)}
                              className='rounded p-1.5 text-neutral-400 transition-colors hover:bg-red-50 hover:text-red-600'
                              title='Remove workflow'
                            >
                              <Trash2 className='h-4 w-4' />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className='rounded-lg border border-neutral-200 bg-neutral-50 py-4 text-center text-sm text-neutral-500'>
                  No workflows linked. Click "Add Workflow" to link workflows.
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='flex items-center justify-end gap-3 border-t border-neutral-200 bg-neutral-50 px-6 py-4'>
            <button
              onClick={onClose}
              className='rounded-md px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200 hover:text-neutral-900'
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700'
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
