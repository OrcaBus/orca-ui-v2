import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { PillTag } from '../../../components/ui/PillTag';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/Collapsible';
import { formatCalendarDate, formatDetailDate } from '../../../utils/timeFormat';
import { getCaseStudyTypeVariant } from '../utils/getCaseVariants';
import { formatCaseText, EMPTY_CASE_VALUE } from '../utils/caseDisplay';
import { useCaseDetailsContext } from '../context/CaseDetailsContext';
import { cn } from '@/utils/cn';

const TYPE_DISPLAY_LABELS: Record<string, string> = {
  wgts: 'WGTS T-N',
  cttso: 'ctTSO500',
  wgs_n: 'WGS_N',
};

const valueClass = 'text-sm text-neutral-900 dark:text-neutral-100';
const monoValueClass = 'font-mono text-sm break-words text-neutral-900 dark:text-neutral-100';
const emptyClass = 'text-sm text-neutral-500 dark:text-neutral-400';

/** One row of the Case_Details_Rail's key/value grid. */
interface CaseField {
  label: string;
  render: () => ReactNode;
  isEmpty: () => boolean;
}

function YesNoTag({ value }: { value: boolean | null | undefined }) {
  if (value == null) {
    return <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>;
  }
  return (
    <PillTag variant={value ? 'green' : 'neutral'} size='sm'>
      {value ? 'Yes' : 'No'}
    </PillTag>
  );
}

function useCaseFields(): CaseField[] {
  const { caseDetail } = useCaseDetailsContext();

  const links = (caseDetail?.links ?? null) as Record<string, string> | null;
  const linkEntries = links ? Object.entries(links) : [];
  const rnasumReferences = caseDetail?.rnasumReferences ?? [];
  const alias = caseDetail?.alias ?? [];

  return [
    {
      label: 'Request Form ID',
      isEmpty: () => caseDetail?.requestFormId == null || caseDetail.requestFormId === '',
      render: () => (
        <span className={cn(valueClass, 'font-medium')}>
          {caseDetail?.requestFormId ?? EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      label: 'Alias',
      isEmpty: () => alias.length === 0,
      render: () => (
        <span className={monoValueClass}>
          {alias.length > 0 ? alias.join(', ') : EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      label: 'Type',
      isEmpty: () => caseDetail?.type == null,
      render: () =>
        caseDetail?.type == null ? (
          <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>
        ) : (
          <PillTag variant='blue' size='sm'>
            {TYPE_DISPLAY_LABELS[caseDetail.type] ?? caseDetail.type}
          </PillTag>
        ),
    },
    {
      label: 'Status',
      isEmpty: () => !caseDetail?.latestState,
      render: () =>
        caseDetail?.latestState ? (
          <StatusBadge status={caseDetail.latestState.status} />
        ) : (
          <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>
        ),
    },
    {
      label: 'Study Name',
      isEmpty: () => !caseDetail?.studyName || caseDetail.studyName.trim() === '',
      render: () => (
        <span className={cn(valueClass, 'font-medium')}>
          {formatCaseText(caseDetail?.studyName)}
        </span>
      ),
    },
    {
      label: 'Study ID',
      isEmpty: () => !caseDetail?.studyId || caseDetail.studyId.trim() === '',
      render: () => <span className={monoValueClass}>{formatCaseText(caseDetail?.studyId)}</span>,
    },
    {
      label: 'Study Type',
      isEmpty: () => caseDetail?.studyType == null,
      render: () =>
        caseDetail?.studyType == null ? (
          <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>
        ) : (
          <PillTag variant={getCaseStudyTypeVariant(caseDetail.studyType)} size='sm'>
            {caseDetail.studyType}
          </PillTag>
        ),
    },
    {
      label: 'UR Number',
      isEmpty: () => !caseDetail?.urNumber || caseDetail.urNumber.trim() === '',
      render: () => <span className={monoValueClass}>{formatCaseText(caseDetail?.urNumber)}</span>,
    },
    {
      label: 'Report Required',
      isEmpty: () => caseDetail?.isReportRequired == null,
      render: () => <YesNoTag value={caseDetail?.isReportRequired} />,
    },
    {
      label: 'NATA Accredited',
      isEmpty: () => caseDetail?.isNataAccredited == null,
      render: () => <YesNoTag value={caseDetail?.isNataAccredited} />,
    },
    {
      label: 'Due Date',
      isEmpty: () => !caseDetail?.dueDate,
      render: () => (
        <span className={cn(valueClass, 'font-medium')}>
          {caseDetail?.dueDate ? formatCalendarDate(caseDetail.dueDate) : EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      label: 'Last Updated',
      isEmpty: () => !caseDetail?.latestState?.createdAt,
      render: () => (
        <span className={valueClass}>
          {caseDetail?.latestState?.createdAt
            ? formatDetailDate(caseDetail.latestState.createdAt)
            : EMPTY_CASE_VALUE}
        </span>
      ),
    },
    {
      label: 'RNAsum References',
      isEmpty: () => rnasumReferences.length === 0,
      render: () =>
        rnasumReferences.length > 0 ? (
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
          <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>
        ),
    },
    {
      label: 'Links',
      isEmpty: () => linkEntries.length === 0,
      render: () =>
        linkEntries.length > 0 ? (
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
          <span className={emptyClass}>{EMPTY_CASE_VALUE}</span>
        ),
    },
    {
      label: 'Description',
      isEmpty: () => !caseDetail?.description || caseDetail.description.trim() === '',
      render: () => (
        <span className='text-sm text-neutral-700 dark:text-neutral-300'>
          {caseDetail?.description ?? EMPTY_CASE_VALUE}
        </span>
      ),
    },
  ];
}

interface FieldRowProps {
  label: string;
  children: ReactNode;
}

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <div className='min-w-0'>
      <div className='text-caption mb-0.5 font-medium tracking-wide text-neutral-500 uppercase dark:text-[#9dabb9]'>
        {label}
      </div>
      {children}
    </div>
  );
}

const SKELETON_FIELD_COUNT = 14;

/** Number of columns for the field grid. Defaults to 2. */
export type CaseDetailsRailColumns = 1 | 2;

const columnsGridClass: Record<CaseDetailsRailColumns, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

function CaseDetailsRailSkeleton({ columns }: { columns: CaseDetailsRailColumns }) {
  return (
    <div className={cn('grid gap-x-4 gap-y-2.5', columnsGridClass[columns])}>
      {Array.from({ length: SKELETON_FIELD_COUNT }).map((_, index) => (
        <div key={index} className='min-w-0'>
          <Skeleton className='mb-1 h-3 w-16' />
          <Skeleton className='h-4 w-24' />
        </div>
      ))}
    </div>
  );
}

/** Shared content for both the sticky side-panel shell and the below-breakpoint
 * `Collapsible` shell — one source of the field list. */
function CaseDetailsRailContent({ columns }: { columns: CaseDetailsRailColumns }) {
  const { isLoadingCaseDetail, caseDetail } = useCaseDetailsContext();
  const [showEmpty, setShowEmpty] = useState(false);
  const fields = useCaseFields();
  const emptyFieldCount = fields.filter((field) => field.isEmpty()).length;
  const visibleFields = showEmpty ? fields : fields.filter((field) => !field.isEmpty());

  if (isLoadingCaseDetail && !caseDetail) {
    return <CaseDetailsRailSkeleton columns={columns} />;
  }

  return (
    <>
      {emptyFieldCount > 0 && (
        <div className='mb-2 flex justify-end'>
          <button
            type='button'
            onClick={() => setShowEmpty((prev) => !prev)}
            aria-expanded={showEmpty}
            className='text-xs font-medium text-blue-600 hover:underline dark:text-blue-400'
          >
            {showEmpty ? 'hide empty' : `show empty (${emptyFieldCount})`}
          </button>
        </div>
      )}

      <div className={cn('grid gap-x-4 gap-y-2.5', columnsGridClass[columns])}>
        {visibleFields.map((field) => (
          <FieldRow key={field.label} label={field.label}>
            {field.render()}
          </FieldRow>
        ))}
      </div>
    </>
  );
}

export interface CaseDetailsRailProps {
  className?: string;
  /** When true, renders the field grid inside a collapsed-by-default
   * `Collapsible` (the below-`md:` shell). When false/omitted, renders the
   * plain sticky side-panel shell. */
  collapsedByDefault?: boolean;
  /** Number of columns for the metadata field grid. `2` (default) suits the
   * narrow side-panel shell; `1` suits a wider/stacked layout where each
   * field gets a full-width row. */
  columns?: CaseDetailsRailColumns;
}

/**
 * Renders the case's metadata fields as a compact key/value grid. The
 * `columns` prop selects a single- or two-column layout.
 *
 */
export function CaseDetailsRail({
  className,
  collapsedByDefault,
  columns = 2,
}: CaseDetailsRailProps) {
  if (collapsedByDefault) {
    return (
      <div className={className}>
        <Collapsible defaultOpen={true}>
          <CollapsibleTrigger className='group flex w-full items-center justify-between rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-sm font-medium text-neutral-900 dark:border-neutral-700 dark:bg-[#111418] dark:text-neutral-100'>
            Case details
            <ChevronDown className='h-4 w-4 text-neutral-500 transition-transform duration-200 group-data-[state=open]:rotate-180 dark:text-neutral-400' />
          </CollapsibleTrigger>
          <CollapsibleContent className='rounded-b-lg border border-t-0 border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-[#111418]'>
            <CaseDetailsRailContent columns={columns} />
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        'md:sticky md:top-4 md:max-h-[calc(100vh-2rem)] md:self-start md:overflow-y-auto',
        'rounded-lg border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-[#111418]',
        className
      )}
    >
      <CaseDetailsRailContent columns={columns} />
    </aside>
  );
}
