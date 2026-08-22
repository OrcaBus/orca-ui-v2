import { Button } from '@/components/ui/Button';
import type { ReactNode } from 'react';
import type { NavigateFunction } from 'react-router';
import { PillTag, type PillTagVariant } from '@/components/ui/PillTag';
import { cn } from '@/utils/cn';
import type { QualityEnum } from '../api/lab.api';
import { EMPTY_TABLE_VALUE, type LibraryTableRow } from './tableRows';

/** Default text styling shared by most lab table cells. */
const TEXT_VALUE_CLASS = 'text-sm text-neutral-700 dark:text-[#9dabb9]';

/** Vertical rhythm shared by stacked (multi-value) table cells. */
const STACKED_ROW_CLASS = 'flex min-h-7 items-center';

/** Stacked text-cell styling: the row rhythm plus the default text styling. */
const STACKED_VALUE_CLASS = cn(STACKED_ROW_CLASS, TEXT_VALUE_CLASS);

/** Clickable identifier styling shared across lab tables. */
const LINK_CLASS =
  'font-mono text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline dark:text-[#137fec] dark:hover:text-blue-400';

/** Clickable identifier styling within a stacked (multi-value) cell. */
const STACKED_LINK_CLASS = cn(STACKED_ROW_CLASS, LINK_CLASS);

/** Maps a library quality value to its {@link PillTag} colour variant. */
const QUALITY_VARIANTS: Record<QualityEnum, PillTagVariant> = {
  'very-poor': 'red',
  poor: 'red',
  good: 'green',
  borderline: 'amber',
};

/** Muted dash shown when a cell has no value. */
function renderEmptyValue(): ReactNode {
  return <span className='text-sm text-neutral-500 dark:text-[#9dabb9]'>{EMPTY_TABLE_VALUE}</span>;
}

/**
 * Renders a single value with the shared default text styling, falling back to a
 * dash for nullish/blank values. Pass `className` to extend or override the
 * defaults — conflicting utilities are resolved by {@link cn}.
 */
export function renderTextValue(
  value: string | number | null | undefined,
  className?: string
): ReactNode {
  const display = value === null || value === undefined || value === '' ? EMPTY_TABLE_VALUE : value;
  return <span className={cn(TEXT_VALUE_CLASS, className)}>{display}</span>;
}

/** Renders a vertical stack of plain text values, or a dash when empty. */
export function renderStackedValues(values: string[], className?: string): ReactNode {
  if (values.length === 0) return renderEmptyValue();

  return (
    <div className='flex flex-col gap-1'>
      {values.map((value, index) => (
        <span key={`${value}-${index}`} className={cn(STACKED_VALUE_CLASS, className)}>
          {value}
        </span>
      ))}
    </div>
  );
}

/** Renders a single library quality value as a coloured pill, or a dash when empty. */
export function renderQualityPill(quality: string | null | undefined): ReactNode {
  if (!quality || quality === EMPTY_TABLE_VALUE) return renderEmptyValue();

  return (
    <PillTag variant={QUALITY_VARIANTS[quality as QualityEnum] ?? 'neutral'} size='sm'>
      {quality}
    </PillTag>
  );
}

/** Renders a vertical stack of library quality pills, or a dash when empty. */
export function renderStackedQualityPills(qualities: string[]): ReactNode {
  if (qualities.length === 0) return renderEmptyValue();

  return (
    <div className='flex flex-col gap-1'>
      {qualities.map((quality, index) => (
        <span key={`${quality}-${index}`} className={STACKED_ROW_CLASS}>
          {renderQualityPill(quality)}
        </span>
      ))}
    </div>
  );
}

/**
 * Renders a single identifier as a button navigating to `toPath(id)`, or a dash
 * when the value is blank. Used for the primary ID column of a lab table.
 */
export function renderClickableId(
  value: string | null | undefined,
  navigate: NavigateFunction,
  toPath: (id: string) => string
): ReactNode {
  const id = value?.trim();
  if (!id) return renderEmptyValue();

  return (
    <Button
      variant='ghost'
      type='button'
      onClick={(event) => {
        event.stopPropagation();
        void navigate(toPath(id));
      }}
      className={LINK_CLASS}
    >
      {id}
    </Button>
  );
}

/** A single entry in a stacked link cell. A null `href` renders plain text. */
export interface StackedLink {
  label: string;
  href: string | null;
}

/** Renders a vertical stack of links (plain text for entries without an href). */
export function renderStackedLinks(links: StackedLink[], navigate: NavigateFunction): ReactNode {
  if (links.length === 0) return renderEmptyValue();

  return (
    <div className='flex flex-col gap-1'>
      {links.map(({ label, href }, index) => {
        if (!href) {
          return (
            <span key={`${label}-${index}`} className={STACKED_VALUE_CLASS}>
              {label}
            </span>
          );
        }

        return (
          <Button
            variant='ghost'
            key={`${label}-${index}`}
            type='button'
            onClick={(event) => {
              event.stopPropagation();
              void navigate(href);
            }}
            className={STACKED_LINK_CLASS}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}

/** Renders stacked library IDs, each linking to its library detail page. */
export function renderLibraryLinks(rows: LibraryTableRow[], navigate: NavigateFunction): ReactNode {
  return renderStackedLinks(
    rows.map((row) => ({
      label: row.libraryId,
      href:
        row.orcabusId && row.libraryId !== EMPTY_TABLE_VALUE
          ? `/lab/libraries/${row.orcabusId}`
          : null,
    })),
    navigate
  );
}
