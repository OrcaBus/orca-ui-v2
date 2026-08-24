import type { ReactNode } from 'react';
import { PillTag } from '../../../components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatCalendarDate, formatDetailDate } from '../../../utils/timeFormat';
import { getCaseStudyTypeVariant } from '../utils/getCaseVariants';
import { formatCaseText } from '../utils/caseDisplay';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { cn } from '@/utils/cn';

const TYPE_DISPLAY_LABELS: Record<string, string> = {
  wgts: 'WGTS T-N',
  cttso: 'ctTSO500',
  wgs_n: 'WGS_N',
};

/**
 * One row of related attributes. Every section shares the same column template,
 * so fields stay aligned down the card while each group keeps its own row even
 * when the grid narrows to two or three columns.
 */
function Section({ children }: { children: ReactNode }) {
  return (
    <div className='grid grid-cols-2 gap-x-6 gap-y-2.5 sm:grid-cols-3 xl:grid-cols-4'>
      {children}
    </div>
  );
}

interface FieldProps {
  label: string;
  /** Width of the loading placeholder, matched to the expected value length. */
  skeletonClassName?: string;
  className?: string;
  children: ReactNode;
}

function Field({ label, skeletonClassName = 'h-4 w-28', className, children }: FieldProps) {
  const { isLoadingCaseDetail } = useCaseDetailsContext();

  return (
    <div className={cn('min-w-0', className)}>
      <div className='text-caption mb-0.5 font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
        {label}
      </div>
      {isLoadingCaseDetail ? <Skeleton className={skeletonClassName} /> : children}
    </div>
  );
}

const valueClass = 'text-sm text-neutral-900 dark:text-neutral-100';
const monoValueClass = 'font-mono text-sm break-words text-neutral-900 dark:text-neutral-100';
const emptyClass = 'text-sm text-neutral-500 dark:text-neutral-400';

function YesNoTag({ value }: { value: boolean | null | undefined }) {
  if (value == null) {
    return <span className={emptyClass}>—</span>;
  }
  return (
    <PillTag variant={value ? 'green' : 'neutral'} size='sm'>
      {value ? 'Yes' : 'No'}
    </PillTag>
  );
}

export function CaseDetailsOverviewCard() {
  const { caseDetail } = useCaseDetailsContext();

  const links = (caseDetail?.links ?? null) as Record<string, string> | null;
  const linkEntries = links ? Object.entries(links) : [];
  const rnasumReferences = caseDetail?.rnasumReferences ?? [];

  return (
    <div className='rounded-lg border border-neutral-200 bg-white p-3 sm:p-4 dark:border-neutral-700 dark:bg-[#111418]'>
      <div className='space-y-2.5'>
        {/* Identity — what this case is and where it stands right now */}
        <Section>
          <Field label='Request Form ID' skeletonClassName='h-4 w-40'>
            <span className={cn(valueClass, 'font-medium')}>
              {caseDetail?.requestFormId ?? '—'}
            </span>
          </Field>

          <Field label='Alias' skeletonClassName='h-4 w-32'>
            <span className={monoValueClass}>
              {caseDetail?.alias && caseDetail.alias.length > 0 ? caseDetail.alias.join(', ') : '—'}
            </span>
          </Field>

          <Field label='Type' skeletonClassName='h-5 w-24'>
            <PillTag variant='blue' size='sm'>
              {TYPE_DISPLAY_LABELS[caseDetail?.type ?? ''] ?? caseDetail?.type ?? '—'}
            </PillTag>
          </Field>

          <Field label='Status' skeletonClassName='h-5 w-28'>
            {caseDetail?.latestState ? (
              <StatusBadge status={caseDetail.latestState.status} />
            ) : (
              <span className={emptyClass}>—</span>
            )}
          </Field>
        </Section>

        {/* Study — the REDCap-managed identifiers that describe the subject */}
        <Section>
          <Field label='Study Name' skeletonClassName='h-4 w-32'>
            <span className={cn(valueClass, 'font-medium')}>
              {formatCaseText(caseDetail?.studyName)}
            </span>
          </Field>

          <Field label='Study ID'>
            <span className={monoValueClass}>{formatCaseText(caseDetail?.studyId)}</span>
          </Field>

          <Field label='Study Type' skeletonClassName='h-5 w-24'>
            <PillTag
              variant={
                caseDetail?.studyType ? getCaseStudyTypeVariant(caseDetail.studyType) : 'neutral'
              }
              size='sm'
            >
              {caseDetail?.studyType ?? '—'}
            </PillTag>
          </Field>

          <Field label='UR Number'>
            <span className={monoValueClass}>{formatCaseText(caseDetail?.urNumber)}</span>
          </Field>
        </Section>

        {/* Reporting — obligations and the timeline they run against */}
        <Section>
          <Field label='Report Required' skeletonClassName='h-5 w-16'>
            <YesNoTag value={caseDetail?.isReportRequired} />
          </Field>

          <Field label='NATA Accredited' skeletonClassName='h-5 w-16'>
            <YesNoTag value={caseDetail?.isNataAccredited} />
          </Field>

          <Field label='Due Date'>
            <span className={cn(valueClass, 'font-medium')}>
              {caseDetail?.dueDate ? formatCalendarDate(caseDetail.dueDate) : '—'}
            </span>
          </Field>

          <Field label='Last Updated' skeletonClassName='h-4 w-36'>
            <span className={valueClass}>
              {caseDetail?.latestState?.createdAt
                ? formatDetailDate(caseDetail.latestState.createdAt)
                : '—'}
            </span>
          </Field>
        </Section>

        {/* References — analysis inputs and related external destinations */}
        <Section>
          <Field
            label='RNAsum References'
            skeletonClassName='h-4 w-40'
            className='col-span-2 sm:col-span-3 xl:col-span-2'
          >
            {rnasumReferences.length > 0 ? (
              <ul className='flex flex-wrap gap-1'>
                {rnasumReferences.map((reference) => (
                  <li key={reference}>
                    <PillTag variant='purple' size='sm'>
                      {reference}
                    </PillTag>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={emptyClass}>—</span>
            )}
          </Field>

          <Field
            label='Links'
            skeletonClassName='h-4 w-48'
            className='col-span-2 sm:col-span-3 xl:col-span-2'
          >
            {linkEntries.length > 0 ? (
              <ul className='flex flex-wrap gap-x-4 gap-y-1'>
                {linkEntries.map(([name, url]) => (
                  <li key={name}>
                    <a
                      href={url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-sm text-blue-600 hover:underline dark:text-blue-400'
                    >
                      {name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <span className={emptyClass}>—</span>
            )}
          </Field>
        </Section>

        <Section>
          <Field
            label='Description'
            skeletonClassName='h-4 w-full'
            className='col-span-2 sm:col-span-3 xl:col-span-4'
          >
            <span className='text-sm text-neutral-700 dark:text-neutral-300'>
              {caseDetail?.description ?? '—'}
            </span>
          </Field>
        </Section>
      </div>
    </div>
  );
}
