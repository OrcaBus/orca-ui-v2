import {
  FileText,
  Clock,
  User,
  MessageSquare,
  Download,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { formatTableDate } from '@/utils/timeFormat';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Tabs } from '@/components/ui/Tabs';
import { CodeViewer } from '@/components/ui/CodeViewer';
import { DialogFrame } from '@/components/modals/DialogFrame';
import { downloadCsvFile, jsonToCsv } from '@/utils/csv';
import type { SequenceRunSampleSheetDetailModel } from '../../shared/api/sequence.api';

// ---------------------------------------------------------------------------
// Formatted-view helpers
// ---------------------------------------------------------------------------

type SectionValue = string | number | boolean | null | undefined;
type SectionRecord = Record<string, SectionValue>;

interface ParsedSampleSheet {
  header?: SectionRecord;
  reads?: SectionRecord;
  sequencing?: SectionRecord;
  bclconvertSettings?: SectionRecord;
  bclconvertData?: SectionRecord[];
  cloudSettings?: SectionRecord;
  cloudData?: SectionRecord[];
  tso500lSettings?: SectionRecord;
  tso500lData?: SectionRecord[];
  cloudTSO500LSettings?: SectionRecord;
  cloudTSO500LData?: SectionRecord[];
  tso500sSettings?: SectionRecord;
  tso500sData?: SectionRecord[];
  cloudTSO500SSettings?: SectionRecord;
  cloudTSO500SData?: SectionRecord[];
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^\s/, '')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function KeyValueGrid({ data }: { data: SectionRecord }) {
  const entries = Object.entries(data).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return null;
  return (
    <div className='grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3'>
      {entries.map(([k, v]) => (
        <div key={k} className='min-w-0'>
          <dt className='text-xs font-medium text-neutral-500 dark:text-neutral-400'>
            {formatKey(k)}
          </dt>
          <dd
            className='mt-0.5 truncate rounded bg-neutral-50 px-1.5 py-0.5 font-mono text-sm text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
            title={String(v)}
          >
            {String(v)}
          </dd>
        </div>
      ))}
    </div>
  );
}

function SectionDataTable({ data }: { data: SectionRecord[] }) {
  if (!data.length) return null;
  const headers = Object.keys(data[0]);
  return (
    <div className='overflow-x-auto'>
      <table className='min-w-full divide-y divide-neutral-200 text-xs dark:divide-neutral-700'>
        <thead>
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className='px-3 py-2 text-left font-semibold text-neutral-600 dark:text-neutral-400'
              >
                {formatKey(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className='divide-y divide-neutral-100 dark:divide-neutral-800'>
          {data.map((row, i) => (
            <tr key={i} className='hover:bg-neutral-50 dark:hover:bg-neutral-800/50'>
              {headers.map((h) => (
                <td key={h} className='px-3 py-2 font-mono text-neutral-700 dark:text-neutral-300'>
                  {String(row[h] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccordionSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className='rounded-lg border border-neutral-200 dark:border-neutral-700'>
      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        className='flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-800 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-800/50'
      >
        {title}
        {open ? (
          <ChevronDown className='h-4 w-4 text-neutral-500' />
        ) : (
          <ChevronRight className='h-4 w-4 text-neutral-500' />
        )}
      </button>
      {open && (
        <div className='border-t border-neutral-200 p-4 dark:border-neutral-700'>{children}</div>
      )}
    </div>
  );
}

function FormattedView({ sampleSheet }: { sampleSheet: SequenceRunSampleSheetDetailModel }) {
  const parsed = sampleSheet.sampleSheetContent as ParsedSampleSheet | null | undefined;
  const hasStructured = parsed != null && typeof parsed === 'object';

  const pipelineSections = hasStructured
    ? [
        {
          title: 'BCL Convert Settings',
          settings: parsed.bclconvertSettings,
          data: parsed.bclconvertData,
        },
        {
          title: 'BaseSpace / Cloud Settings',
          settings: parsed.cloudSettings,
          data: parsed.cloudData,
        },
        { title: 'TSO500L Settings', settings: parsed.tso500lSettings, data: parsed.tso500lData },
        {
          title: 'Cloud TSO500L Settings',
          settings: parsed.cloudTSO500LSettings,
          data: parsed.cloudTSO500LData,
        },
        { title: 'TSO500S Settings', settings: parsed.tso500sSettings, data: parsed.tso500sData },
        {
          title: 'Cloud TSO500S Settings',
          settings: parsed.cloudTSO500SSettings,
          data: parsed.cloudTSO500SData,
        },
      ].filter((s) => s.settings || (s.data && s.data.length > 0))
    : [];

  if (hasStructured) {
    return (
      <div className='space-y-4'>
        {(parsed.header || parsed.reads) && (
          <AccordionSection title='Header & Reads' defaultOpen>
            <div className='space-y-4'>
              {parsed.header && <KeyValueGrid data={parsed.header} />}
              {parsed.reads && (
                <>
                  <hr className='border-neutral-200 dark:border-neutral-700' />
                  <div>
                    <p className='mb-2 text-xs font-semibold tracking-wide text-neutral-500 uppercase dark:text-neutral-400'>
                      Reads
                    </p>
                    <KeyValueGrid data={parsed.reads} />
                  </div>
                </>
              )}
            </div>
          </AccordionSection>
        )}

        {pipelineSections.map((section) => (
          <AccordionSection key={section.title} title={section.title} defaultOpen>
            <div className='space-y-4'>
              {section.settings && <KeyValueGrid data={section.settings} />}
              {section.data && section.data.length > 0 && (
                <>
                  {section.settings && (
                    <hr className='border-neutral-200 dark:border-neutral-700' />
                  )}
                  <SectionDataTable data={section.data} />
                </>
              )}
            </div>
          </AccordionSection>
        ))}

        {/* Always show raw CSV at the bottom as fallback reference */}
        {sampleSheet.sampleSheetContentOriginal && (
          <AccordionSection title='Raw CSV'>
            <pre className='overflow-x-auto rounded-md bg-neutral-50 p-3 font-mono text-xs text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'>
              {sampleSheet.sampleSheetContentOriginal}
            </pre>
          </AccordionSection>
        )}
      </div>
    );
  }

  // No structured content — fall back to raw CSV
  if (sampleSheet.sampleSheetContentOriginal) {
    return (
      <pre className='rounded-md bg-neutral-50 p-4 font-mono text-xs whitespace-pre text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'>
        {sampleSheet.sampleSheetContentOriginal}
      </pre>
    );
  }

  return (
    <div className='flex items-center justify-center py-12 text-sm text-neutral-500 dark:text-neutral-400'>
      No content available for this sample sheet.
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SampleSheetViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleSheet: SequenceRunSampleSheetDetailModel | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SampleSheetViewModal({ isOpen, onClose, sampleSheet }: SampleSheetViewModalProps) {
  if (!isOpen || !sampleSheet) return null;

  return (
    <SampleSheetViewModalContent
      key={sampleSheet.orcabusId}
      onClose={onClose}
      sampleSheet={sampleSheet}
    />
  );
}

function SampleSheetViewModalContent({
  onClose,
  sampleSheet,
}: {
  onClose: () => void;
  sampleSheet: SequenceRunSampleSheetDetailModel;
}) {
  const [activeTab, setActiveTab] = useState<'formatted' | 'csv' | 'json'>('formatted');

  // CSV: use original if present, otherwise derive from the parsed JSON
  const csvContent =
    sampleSheet.sampleSheetContentOriginal ?? jsonToCsv(sampleSheet.sampleSheetContent);

  // JSON: stringify the structured content directly (sampleSheetContent is unknown)
  const jsonText =
    sampleSheet.sampleSheetContent != null
      ? JSON.stringify(sampleSheet.sampleSheetContent, null, 2)
      : null;

  const baseName = sampleSheet.sampleSheetName.replace(/\.[^.]+$/, '');
  const downloadFormat = activeTab === 'json' ? 'JSON' : 'CSV';
  const canDownload = activeTab === 'json' ? jsonText != null : csvContent.length > 0;

  const handleDownload = () => {
    if (activeTab === 'csv' || activeTab === 'formatted') {
      if (!csvContent) return;
      downloadCsvFile(
        csvContent,
        sampleSheet.sampleSheetName.endsWith('.csv')
          ? sampleSheet.sampleSheetName
          : `${baseName}.csv`
      );
      return;
    }

    if (!jsonText) return;
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DialogFrame
      isOpen={true}
      onClose={onClose}
      title={sampleSheet.sampleSheetName}
      description='Sample Sheet Viewer'
      icon={<FileText className='h-5 w-5' />}
      size='full'
      closeLabel='Close sample sheet viewer'
      panelClassName='flex flex-col'
      panelStyle={{ maxHeight: 'min(90vh, 900px)' }}
      bodyClassName='flex min-h-0 flex-1 flex-col space-y-0 overflow-hidden p-0'
      headerActions={
        <button
          type='button'
          onClick={handleDownload}
          disabled={!canDownload}
          className='flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-50 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#9dabb9] dark:hover:bg-[#2d3540]'
          aria-label={`Download sample sheet as ${downloadFormat}`}
          title={`Download ${downloadFormat}`}
        >
          <Download className='h-3.5 w-3.5' />
          Download {downloadFormat}
        </button>
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
      {/* Metadata row */}
      <div className='shrink-0 border-b border-neutral-200 bg-neutral-50 px-6 py-3 dark:border-neutral-700 dark:bg-neutral-800/50'>
        <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs text-neutral-600 dark:text-neutral-400'>
          <span className='flex items-center gap-1.5'>
            <Clock className='h-3.5 w-3.5' />
            {formatTableDate(sampleSheet.associationTimestamp)}
          </span>
          <span className='flex items-center gap-1.5'>
            <User className='h-3.5 w-3.5' />
            {sampleSheet.comment?.createdBy ?? '—'}
          </span>
          {sampleSheet.associationStatus && <StatusBadge status={sampleSheet.associationStatus} />}
        </div>
        {sampleSheet.comment?.comment && (
          <div className='mt-2 flex items-start gap-2 rounded-md border border-neutral-200 bg-white p-2.5 dark:border-neutral-700 dark:bg-neutral-800'>
            <MessageSquare className='mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-400' />
            <p className='text-xs text-neutral-700 dark:text-neutral-300'>
              {sampleSheet.comment.comment}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className='shrink-0 px-6 pt-3'>
        <Tabs
          tabs={[
            { id: 'formatted', label: 'Formatted' },
            { id: 'csv', label: 'CSV' },
            { id: 'json', label: 'JSON' },
          ]}
          activeTab={activeTab}
          onTabChange={(id) => setActiveTab(id as 'formatted' | 'csv' | 'json')}
        />
      </div>

      {/* Scrollable content */}
      <div className='min-h-0 flex-1 overflow-y-auto px-6 py-4'>
        {activeTab === 'formatted' ? (
          <FormattedView sampleSheet={sampleSheet} />
        ) : activeTab === 'csv' ? (
          csvContent ? (
            <pre className='rounded-md bg-neutral-50 p-4 font-mono text-xs whitespace-pre text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200'>
              {csvContent}
            </pre>
          ) : (
            <div className='flex items-center justify-center py-12 text-sm text-neutral-500 dark:text-neutral-400'>
              No CSV content available.
            </div>
          )
        ) : jsonText ? (
          <CodeViewer
            code={jsonText}
            language='json'
            title={`${baseName}.json`}
            showHeader={false}
          />
        ) : (
          <div className='flex items-center justify-center py-12 text-sm text-neutral-500 dark:text-neutral-400'>
            No JSON content available.
          </div>
        )}
      </div>
    </DialogFrame>
  );
}
