import type { ReactNode } from 'react';
import Skeleton from 'react-loading-skeleton';

export interface SimpleTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface SimpleTableProps<T> {
  data: T[];
  columns: SimpleTableColumn<T>[];
  /** Row key extractor. Falls back to index when omitted. */
  rowKey?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  /** Optional title rendered above the table. */
  title?: string;
  className?: string;
  /** When true, renders skeleton placeholder rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to show while loading. Default 8. */
  loadingRows?: number;
}

export function SimpleTable<T>({
  data,
  columns,
  rowKey,
  emptyMessage = 'No data to display.',
  title,
  className,
  isLoading = false,
  loadingRows = 8,
}: SimpleTableProps<T>) {
  return (
    <div className={className}>
      {title && (
        <h3 className='mb-3 text-sm font-semibold tracking-wide text-neutral-900 uppercase dark:text-slate-200'>
          {title}
        </h3>
      )}

      <div className='overflow-hidden rounded-lg border border-neutral-200 dark:border-[#2d3540]'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='border-b border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418]'>
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className='px-4 py-3 text-left text-xs font-semibold tracking-wider text-neutral-500 uppercase dark:text-[#9dabb9]'
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className='divide-y divide-neutral-200 bg-white dark:divide-[#2d3540] dark:bg-[#111418]'>
              {isLoading ? (
                Array.from({ length: loadingRows }).map((_, rowIdx) => (
                  <tr key={`skeleton-${rowIdx}`}>
                    {columns.map((col) => (
                      <td key={col.key} className='px-4 py-3'>
                        <Skeleton
                          height={14}
                          borderRadius={4}
                          style={{ width: `${55 + Math.random() * 35}%` }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className='px-4 py-10 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr
                    key={rowKey ? rowKey(item, index) : index}
                    className='transition-colors hover:bg-neutral-50 dark:hover:bg-[#1e252e]/50'
                  >
                    {columns.map((col) => {
                      const raw = (item as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          className='px-4 py-3 text-sm whitespace-nowrap text-neutral-900 dark:text-slate-200'
                        >
                          {col.render ? col.render(item) : (raw as ReactNode)}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
