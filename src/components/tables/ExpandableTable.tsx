import { useState, useRef, Fragment, ReactNode } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
  Rows3,
  Rows4,
  Settings2,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import { Pagination } from './Pagination';
import { usePaginationDefaults, type OptionalPaginationProps } from './useTablePagination';
import { toast } from 'sonner';

export type ExpandableTablePaginationProps = OptionalPaginationProps;

export interface ExpandableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  width?: string;
}

export interface SubRowColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  width?: string;
}

export interface ExpandableTableToolbarAction<T> {
  id: string;
  label: string;
  onClick: (data: T[]) => void | Promise<void>;
  disabled?: boolean | ((data: T[]) => boolean);
  icon?: ReactNode;
}

interface ExpandableTableProps<T, S> {
  data: T[];
  columns: ExpandableColumn<T>[];
  subColumns: SubRowColumn<S>[];
  keyExtractor: (item: T) => string;
  subRowsExtractor: (item: T) => S[];
  subKeyExtractor: (item: S) => string;
  onRowClick?: (item: T) => void;
  expandable?: boolean;
  /** External pagination state. When provided, pagination bar is shown and page/pageSize are controlled externally. When absent, all rows are displayed. */
  paginationProps?: ExpandableTablePaginationProps;
  emptyMessage?: string;
  isLoading?: boolean;
  loadingRows?: number;
  /** Show toolbar (row count, density, column chooser). Default true. */
  showToolbar?: boolean;
  /** When set, shows a refresh control in the toolbar that invokes this handler. */
  onRefresh?: () => void | Promise<void>;
  toolbarActions?: ExpandableTableToolbarAction<T>[];
  toolbarActionsLabel?: string;
  /** Remove rounded border and outer padding so table fits inside drawer/card. */
  inCard?: boolean;
}

export function ExpandableTable<T, S>({
  data,
  columns,
  subColumns,
  keyExtractor,
  subRowsExtractor,
  subKeyExtractor,
  onRowClick,
  expandable = true,
  paginationProps,
  emptyMessage,
  isLoading = false,
  loadingRows = 8,
  showToolbar = true,
  onRefresh,
  toolbarActions,
  toolbarActionsLabel = 'Actions',
  inCard = false,
}: ExpandableTableProps<T, S>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { page, pageSize, onPageChange, onPageSizeChange, totalItemsProp } =
    usePaginationDefaults(paginationProps);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const columnMenuRef = useRef<HTMLDivElement>(null);

  const toggleRow = (key: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortKey === columnKey) {
      return sortDirection === 'asc' ? (
        <ChevronUp className='h-3.5 w-3.5 text-blue-600 dark:text-[#137fec]' />
      ) : (
        <ChevronDown className='h-3.5 w-3.5 text-blue-600 dark:text-[#137fec]' />
      );
    }
    return <ChevronsUpDown className='h-3.5 w-3.5 text-neutral-400 dark:text-[#9dabb9]' />;
  };

  const toggleColumnVisibility = (columnKey: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        if (next.size > 1) next.delete(columnKey);
      } else {
        next.add(columnKey);
      }
      return next;
    });
  };

  const handleRefreshClick = () => {
    if (!onRefresh || isRefreshing) return;
    const result = onRefresh();
    if (result instanceof Promise) {
      setIsRefreshing(true);
      void result.finally(() => setIsRefreshing(false));
    }
  };

  const isActionDisabled = (action: ExpandableTableToolbarAction<T>): boolean => {
    if (typeof action.disabled === 'function') return action.disabled(data);
    return action.disabled === true;
  };

  const handleToolbarActionClick = (action: ExpandableTableToolbarAction<T>) => {
    if (isActionDisabled(action) || pendingActionId !== null) return;

    const result = action.onClick(data);
    if (result instanceof Promise) {
      setPendingActionId(action.id);
      void result
        .catch((err) => {
          const message = err instanceof Error ? err.message : `Failed to run "${action.label}"`;
          toast.error(message);
        })
        .finally(() => setPendingActionId(null));
    }
  };

  const sortedData = data.toSorted((a, b) => {
    if (!sortKey) return 0;
    const aVal = (a as Record<string, string | number>)[sortKey];
    const bVal = (b as Record<string, string | number>)[sortKey];
    if (aVal === bVal) return 0;
    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const totalItems = totalItemsProp ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const isClientSidePaging = totalItemsProp === undefined;
  const paginatedData = paginationProps
    ? isClientSidePaging
      ? sortedData.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
      : data
    : sortedData;

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
  };

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key));
  const totalColSpan = visibleColumnsArray.length + (expandable ? 1 : 0);

  const densityPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2';
  const headerDensityPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2';
  const subCellPadding = density === 'compact' ? 'py-1.5' : 'py-2';

  const wrapperClass = inCard
    ? 'overflow-hidden border-0 bg-transparent dark:bg-transparent'
    : 'overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]';

  return (
    <div className={wrapperClass}>
      {/* Toolbar */}
      {showToolbar && (
        <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-2 dark:border-[#2d3540]'>
          <div className='text-xs text-neutral-600 dark:text-[#9dabb9]'>
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </div>
          <div className='flex items-center gap-2'>
            {/* Refresh */}
            {onRefresh && (
              <button
                type='button'
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className='flex cursor-pointer items-center rounded-md border border-neutral-300 p-1.5 text-neutral-700 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
                title='Refresh'
                aria-label='Refresh'
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  aria-hidden='true'
                />
              </button>
            )}

            {/* Density Toggle */}
            <div className='flex items-center overflow-hidden rounded-md border border-neutral-300 dark:border-[#2d3540]'>
              <button
                type='button'
                onClick={() => setDensity('comfortable')}
                className={`cursor-pointer p-1.5 transition-colors ${
                  density === 'comfortable'
                    ? 'bg-neutral-200 text-neutral-900 dark:bg-[#1e252e] dark:text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]/50'
                }`}
                title='Comfortable density'
                aria-label='Comfortable density'
                aria-pressed={density === 'comfortable'}
              >
                <Rows3 className='h-4 w-4' aria-hidden='true' />
              </button>
              <button
                type='button'
                onClick={() => setDensity('compact')}
                className={`cursor-pointer p-1.5 transition-colors ${
                  density === 'compact'
                    ? 'bg-neutral-200 text-neutral-900 dark:bg-[#1e252e] dark:text-white'
                    : 'text-neutral-500 hover:bg-neutral-100 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]/50'
                }`}
                title='Compact density'
                aria-label='Compact density'
                aria-pressed={density === 'compact'}
              >
                <Rows4 className='h-4 w-4' aria-hidden='true' />
              </button>
            </div>

            {/* Column Chooser */}
            <div className='relative' ref={columnMenuRef}>
              <button
                type='button'
                onClick={() => setShowColumnMenu(!showColumnMenu)}
                className='flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 p-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
                title='Toggle columns'
                aria-label='Toggle columns'
                aria-pressed={showColumnMenu}
              >
                <Settings2 className='h-4 w-4' aria-hidden='true' />
              </button>

              {showColumnMenu && (
                <>
                  <div className='fixed inset-0 z-10' onClick={() => setShowColumnMenu(false)} />
                  <div className='absolute top-full right-0 z-20 mt-1 w-56 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'>
                    <div className='px-3 py-2 text-xs font-medium text-neutral-500 uppercase dark:text-[#9dabb9]'>
                      Toggle Columns
                    </div>
                    <div className='max-h-64 overflow-y-auto'>
                      {columns.map((col) => (
                        <label
                          key={col.key}
                          className='flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-[#1e252e]'
                        >
                          <input
                            type='checkbox'
                            checked={visibleColumns.has(col.key)}
                            onChange={() => toggleColumnVisibility(col.key)}
                            className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#137fec] dark:focus:ring-[#137fec]'
                          />
                          <span className='text-sm text-neutral-900 dark:text-slate-200'>
                            {col.header}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Toolbar Actions Dropdown */}
            {toolbarActions && toolbarActions.length > 0 && (
              <Menu as='div' className='relative'>
                <MenuButton
                  className='flex cursor-pointer items-center gap-1 rounded-md border border-neutral-300 px-2 py-1 text-xs leading-none font-medium whitespace-nowrap text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
                  aria-label={toolbarActionsLabel}
                >
                  <span className='text-sm font-medium text-neutral-700 dark:text-[#9dabb9]'>
                    {toolbarActionsLabel}
                  </span>
                  <ChevronDown
                    className='h-5 w-5 text-neutral-500 dark:text-[#9dabb9]'
                    aria-hidden='true'
                  />
                </MenuButton>

                <MenuItems
                  anchor='bottom end'
                  transition
                  className='z-50 mt-1 w-56 origin-top-right overflow-hidden rounded-lg border border-neutral-200 bg-white py-1 shadow-lg focus:outline-none dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'
                >
                  {toolbarActions.map((action) => {
                    const isPending = pendingActionId === action.id;
                    const disabled = isActionDisabled(action) || pendingActionId !== null;

                    return (
                      <MenuItem key={action.id}>
                        {({ active }) => (
                          <button
                            type='button'
                            onClick={() => handleToolbarActionClick(action)}
                            disabled={disabled}
                            className={[
                              'flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-neutral-700',
                              'data-focus:bg-neutral-100 dark:text-neutral-300 dark:data-focus:bg-[#1e252e]',
                              active ? 'bg-neutral-100 dark:bg-[#1e252e]' : '',
                              disabled ? 'cursor-not-allowed opacity-60' : '',
                            ].join(' ')}
                          >
                            {action.icon && (
                              <span className='flex h-4 w-4 items-center justify-center text-neutral-600 dark:text-neutral-300'>
                                {action.icon}
                              </span>
                            )}
                            <span className='flex-1 truncate'>{action.label}</span>
                            {isPending && (
                              <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                            )}
                          </button>
                        )}
                      </MenuItem>
                    );
                  })}
                </MenuItems>
              </Menu>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className='scrollbar-thin max-h-[600px] overflow-x-auto overflow-y-auto'>
        <table className='w-full'>
          <thead className='sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418]'>
            <tr>
              {expandable && <th className={`w-10 ${headerDensityPadding}`} />}
              {visibleColumnsArray.map((column) => (
                <th
                  key={column.key}
                  className={`text-left text-xs font-medium whitespace-nowrap text-neutral-700 dark:text-[#9dabb9] ${headerDensityPadding} ${
                    column.sortable
                      ? 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
                      : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center gap-2'>
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-200 dark:divide-[#2d3540]'>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {expandable && (
                    <td className={`w-10 ${densityPadding}`}>
                      <Skeleton width={24} height={24} borderRadius={6} />
                    </td>
                  )}
                  {visibleColumnsArray.map((col) => (
                    <td key={col.key} className={densityPadding}>
                      <Skeleton
                        height={14}
                        borderRadius={4}
                        style={{ width: `${55 + Math.random() * 35}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColSpan}
                  className='px-4 py-12 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'
                >
                  {emptyMessage ?? 'No data to display'}
                </td>
              </tr>
            ) : (
              paginatedData.flatMap((item) => {
                const key = keyExtractor(item);
                const isExpanded = expandedRows.has(key);
                const subRows = subRowsExtractor(item);
                const hasSubRows = subRows.length > 0;

                return (
                  <Fragment key={key}>
                    {/* Main row */}
                    <tr
                      className={[
                        'transition-colors',
                        onRowClick
                          ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1e252e]/50'
                          : '',
                      ].join(' ')}
                      onClick={() => onRowClick?.(item)}
                    >
                      {expandable && (
                        <td className={`w-10 ${densityPadding}`}>
                          {hasSubRows && (
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(key);
                              }}
                              className='cursor-pointer rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-[#1e252e]'
                              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                              aria-expanded={isExpanded}
                            >
                              {isExpanded ? (
                                <ChevronDown className='h-4 w-4 text-neutral-600 dark:text-[#9dabb9]' />
                              ) : (
                                <ChevronRight className='h-4 w-4 text-neutral-600 dark:text-[#9dabb9]' />
                              )}
                            </button>
                          )}
                        </td>
                      )}
                      {visibleColumnsArray.map((column) => (
                        <td
                          key={column.key}
                          className={`text-sm whitespace-nowrap text-neutral-900 dark:text-slate-200 ${densityPadding}`}
                        >
                          {column.render
                            ? column.render(item)
                            : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                        </td>
                      ))}
                    </tr>

                    {/* Sub-row header + sub-rows */}
                    {isExpanded && hasSubRows && (
                      <>
                        <tr className='bg-neutral-50 dark:bg-[#1e252e]/50'>
                          {expandable && <td className={`px-4 ${subCellPadding}`} />}
                          <td
                            colSpan={visibleColumnsArray.length}
                            className={`px-4 ${subCellPadding}`}
                          >
                            <div className='flex gap-4 border-l-2 border-blue-300 pl-2 dark:border-[#137fec]/40'>
                              {subColumns.map((subCol) => (
                                <div
                                  key={subCol.key}
                                  className={`text-xs font-medium text-neutral-600 dark:text-[#9dabb9] ${subCol.width || 'flex-1'}`}
                                >
                                  {subCol.header}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>

                        {subRows.map((subItem) => (
                          <tr
                            key={`${key}-${subKeyExtractor(subItem)}`}
                            className='border-b border-neutral-100 bg-blue-50/30 transition-colors hover:bg-blue-50/50 dark:border-[#2d3540] dark:bg-[#137fec]/5 dark:hover:bg-[#137fec]/10'
                          >
                            {expandable && <td className={`px-4 ${subCellPadding}`} />}
                            <td
                              colSpan={visibleColumnsArray.length}
                              className={`px-4 ${subCellPadding}`}
                            >
                              <div className='flex items-center gap-4 border-l-2 border-blue-300 pl-2 dark:border-[#137fec]/40'>
                                {subColumns.map((subCol) => (
                                  <div
                                    key={subCol.key}
                                    className={`text-xs text-neutral-900 dark:text-slate-200 ${subCol.width || 'flex-1'}`}
                                  >
                                    {subCol.render
                                      ? subCol.render(subItem)
                                      : ((subItem as Record<string, unknown>)[
                                          subCol.key
                                        ] as ReactNode)}
                                  </div>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - only when paginationProps is provided */}
      {paginationProps && (
        <Pagination
          currentPage={clampedPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </div>
  );
}
