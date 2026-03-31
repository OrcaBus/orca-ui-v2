import { PillTag } from '@/components/ui/PillTag';
import type { File, Library } from '../../../data/mockData';

interface LibraryOverviewCardProps {
  library: Library;
  relatedFiles: File[];
  relatedLibraries: Library[];
}

/* ----- Helpers ----- */

const SEQUENCE_TYPES = new Set(['BAM', 'BAI', 'VCF', 'FASTQ']);
const REPORT_TYPES = new Set(['HTML', 'PDF', 'CSV']);

function isSequenceFile(file: File): boolean {
  return SEQUENCE_TYPES.has(file.type) || /\.(bam|vcf|vcf\.gz|fastq\.gz)$/i.test(file.name);
}

function isAnalysisReport(file: File): boolean {
  return REPORT_TYPES.has(file.type) || file.reportType === 'QC Report';
}

/* ----- Detail row (single attribute) ----- */

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}

function DetailRow({ label, children, valueClassName }: DetailRowProps) {
  return (
    <div className='flex flex-col gap-1'>
      <div className='text-xs text-neutral-600 dark:text-[#9dabb9]'>{label}</div>
      <div className={valueClassName ?? 'text-sm font-medium text-neutral-900 dark:text-white'}>
        {children}
      </div>
    </div>
  );
}

/* ----- Linkage subsection ----- */

const linkageSectionLabel =
  'text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-[#9dabb9]';
const linkageEmptyText = 'text-xs text-neutral-500 dark:text-[#9dabb9]';
const linkagePillsWrap = 'flex flex-wrap gap-2';

function LinkageSection({
  title,
  emptyLabel,
  children,
}: {
  title: string;
  emptyLabel: string;
  children?: React.ReactNode;
}) {
  const isEmpty = children == null || (Array.isArray(children) && children.length === 0);
  return (
    <div className='flex flex-col gap-2'>
      <div className={linkageSectionLabel}>{title}</div>
      <div className={linkagePillsWrap}>
        {isEmpty ? <span className={linkageEmptyText}>{emptyLabel}</span> : children}
      </div>
    </div>
  );
}

export function LibraryOverviewCard({
  library,
  relatedFiles,
  relatedLibraries,
}: LibraryOverviewCardProps) {
  const sequenceFiles = relatedFiles.filter(isSequenceFile);
  const analysisReports = relatedFiles.filter(isAnalysisReport);
  const connectedLibraries = relatedLibraries.filter((lib) => lib.id !== library.id);

  return (
    <div className='mb-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-[#2d3540] dark:bg-[#1e252e]'>
      <div className='flex gap-6'>
        {/* Left 1/2 – Library details */}
        <div className='min-w-0 flex-1'>
          <h3 className='mb-4 font-medium text-neutral-900 dark:text-white'>Library Details</h3>
          <div className='grid grid-cols-3 gap-x-6 gap-y-4'>
            <DetailRow label='Phenotype'>
              <span className='capitalize'>{library.phenotype}</span>
            </DetailRow>
            <DetailRow label='Workflow'>{library.workflow}</DetailRow>
            <DetailRow label='Quality'>
              <PillTag
                variant={
                  library.quality >= 8 ? 'green' : library.quality >= 7 ? 'amber' : 'neutral'
                }
                size='sm'
              >
                {library.quality.toFixed(1)}
              </PillTag>
            </DetailRow>
            <DetailRow label='Type'>
              <PillTag variant='blue' size='sm'>
                {library.type}
              </PillTag>
            </DetailRow>
            <DetailRow label='Assay'>{library.assay}</DetailRow>
            <DetailRow label='Coverage'>{library.coverage}x</DetailRow>
            <DetailRow
              label='Override Cycles'
              valueClassName='font-mono text-xs text-neutral-900 dark:text-white'
            >
              {library.overrideCycles}
            </DetailRow>
            <DetailRow
              label='Subject ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {library.subjectId}
            </DetailRow>
            <DetailRow
              label='Sample ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {library.sampleId}
            </DetailRow>
            <DetailRow
              label='External Sample ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {library.externalSampleId}
            </DetailRow>
            <DetailRow label='Source'>
              <span className='capitalize'>{library.source}</span>
            </DetailRow>
            <DetailRow
              label='Project'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {library.projectId}
            </DetailRow>
          </div>
        </div>

        {/* Vertical separator */}
        <div className='w-px shrink-0 bg-neutral-200 dark:bg-[#2d3540]' aria-hidden />

        {/* Right 1/2 – Linkage */}
        <div className='min-w-0 flex-1'>
          <h3 className='mb-4 font-medium text-neutral-900 dark:text-white'>LINKAGE</h3>
          <div className='flex flex-col gap-4'>
            <LinkageSection title='Sequence Data' emptyLabel='No sequence files'>
              {sequenceFiles.map((file) => (
                <PillTag key={file.id} variant={file.type === 'VCF' ? 'blue' : 'neutral'} size='sm'>
                  {file.name}
                </PillTag>
              ))}
            </LinkageSection>

            <LinkageSection title='Analysis Reports' emptyLabel='No reports'>
              {analysisReports.map((file) => (
                <span
                  key={file.id}
                  className='inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400'
                >
                  {file.type === 'HTML' && (
                    <span className='text-[10px] font-normal text-amber-600 dark:text-amber-500'>
                      HTML
                    </span>
                  )}
                  {file.name}
                </span>
              ))}
            </LinkageSection>

            <LinkageSection title='Connected Libraries' emptyLabel='No connected libraries'>
              {connectedLibraries.slice(0, 6).map((lib, index) => (
                <PillTag key={index} variant={'neutral'} size='sm'>
                  {lib.name}
                </PillTag>
              ))}
            </LinkageSection>
          </div>
        </div>
      </div>
    </div>
  );
}
