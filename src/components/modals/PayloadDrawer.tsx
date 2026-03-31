import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { WorkflowPayload } from '../../data/mockData';
import { PillTag } from '../ui/PillTag';

interface PayloadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  payload: WorkflowPayload | null;
}

export function PayloadDrawer({ isOpen, onClose, payload }: PayloadDrawerProps) {
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  if (!isOpen || !payload) return null;

  const handleCopyRaw = () => {
    if (payload.rawJson) {
      void navigator.clipboard.writeText(JSON.stringify(payload.rawJson, null, 2));
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    }
  };

  const handleCopyValue = (value: string) => {
    void navigator.clipboard.writeText(value);
    setCopiedValue(value);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className='fixed inset-0 z-40 bg-black/20' onClick={onClose} />

      {/* Drawer */}
      <div className='fixed top-0 right-0 z-50 flex h-full w-[600px] flex-col bg-white shadow-2xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-neutral-200 px-6 py-4'>
          <h2 className='text-lg font-semibold text-neutral-900'>Payload Details</h2>
          <button onClick={onClose} className='rounded p-1 transition-colors hover:bg-neutral-100'>
            <X className='h-5 w-5 text-neutral-600' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex border-b border-neutral-200 px-6'>
          <button
            onClick={() => setActiveTab('formatted')}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'formatted'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Formatted View
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'raw'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Raw JSON
          </button>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-y-auto p-6'>
          {activeTab === 'formatted' ? (
            <div className='space-y-6'>
              {/* Engine Parameters */}
              {payload.engineParameters && Object.keys(payload.engineParameters).length > 0 && (
                <div className='rounded-lg border border-neutral-200 bg-neutral-50 p-4'>
                  <h3 className='mb-3 text-sm font-semibold text-neutral-900'>Engine Parameters</h3>
                  <div className='space-y-2'>
                    {Object.entries(payload.engineParameters).map(([key, value]) => (
                      <div key={key} className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='mb-0.5 text-xs font-medium text-neutral-600'>{key}</div>
                          <div className='font-mono text-sm text-neutral-900'>{String(value)}</div>
                        </div>
                        <button
                          onClick={() => handleCopyValue(String(value))}
                          className='ml-2 rounded p-1 transition-colors hover:bg-neutral-200'
                        >
                          {copiedValue === String(value) ? (
                            <Check className='h-3.5 w-3.5 text-green-600' />
                          ) : (
                            <Copy className='h-3.5 w-3.5 text-neutral-400' />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Inputs */}
              {payload.inputs && payload.inputs.length > 0 && (
                <div className='rounded-lg border border-blue-200 bg-blue-50 p-4'>
                  <h3 className='mb-3 text-sm font-semibold text-neutral-900'>Inputs</h3>
                  <div className='space-y-3'>
                    {payload.inputs.map((input, idx) => (
                      <div key={idx}>
                        <div className='mb-1 text-xs font-medium text-neutral-600'>
                          {input.name}
                        </div>
                        <div className='flex items-center gap-2'>
                          {input.link ? (
                            <a
                              href={input.link}
                              className='font-mono text-sm text-blue-600 hover:text-blue-800 hover:underline'
                            >
                              {input.value}
                            </a>
                          ) : (
                            <div className='font-mono text-sm text-neutral-900'>{input.value}</div>
                          )}
                          <button
                            onClick={() => handleCopyValue(input.value)}
                            className='rounded p-1 transition-colors hover:bg-blue-100'
                          >
                            {copiedValue === input.value ? (
                              <Check className='h-3.5 w-3.5 text-green-600' />
                            ) : (
                              <Copy className='h-3.5 w-3.5 text-neutral-400' />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {payload.tags && payload.tags.length > 0 && (
                <div className='rounded-lg border border-purple-200 bg-purple-50 p-4'>
                  <h3 className='mb-3 text-sm font-semibold text-neutral-900'>Tags</h3>
                  <div className='flex flex-wrap gap-2'>
                    {payload.tags.map((tag, idx) => (
                      <PillTag key={idx} variant='purple'>
                        {tag}
                      </PillTag>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className='mb-3 flex items-center justify-between'>
                <h3 className='text-sm font-semibold text-neutral-900'>Raw JSON</h3>
                <button
                  onClick={handleCopyRaw}
                  className='flex items-center gap-2 rounded bg-neutral-100 px-3 py-1.5 text-sm transition-colors hover:bg-neutral-200'
                >
                  {copiedRaw ? (
                    <>
                      <Check className='h-4 w-4 text-green-600' />
                      <span className='text-green-600'>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4 text-neutral-600' />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className='overflow-x-auto rounded-lg bg-neutral-900 p-4 font-mono text-xs text-green-400'>
                {JSON.stringify(payload.rawJson, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
