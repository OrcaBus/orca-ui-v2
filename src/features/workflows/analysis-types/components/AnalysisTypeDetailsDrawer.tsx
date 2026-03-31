import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { AnalysisType, mockAnalysisContexts, mockWorkflowDetails } from '@/data/mockData';
import { PillTag } from '@/components/ui/PillTag';

interface AnalysisTypeDetailsDrawerProps {
  analysisType: AnalysisType;
  onClose: () => void;
}

export function AnalysisTypeDetailsDrawer({
  analysisType,
  onClose,
}: AnalysisTypeDetailsDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get related contexts based on the context names in the analysis type
  const relatedContexts = mockAnalysisContexts.filter((ctx) =>
    analysisType.contexts.includes(ctx.name)
  );

  // Get related workflows based on the workflow names in the analysis type
  const relatedWorkflows = mockWorkflowDetails.filter((wf) =>
    analysisType.linkedWorkflows.includes(wf.name)
  );

  const handleCopyId = (id: string) => {
    void navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-40 bg-black/30' onClick={onClose} />

      {/* Drawer */}
      <div className='fixed top-0 right-0 z-50 flex h-full w-[800px] flex-col bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-neutral-900'>
            Analysis Details — {analysisType.name} v{analysisType.version}
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Summary Section */}
          <div className='mb-8'>
            <div className='mb-4 grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-medium tracking-wide text-neutral-500 uppercase'>
                  Name
                </label>
                <p className='mt-1 text-sm font-medium text-neutral-900'>{analysisType.name}</p>
              </div>
              <div>
                <label className='text-xs font-medium tracking-wide text-neutral-500 uppercase'>
                  Version
                </label>
                <p className='mt-1 text-sm font-medium text-neutral-900'>{analysisType.version}</p>
              </div>
            </div>

            <div className='mb-4'>
              <label className='text-xs font-medium tracking-wide text-neutral-500 uppercase'>
                Status
              </label>
              <div className='mt-1'>
                <span
                  className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                    analysisType.status === 'ACTIVE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {analysisType.status}
                </span>
              </div>
            </div>

            <div>
              <label className='text-xs font-medium tracking-wide text-neutral-500 uppercase'>
                Description
              </label>
              <p className='mt-1 text-sm leading-relaxed text-neutral-700'>
                {analysisType.description}
              </p>
            </div>
          </div>

          {/* Contexts Section */}
          <div className='mb-8'>
            <h3 className='mb-3 text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
              Contexts ({relatedContexts.length})
            </h3>
            {relatedContexts.length > 0 ? (
              <div className='overflow-hidden rounded-lg border border-neutral-200'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='border-b border-neutral-200 bg-neutral-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Name
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Usecase
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Description
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Status
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Orcabus ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-200'>
                      {relatedContexts.map((context) => (
                        <tr key={context.id} className='hover:bg-neutral-50'>
                          <td className='px-4 py-3 font-medium text-neutral-900'>{context.name}</td>
                          <td className='max-w-xs px-4 py-3 text-neutral-700'>{context.usecase}</td>
                          <td className='max-w-md px-4 py-3 text-neutral-600'>
                            <div className='line-clamp-2' title={context.description}>
                              {context.description}
                            </div>
                          </td>
                          <td className='px-4 py-3'>
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                context.status === 'ACTIVE'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-neutral-100 text-neutral-600'
                              }`}
                            >
                              {context.status}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono text-xs text-neutral-700'>
                                {context.orcabusId}
                              </span>
                              <button
                                onClick={() => handleCopyId(context.orcabusId)}
                                className='rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                                title='Copy ID'
                              >
                                {copiedId === context.orcabusId ? (
                                  <Check className='h-3.5 w-3.5 text-green-600' />
                                ) : (
                                  <Copy className='h-3.5 w-3.5' />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-neutral-200 bg-neutral-50 py-4 text-center text-sm text-neutral-500'>
                No contexts associated with this analysis type.
              </div>
            )}
          </div>

          {/* Workflows Section */}
          <div>
            <h3 className='mb-3 text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
              Workflows ({relatedWorkflows.length})
            </h3>
            {relatedWorkflows.length > 0 ? (
              <div className='overflow-hidden rounded-lg border border-neutral-200'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='border-b border-neutral-200 bg-neutral-50'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Name
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Version
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Code Version
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Execution Engine
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Pipeline ID
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Validation
                        </th>
                        <th className='px-4 py-2 text-left text-xs font-medium tracking-wide text-neutral-600 uppercase'>
                          Orcabus ID
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-200'>
                      {relatedWorkflows.map((workflow) => (
                        <tr key={workflow.id} className='hover:bg-neutral-50'>
                          <td className='px-4 py-3 font-medium text-neutral-900'>
                            {workflow.name}
                          </td>
                          <td className='px-4 py-3 text-neutral-700'>{workflow.version}</td>
                          <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                            {workflow.codeVersion}
                          </td>
                          <td className='px-4 py-3'>
                            <PillTag
                              variant={
                                workflow.executionEngine === 'ICA'
                                  ? 'blue'
                                  : workflow.executionEngine === 'SEQERA'
                                    ? 'purple'
                                    : workflow.executionEngine === 'AWS_BATCH'
                                      ? 'green'
                                      : workflow.executionEngine === 'AWS_ECS'
                                        ? 'amber'
                                        : workflow.executionEngine === 'AWS_EKS'
                                          ? 'green'
                                          : 'neutral'
                              }
                            >
                              {workflow.executionEngine}
                            </PillTag>
                          </td>
                          <td
                            className='max-w-xs truncate px-4 py-3 font-mono text-xs text-neutral-600'
                            title={workflow.executionEnginePipelineId}
                          >
                            {workflow.executionEnginePipelineId}
                          </td>
                          <td className='px-4 py-3'>
                            <span
                              className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                                workflow.validationState === 'validated'
                                  ? 'bg-green-100 text-green-700'
                                  : workflow.validationState === 'unvalidated'
                                    ? 'bg-amber-100 text-amber-700'
                                    : workflow.validationState === 'deprecated'
                                      ? 'bg-neutral-100 text-neutral-600'
                                      : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {workflow.validationState.toUpperCase()}
                            </span>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-2'>
                              <span className='font-mono text-xs text-neutral-700'>
                                {workflow.orcabusId}
                              </span>
                              <button
                                onClick={() => handleCopyId(workflow.orcabusId)}
                                className='rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                                title='Copy ID'
                              >
                                {copiedId === workflow.orcabusId ? (
                                  <Check className='h-3.5 w-3.5 text-green-600' />
                                ) : (
                                  <Copy className='h-3.5 w-3.5' />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-neutral-200 bg-neutral-50 py-4 text-center text-sm text-neutral-500'>
                No workflows linked to this analysis type.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
