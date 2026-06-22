import { AlertTriangle, RefreshCw } from 'lucide-react';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { useLibraryDetails } from '../context/LibraryDetailsContext';
import { useLibraryLinkageFiles } from '../hooks/useLibraryLinkageFiles';
import type { LibraryLinkageFileGroup, LibraryLinkageFileGroupKey } from '../utils/libraryLinkage';

const FALLBACK_VALUE = '-';

const fileGroupStyles: Record<LibraryLinkageFileGroupKey, string> = {
  sequence:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300',
  analysis:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300',
  metrics:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300',
  reports:
    'border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300',
  other:
    'border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#c1cbd8]',
};

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}

function DetailRow({ label, children, valueClassName }: DetailRowProps) {
  return (
    <div className='flex min-w-0 flex-col gap-1'>
      <div className='text-xs text-neutral-600 dark:text-[#9dabb9]'>{label}</div>
      <div className={valueClassName ?? 'text-sm font-medium text-neutral-900 dark:text-white'}>
        {children}
      </div>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className='space-y-3'>
      {[0, 1, 2].map((item) => (
        <div key={item} className='space-y-2'>
          <div className='h-3 w-24 animate-pulse rounded bg-neutral-200 dark:bg-[#2d3540]' />
          <div className='flex gap-2'>
            <div className='h-6 w-28 animate-pulse rounded-full bg-neutral-200 dark:bg-[#2d3540]' />
            <div className='h-6 w-36 animate-pulse rounded-full bg-neutral-200 dark:bg-[#2d3540]' />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyLinkageMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className='rounded-md border border-dashed border-neutral-200 px-4 py-5 text-sm text-neutral-500 dark:border-[#2d3540] dark:text-[#9dabb9]'>
      {children}
    </div>
  );
}

function LinkageErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className='rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10'>
      <div className='flex items-start gap-3'>
        <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400' />
        <div className='min-w-0 flex-1'>
          <div className='text-sm font-medium text-red-800 dark:text-red-300'>
            Unable to load linkage files
          </div>
          <button
            type='button'
            onClick={onRetry}
            className='mt-2 inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-500/30 dark:bg-transparent dark:text-red-300 dark:hover:bg-red-500/10'
          >
            <RefreshCw className='h-3.5 w-3.5' aria-hidden='true' />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function FileNameBadge({
  filename,
  groupKey,
}: {
  filename: string;
  groupKey: LibraryLinkageFileGroupKey;
}) {
  return (
    <span
      title={filename}
      className={`inline-flex max-w-full min-w-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium ${fileGroupStyles[groupKey]}`}
    >
      <span className='truncate'>{filename}</span>
    </span>
  );
}

function LinkageFileGroupList({ groups }: { groups: LibraryLinkageFileGroup[] }) {
  return (
    <div className='flex flex-col gap-4'>
      {groups.map((group) => (
        <section key={group.key} className='min-w-0'>
          <div className='mb-2 flex items-center gap-2'>
            <h4 className='text-xs font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
              {group.label}
            </h4>
            <span className='rounded-full bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 dark:bg-[#2d3540] dark:text-[#9dabb9]'>
              {group.files.length}
            </span>
          </div>
          <div className='flex min-w-0 flex-wrap gap-2'>
            {group.files.map((file) => (
              <FileNameBadge key={file.id} filename={file.filename} groupKey={group.key} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LibraryDetailsOverviewCard() {
  const { libraryDetail, isLoadingLibraryDetail } = useLibraryDetails();
  const {
    groupedFiles,
    hasMatchingWorkflowConfig,
    hasLatestWorkflowRuns,
    hasTruncatedFileResults,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useLibraryLinkageFiles({
    libraryDetail,
    enabled: !isLoadingLibraryDetail,
  });

  if (isLoadingLibraryDetail) {
    return (
      <div className='mb-4 rounded-lg border border-neutral-200 bg-white p-6 dark:border-[#2d3540] dark:bg-[#1e252e]'>
        <LoadingBlock />
      </div>
    );
  }

  const projects = libraryDetail.projectSet
    .map((project) => project.projectId ?? project.name ?? project.orcabusId)
    .filter(Boolean);

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-6 dark:border-[#2d3540] dark:bg-[#1e252e]'>
      <div className='flex flex-col gap-6 xl:flex-row'>
        <div className='min-w-0 flex-1'>
          <h3 className='mb-4 font-medium text-neutral-900 dark:text-white'>Library Details</h3>
          <div className='grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3'>
            <DetailRow label='Phenotype'>{formatDisplayValue(libraryDetail.phenotype)}</DetailRow>
            <DetailRow label='Workflow'>{formatDisplayValue(libraryDetail.workflow)}</DetailRow>
            <DetailRow label='Quality'>
              {libraryDetail.quality ? (
                <PillTag variant={getQualityVariant(libraryDetail.quality)} size='sm'>
                  {formatDisplayValue(libraryDetail.quality)}
                </PillTag>
              ) : (
                FALLBACK_VALUE
              )}
            </DetailRow>
            <DetailRow label='Type'>
              {libraryDetail.type ? (
                <PillTag variant='blue' size='sm'>
                  {libraryDetail.type}
                </PillTag>
              ) : (
                FALLBACK_VALUE
              )}
            </DetailRow>
            <DetailRow label='Assay'>{formatDisplayValue(libraryDetail.assay)}</DetailRow>
            <DetailRow label='Coverage'>
              {libraryDetail.coverage != null ? `${libraryDetail.coverage}x` : FALLBACK_VALUE}
            </DetailRow>
            <DetailRow
              label='Override Cycles'
              valueClassName='font-mono text-xs text-neutral-900 dark:text-white'
            >
              {formatDisplayValue(libraryDetail.overrideCycles)}
            </DetailRow>
            <DetailRow
              label='Subject ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {formatDisplayValue(libraryDetail.subject?.subjectId)}
            </DetailRow>
            <DetailRow
              label='Sample ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {formatDisplayValue(libraryDetail.sample?.sampleId)}
            </DetailRow>
            <DetailRow
              label='External Sample ID'
              valueClassName='font-mono text-sm font-medium text-neutral-900 dark:text-white'
            >
              {formatDisplayValue(libraryDetail.sample?.externalSampleId)}
            </DetailRow>
            <DetailRow label='Source'>
              {formatDisplayValue(libraryDetail.sample?.source, { capitalize: true })}
            </DetailRow>
            <DetailRow label='Projects'>
              {projects.length > 0 ? (
                <div className='flex flex-wrap gap-1.5'>
                  {projects.map((project) => (
                    <PillTag key={project} variant='neutral' size='sm'>
                      {project}
                    </PillTag>
                  ))}
                </div>
              ) : (
                FALLBACK_VALUE
              )}
            </DetailRow>
          </div>
        </div>

        <div
          className='hidden w-px shrink-0 bg-neutral-200 xl:block dark:bg-[#2d3540]'
          aria-hidden
        />
        <div className='h-px bg-neutral-200 xl:hidden dark:bg-[#2d3540]' aria-hidden />

        <div className='min-w-0 flex-1'>
          <div className='mb-4 flex items-center justify-between gap-3'>
            <h3 className='font-medium text-neutral-900 dark:text-white'>Linkage</h3>
            {isFetching && !isLoading && (
              <RefreshCw
                className='h-4 w-4 animate-spin text-neutral-400 dark:text-[#9dabb9]'
                aria-label='Refreshing linkage files'
              />
            )}
          </div>

          {isError ? (
            <LinkageErrorState onRetry={() => void refetch()} />
          ) : isLoading ? (
            <LoadingBlock />
          ) : groupedFiles.length > 0 ? (
            <>
              <LinkageFileGroupList groups={groupedFiles} />
              {hasTruncatedFileResults && (
                <div className='mt-3 text-xs text-neutral-500 italic dark:text-[#9dabb9]'>
                  Some linkage files may be hidden by pagination.
                </div>
              )}
            </>
          ) : !hasMatchingWorkflowConfig ? (
            <EmptyLinkageMessage>
              No linkage file highlights are configured for this library type.
            </EmptyLinkageMessage>
          ) : !hasLatestWorkflowRuns ? (
            <EmptyLinkageMessage>
              No successful workflow runs were found for linkage.
            </EmptyLinkageMessage>
          ) : (
            <EmptyLinkageMessage>No linkage files found for the latest runs.</EmptyLinkageMessage>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDisplayValue(
  value: string | number | null | undefined,
  options: { capitalize?: boolean } = {}
): string {
  if (value === null || value === undefined || value === '') {
    return FALLBACK_VALUE;
  }

  const displayValue = String(value);
  if (!options.capitalize) {
    return displayValue;
  }

  return displayValue.charAt(0).toUpperCase() + displayValue.slice(1);
}

function getQualityVariant(quality: string): PillTagVariant {
  const normalizedQuality = quality.toLowerCase();

  if (normalizedQuality === 'good') {
    return 'green';
  }

  if (normalizedQuality === 'borderline') {
    return 'amber';
  }

  if (normalizedQuality === 'poor' || normalizedQuality === 'very-poor') {
    return 'red';
  }

  return 'neutral';
}
