import type { TableDensity } from './useTableDensity';

export const TABLE_HEADER_TEXT_CLASSNAME =
  'text-xs leading-4 font-semibold whitespace-nowrap text-neutral-600 dark:text-[#9dabb9]';

export const TABLE_DENSITY_CLASSNAMES: Record<
  TableDensity,
  { cell: string; header: string; subCell: string }
> = {
  comfortable: {
    cell: 'px-3 py-2.5',
    header: 'px-3 py-2',
    subCell: 'py-2',
  },
  compact: {
    cell: 'px-3 py-1.5',
    header: 'px-3 py-1.5',
    subCell: 'py-1.5',
  },
};
