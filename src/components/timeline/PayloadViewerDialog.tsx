import { useMemo, useState } from 'react';
import { Copy, Download, FileBracesCorner } from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { DialogFrame } from '@/components/modals/DialogFrame';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/Accordion';
import { Carousel } from '@/components/ui/Carousel';
import { CodeViewer } from '@/components/ui/CodeViewer';
import { Spinner } from '@/components/ui/Spinner';
import { Tabs } from '@/components/ui/Tabs';
import { cn } from '@/utils/cn';
import { parseS3Uri } from '@/utils/files';
import { formatLabel, formatTimelineTimestamp, isPrimitive, isRecord } from './timeline.utils';
import { getTimelineStateVisual } from './timeline.visuals';

export interface PayloadViewerDialogState {
  eventId: string;
  state: string;
  timestamp: string;
  payloadId?: string;
}

export interface PayloadViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  states: PayloadViewerDialogState[];
  selectedStateEventId?: string | null;
  onSelectedStateEventIdChange?: (eventId: string) => void;
  payload?: Record<string, unknown> | null;
  isLoading?: boolean;
}

function PayloadEmptyState({ message }: { message: string }) {
  return (
    <div className='flex min-h-48 items-center justify-center rounded-md border border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-500 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9]'>
      {message}
    </div>
  );
}

export function PayloadJsonView({ formattedJson }: { formattedJson: string }) {
  return <CodeViewer code={formattedJson} language='json' showHeader={false} />;
}

/**
 * Renders an S3 URI as a link into the files explorer, pre-filtered to that
 * bucket and key prefix. Directory URIs (trailing slash) and object URIs both
 * work because the key is matched as a prefix pattern.
 *
 * Opens in a new tab so the payload dialog stays where the user left it.
 */
function S3UriLink({ bucket, s3Key, value }: { bucket: string; s3Key: string; value: string }) {
  return (
    <Link
      to={`/files?bucket=${encodeURIComponent(bucket)}&key=${encodeURIComponent(s3Key)}*`}
      target='_blank'
      rel='noopener noreferrer'
      className='wrap-break-words text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline focus:ring-2 focus:ring-blue-500/50 focus:outline-hidden dark:text-blue-400 dark:hover:text-blue-300'
      title={`View files in: ${value} (opens in a new tab)`}
    >
      {value}
    </Link>
  );
}

function PayloadValue({ value }: { value: unknown }) {
  if (value === null) {
    return <span className='text-sm text-neutral-400 dark:text-neutral-500'>null</span>;
  }

  if (typeof value === 'string') {
    const s3Uri = parseS3Uri(value);

    if (s3Uri) {
      return (
        <div className='max-w-full overflow-hidden'>
          <S3UriLink bucket={s3Uri.bucket} s3Key={s3Uri.key} value={value} />
        </div>
      );
    }

    return (
      <div className='wrap-break-words max-w-full overflow-auto text-sm whitespace-pre-wrap text-neutral-700 dark:text-neutral-300'>
        {value}
      </div>
    );
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className='text-sm text-neutral-700 dark:text-neutral-300'>{String(value)}</span>;
  }

  if (Array.isArray(value)) {
    const items = value as unknown[];

    if (items.length === 0) {
      return <span className='text-sm text-neutral-400 dark:text-neutral-500'>[]</span>;
    }

    if (items.every(isPrimitive)) {
      return (
        <ul className='space-y-1 text-sm text-neutral-700 dark:text-neutral-300'>
          {items.map((item, index) => (
            <li key={index} className='wrap-break-words ml-5 list-disc'>
              <PayloadValue value={item} />
            </li>
          ))}
        </ul>
      );
    }

    return (
      <div className='space-y-3'>
        {items.map((item, index) => (
          <div
            key={index}
            className='rounded-lg border border-neutral-200 bg-white/70 p-3 dark:border-neutral-800 dark:bg-neutral-900/70'
          >
            <div className='mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
              Item {index + 1}
            </div>
            <PayloadValue value={item} />
          </div>
        ))}
      </div>
    );
  }

  if (isRecord(value)) {
    const entries = Object.entries(value);

    if (entries.length === 0) {
      return <span className='text-sm text-neutral-400 dark:text-neutral-500'>{'{}'}</span>;
    }

    return (
      <div className='divide-y divide-neutral-100 bg-white/50 dark:divide-neutral-800 dark:bg-neutral-900/50'>
        {entries.map(([key, nestedValue]) => (
          <div
            key={key}
            className='grid gap-2 px-4 py-2 md:grid-cols-[160px_minmax(0,1fr)] md:items-start'
          >
            <dt className='text-sm font-semibold text-neutral-900 dark:text-neutral-100'>{key}</dt>
            <dd className='min-w-0'>
              <PayloadValue value={nestedValue} />
            </dd>
          </div>
        ))}
      </div>
    );
  }

  return (
    <pre className='overflow-x-auto rounded-md bg-neutral-100 p-3 font-mono text-xs text-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'>
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

export function PayloadViewerDialog({
  isOpen,
  onClose,
  states,
  selectedStateEventId,
  onSelectedStateEventIdChange,
  payload,
  isLoading = false,
}: PayloadViewerDialogProps) {
  const [activeTab, setActiveTab] = useState<'payload' | 'json'>('payload');

  const activeState = useMemo(
    () =>
      states.find((state) => state.eventId === selectedStateEventId) ??
      states[states.length - 1] ??
      null,
    [selectedStateEventId, states]
  );

  const activeStateIndex = useMemo(
    () => states.findIndex((state) => state.eventId === activeState?.eventId),
    [activeState?.eventId, states]
  );

  const payloadData = payload?.data;
  const payloadEntries = isRecord(payloadData) ? Object.entries(payloadData) : [];
  const hasStructuredPayload =
    payloadData !== undefined &&
    payloadData !== null &&
    (!isRecord(payloadData) || payloadEntries.length > 0);
  const formattedJson = payload ? JSON.stringify(payload, null, 2) : '';

  const handleCopy = async () => {
    if (!formattedJson) return;

    try {
      await navigator.clipboard.writeText(formattedJson);
      toast.success('Payload copied to clipboard');
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleDownload = () => {
    if (!formattedJson || !activeState) return;

    const blob = new Blob([formattedJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `state-${activeState.eventId}-payload.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Payload downloaded');
  };

  return (
    <DialogFrame
      isOpen={isOpen}
      onClose={onClose}
      title='Payload Viewer'
      icon={<FileBracesCorner className='h-5 w-5' />}
      size='full'
      panelClassName='flex flex-col'
      panelStyle={{ maxHeight: 'min(90vh, 900px)' }}
      bodyClassName='min-h-0 flex-1 overflow-y-auto'
      headerActions={
        <>
          <button
            type='button'
            onClick={() => void handleCopy()}
            disabled={!formattedJson}
            className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
            title='Copy to clipboard'
            aria-label='Copy payload to clipboard'
          >
            <Copy className='h-4 w-4' />
          </button>
          <button
            type='button'
            onClick={handleDownload}
            disabled={!formattedJson}
            className='rounded-md p-2 text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:text-[#9dabb9] dark:hover:bg-[#1e252e] dark:hover:text-slate-100'
            title='Download JSON'
            aria-label='Download payload JSON'
          >
            <Download className='h-4 w-4' />
          </button>
        </>
      }
      footer={
        <button
          type='button'
          onClick={onClose}
          className='rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
        >
          Close
        </button>
      }
    >
      {states.length > 0 ? (
        <>
          <div className='space-y-3'>
            <div>
              <h3 className='text-sm font-medium text-neutral-900 dark:text-slate-100'>
                Workflow States
              </h3>
              <p className='text-sm text-neutral-500 dark:text-[#9dabb9]'>
                Choose a state to inspect its payload.
              </p>
            </div>

            <Carousel
              activeIndex={activeStateIndex}
              onActiveIndexChange={(index) => {
                const nextState = states[index];
                if (nextState) onSelectedStateEventIdChange?.(nextState.eventId);
              }}
              centerActiveItem={isOpen}
              className='mt-1'
              containerClassName='bg-white dark:bg-[#111418]'
              contentClassName='gap-3'
              previousLabel='Previous state'
              nextLabel='Next state'
            >
              {states.map((state) => {
                const isSelected = activeState?.eventId === state.eventId;
                const stateVisual = getTimelineStateVisual(state.state);
                const StateIcon = stateVisual.icon;

                return (
                  <button
                    key={state.eventId}
                    type='button'
                    onClick={() => onSelectedStateEventIdChange?.(state.eventId)}
                    className={cn(
                      'shrink-0 basis-[min(72vw,220px)] rounded-lg border px-3 py-2 text-left shadow-xs transition-colors sm:basis-[calc((100%-0.75rem)/2)] md:basis-[calc((100%-1.5rem)/3)] lg:basis-[calc((100%-3rem)/5)]',
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:border-[#137fec] dark:bg-[#137fec]/10'
                        : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-[#2d3540] dark:bg-[#111418] dark:hover:border-[#3d4550]'
                    )}
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center gap-1.5'>
                        <span
                          className={cn(
                            'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                            stateVisual.nodeClassName
                          )}
                        >
                          <StateIcon className={cn('h-3 w-3', stateVisual.iconClassName)} />
                        </span>
                        <div className='wrap-break-words min-w-0 text-sm font-semibold text-neutral-900 dark:text-slate-100'>
                          {formatLabel(state.state)}
                        </div>
                      </div>
                      <div className='text-xs text-neutral-500 dark:text-[#9dabb9]'>
                        {formatTimelineTimestamp(state.timestamp)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </Carousel>
          </div>

          <div className='overflow-hidden rounded-lg bg-white bg-linear-to-r from-gray-50/80 to-white shadow-xs dark:bg-gray-900 dark:from-gray-800/80 dark:to-gray-800/50'>
            <Tabs
              tabs={[
                { id: 'payload', label: 'Payload Data' },
                { id: 'json', label: 'JSON View' },
              ]}
              activeTab={activeTab}
              onTabChange={(tabId) => setActiveTab(tabId as 'payload' | 'json')}
            />

            <div className='p-4'>
              {activeTab === 'payload' ? (
                isLoading ? (
                  <div className='flex min-h-56 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/70 p-6 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                    <div className='flex flex-col items-center gap-3 text-neutral-500 dark:text-[#9dabb9]'>
                      <Spinner className='h-6 w-6' />
                      <p className='text-sm'>Loading payload…</p>
                    </div>
                  </div>
                ) : !payload ? (
                  <PayloadEmptyState message='No payload data found for this state' />
                ) : isRecord(payloadData) ? (
                  hasStructuredPayload ? (
                    <Accordion
                      type='multiple'
                      defaultValue={payloadEntries.map(([key]) => key)}
                      className='space-y-3'
                    >
                      {payloadEntries.map(([key, value]) => (
                        <AccordionItem
                          key={key}
                          value={key}
                          className={cn(
                            'overflow-hidden rounded-lg border-0',
                            'bg-linear-to-r from-white via-gray-50/80 to-gray-100/50',
                            'dark:from-gray-900 dark:via-gray-800/80 dark:to-gray-800/50',
                            'shadow-xs hover:shadow-md',
                            'ring-1 ring-gray-200/50 dark:ring-gray-700/50',
                            'transition-all duration-200 ease-in-out'
                          )}
                        >
                          <AccordionTrigger
                            className={cn(
                              'border-0 px-4 py-2.5 text-sm font-semibold text-neutral-900 no-underline hover:no-underline dark:text-neutral-100',
                              'bg-linear-to-r from-blue-50/90 to-transparent',
                              'dark:from-blue-900/30 dark:to-transparent'
                            )}
                          >
                            {key}
                          </AccordionTrigger>
                          <AccordionContent className='pb-0'>
                            <PayloadValue value={value} />
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <PayloadEmptyState message='No payload data found for this state' />
                  )
                ) : hasStructuredPayload ? (
                  <div className='rounded-lg border border-neutral-200 bg-white/70 dark:border-neutral-800 dark:bg-neutral-900/70'>
                    <PayloadValue value={payloadData} />
                  </div>
                ) : (
                  <PayloadEmptyState message='No payload data found for this state' />
                )
              ) : isLoading ? (
                <div className='flex min-h-56 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50/70 p-6 dark:border-[#2d3540] dark:bg-[#1e252e]'>
                  <div className='flex flex-col items-center gap-3 text-neutral-500 dark:text-[#9dabb9]'>
                    <Spinner className='h-6 w-6' />
                    <p className='text-sm'>Loading payload…</p>
                  </div>
                </div>
              ) : payload ? (
                <PayloadJsonView formattedJson={formattedJson} />
              ) : (
                <PayloadEmptyState message='No payload data found for this state' />
              )}
            </div>
          </div>
        </>
      ) : (
        <PayloadEmptyState message='No workflow states available' />
      )}
    </DialogFrame>
  );
}
