import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { WorkflowTypeDefinition } from '@/data/mockData';
import { PillTag } from '@/components/ui/PillTag';

interface WorkflowTypeDetailsDrawerProps {
  workflowType: WorkflowTypeDefinition;
  onClose: () => void;
}

export function WorkflowTypeDetailsDrawer({
  workflowType,
  onClose,
}: WorkflowTypeDetailsDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getValidationStateBadge = (
    state: 'validated' | 'unvalidated' | 'deprecated' | 'failed'
  ) => {
    const variantMap = {
      validated: 'bg-green-100 text-green-700',
      unvalidated: 'bg-amber-100 text-amber-700',
      deprecated: 'bg-neutral-100 text-neutral-600',
      failed: 'bg-red-100 text-red-700',
    };
    return (
      <span className={`rounded px-2 py-1 text-xs font-medium ${variantMap[state]}`}>
        {state.toUpperCase()}
      </span>
    );
  };

  const getExecutionEnginePill = (engine: string) => {
    const variant =
      engine === 'ICA'
        ? 'blue'
        : engine === 'SEQERA'
          ? 'purple'
          : engine === 'AWS_BATCH'
            ? 'green'
            : engine === 'AWS_ECS'
              ? 'amber'
              : engine === 'AWS_EKS'
                ? 'green'
                : 'neutral';
    return <PillTag variant={variant}>{engine}</PillTag>;
  };

  return (
    <>
      {/* Overlay */}
      <div className='fixed inset-0 z-40 bg-black/20' onClick={onClose} />

      {/* Drawer */}
      <div className='fixed top-0 right-0 z-50 flex h-full w-full max-w-3xl flex-col bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-neutral-900'>
            Workflow Type — {workflowType.name}
          </h2>
          <button
            onClick={onClose}
            className='rounded-lg p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto'>
          {/* Workflow Summary Section */}
          <div className='border-b border-neutral-200 px-6 py-6'>
            <h3 className='mb-4 text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
              Workflow Summary
            </h3>
            <div className='space-y-4'>
              {/* Orcabus ID */}
              {workflowType.orcabusId && (
                <div>
                  <label className='mb-1 block text-xs font-medium text-neutral-500'>
                    Orcabus ID
                  </label>
                  <div className='flex items-center gap-2'>
                    <code className='flex-1 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm text-neutral-900'>
                      {workflowType.orcabusId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(workflowType.orcabusId!, 'orcabusId')}
                      className='rounded p-2 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                      title='Copy Orcabus ID'
                    >
                      {copiedField === 'orcabusId' ? (
                        <Check className='h-4 w-4 text-green-600' />
                      ) : (
                        <Copy className='h-4 w-4' />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Name */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>Name</label>
                <div className='text-sm font-medium text-neutral-900'>{workflowType.name}</div>
              </div>

              {/* Version */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>Version</label>
                <div className='text-sm text-neutral-900'>{workflowType.version}</div>
              </div>

              {/* Code Version */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>
                  Code Version
                </label>
                <div className='font-mono text-sm text-neutral-600'>{workflowType.codeVersion}</div>
              </div>

              {/* Execution Engine */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>
                  Execution Engine
                </label>
                <div>{getExecutionEnginePill(workflowType.executionEngine)}</div>
              </div>

              {/* Execution Engine Pipeline ID */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>
                  Execution Engine Pipeline ID
                </label>
                <div className='flex items-center gap-2'>
                  <code className='flex-1 rounded border border-neutral-200 bg-neutral-50 px-3 py-2 font-mono text-sm break-all text-neutral-900'>
                    {workflowType.executionEnginePipelineId}
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(workflowType.executionEnginePipelineId, 'pipelineId')
                    }
                    className='flex-shrink-0 rounded p-2 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                    title='Copy Pipeline ID'
                  >
                    {copiedField === 'pipelineId' ? (
                      <Check className='h-4 w-4 text-green-600' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                  </button>
                </div>
              </div>

              {/* Validation State */}
              <div>
                <label className='mb-1 block text-xs font-medium text-neutral-500'>
                  Validation State
                </label>
                <div>{getValidationStateBadge(workflowType.validationState)}</div>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className='px-6 py-6'>
            <h3 className='mb-4 text-sm font-semibold tracking-wide text-neutral-900 uppercase'>
              History
            </h3>

            {workflowType.history && workflowType.history.length > 0 ? (
              <div className='overflow-hidden rounded-lg border border-neutral-200'>
                <div className='overflow-x-auto'>
                  <table className='w-full text-sm'>
                    <thead className='border-b border-neutral-200 bg-neutral-50'>
                      <tr>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Orcabus ID
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>Name</th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Version
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Code Version
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Execution Engine
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Execution Engine Pipeline ID
                        </th>
                        <th className='px-4 py-3 text-left font-medium text-neutral-700'>
                          Validation State
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-neutral-200'>
                      {workflowType.history.map((entry) => (
                        <tr key={entry.id} className='hover:bg-neutral-50'>
                          <td className='px-4 py-3'>
                            <div className='flex items-center gap-2'>
                              <code
                                className='max-w-[180px] truncate font-mono text-xs text-neutral-900'
                                title={entry.orcabusId}
                              >
                                {entry.orcabusId}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(entry.orcabusId, `history-${entry.id}`)
                                }
                                className='flex-shrink-0 rounded p-1 text-neutral-400 transition-colors hover:bg-blue-50 hover:text-blue-600'
                                title='Copy Orcabus ID'
                              >
                                {copiedField === `history-${entry.id}` ? (
                                  <Check className='h-3 w-3 text-green-600' />
                                ) : (
                                  <Copy className='h-3 w-3' />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className='px-4 py-3 text-neutral-900'>{entry.name}</td>
                          <td className='px-4 py-3 text-neutral-900'>{entry.version}</td>
                          <td className='px-4 py-3 font-mono text-xs text-neutral-600'>
                            {entry.codeVersion}
                          </td>
                          <td className='px-4 py-3'>
                            {getExecutionEnginePill(entry.executionEngine)}
                          </td>
                          <td className='px-4 py-3'>
                            <code
                              className='block max-w-[200px] truncate font-mono text-xs text-neutral-600'
                              title={entry.executionEnginePipelineId}
                            >
                              {entry.executionEnginePipelineId}
                            </code>
                          </td>
                          <td className='px-4 py-3'>
                            {getValidationStateBadge(entry.validationState)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className='rounded-lg border border-neutral-200 bg-neutral-50 py-12 text-center'>
                <p className='text-sm text-neutral-500'>No history available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
