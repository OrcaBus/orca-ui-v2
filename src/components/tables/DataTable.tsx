import { useState, useRef, useEffect, ReactNode, MouseEvent } from 'react';
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Copy,
  Check,
  Minus,
  Rows3,
  Rows4,
  RefreshCw,
  Loader2,
  Settings2,
} from 'lucide-react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import Skeleton from 'react-loading-skeleton';
import { Pagination } from './Pagination';
import { usePaginationDefaults, type OptionalPaginationProps } from './useTablePagination';
import { toast } from 'sonner';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  defaultVisible?: boolean;
  sortable?: boolean;
  onSort?: (nextDirection: 'asc' | 'desc') => void;
  sortDirection?: 'asc' | 'desc' | undefined;
  defaultSortDirection?: 'asc' | 'desc';
  copyable?: boolean;
  /** Custom value extractor for CSV export. When omitted, raw `item[key]` is used. */
  csvValue?: (item: T) => string | number | boolean | null | undefined;
}

/** Full pagination props (e.g. from useTablePagination). Partial props are allowed; defaults applied via usePaginationDefaults. */
export type DataTablePaginationProps = OptionalPaginationProps;

export type DataTableActionContext<T> = {
  /** Full table dataset provided to the DataTable. */
  data: T[];
  /** Dataset currently visible in the table viewport (respects client-side paging). */
  paginatedData: T[];
  /** Rows the user has checked (empty when `selectable` is off). */
  selectedRows: T[];
  /** Currently visible columns (respects column chooser toggles). */
  visibleColumns: Column<T>[];
  /** Current page (1-indexed), after clamping to totalPages. */
  page: number;
  pageSize: number;
  totalItems: number;
};

export interface DataTableToolbarAction<T> {
  /** Stable identifier used as React key and internal pending state. */
  id: string;
  label: string;
  onClick: (ctx: DataTableActionContext<T>) => void | Promise<void>;
  /** When true the item is greyed-out and non-clickable. Can also be a function receiving context for dynamic disabling. */
  disabled?: boolean | ((ctx: DataTableActionContext<T>) => boolean);
  icon?: ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  paginationProps?: DataTablePaginationProps;
  /** Show rows with alternating background. */
  striped?: boolean;
  /** Remove rounded border and outer padding so table fits inside drawer/card. */
  inCard?: boolean;
  /** Show toolbar (row count, density, column chooser). Default true. */
  showToolbar?: boolean;
  /** When set, shows a refresh control in the toolbar that invokes this handler. */
  onRefresh?: () => void | Promise<void>;
  /**
   * When provided, shows a toolbar "Actions" dropdown.
   * Each action receives table context (incl. currently visible paginated rows).
   */
  toolbarActions?: DataTableToolbarAction<T>[];
  /** Label for the toolbar actions dropdown button. Default: `Actions`. */
  toolbarActionsLabel?: string;
  /** Enable row-level checkboxes for selection. Default false. */
  selectable?: boolean;
  /** When true, renders skeleton placeholder rows instead of data. */
  isLoading?: boolean;
  /** Number of skeleton rows to show while loading. Default 8. */
  loadingRows?: number;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  emptyMessage,
  paginationProps,
  striped = false,
  inCard = false,
  showToolbar = true,
  onRefresh,
  toolbarActions,
  toolbarActionsLabel = 'Actions',
  selectable = false,
  isLoading = false,
  loadingRows = 8,
}: DataTableProps<T>) {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingToolbarActionId, setPendingToolbarActionId] = useState<string | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );
  const [showColumnChooser, setShowColumnChooser] = useState(false);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const columnChooserRef = useRef<HTMLDivElement>(null);
  const copyResetTimeoutRef = useRef<number | null>(null);

  // Selection: indices into the current `data` array.
  // Track data identity so we can reset selection when the dataset changes.
  const [selectionState, setSelectionState] = useState<{
    dataSnapshot: T[];
    indices: Set<number>;
  }>({ dataSnapshot: data, indices: new Set() });

  const selectedIndices =
    selectionState.dataSnapshot === data ? selectionState.indices : new Set<number>();

  const setSelectedIndices = (updater: Set<number> | ((prev: Set<number>) => Set<number>)) => {
    setSelectionState((prev) => {
      const nextIndices =
        typeof updater === 'function'
          ? updater(prev.dataSnapshot === data ? prev.indices : new Set())
          : updater;
      return { dataSnapshot: data, indices: nextIndices };
    });
  };

  useEffect(() => {
    return () => {
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
    };
  }, []);

  const { page, pageSize, onPageChange, onPageSizeChange, totalItemsProp } =
    usePaginationDefaults(paginationProps);

  const totalItems = totalItemsProp ?? data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  const isClientSidePaging = totalItemsProp === undefined;
  const paginatedData = isClientSidePaging
    ? data.slice((clampedPage - 1) * pageSize, clampedPage * pageSize)
    : data;

  // Page-level indices for select-all logic (maps paginated rows back to data indices)
  const pageStartIndex = isClientSidePaging ? (clampedPage - 1) * pageSize : 0;
  const pageIndices = paginatedData.map((_, i) => pageStartIndex + i);

  const allPageSelected =
    pageIndices.length > 0 && pageIndices.every((i) => selectedIndices.has(i));
  const somePageSelected = !allPageSelected && pageIndices.some((i) => selectedIndices.has(i));

  const toggleSelectAll = () => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIndices.forEach((i) => next.delete(i));
      } else {
        pageIndices.forEach((i) => next.add(i));
      }
      return next;
    });
  };

  const toggleSelectRow = (dataIndex: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(dataIndex)) {
        next.delete(dataIndex);
      } else {
        next.add(dataIndex);
      }
      return next;
    });
  };

  const getSortIcon = (column: Column<T>) => {
    if (!column.sortable) return null;
    const dir = column.sortDirection;
    if (dir === 'asc')
      return <ChevronUp className='h-3.5 w-3.5 text-blue-600 dark:text-[#137fec]' />;
    if (dir === 'desc')
      return <ChevronDown className='h-3.5 w-3.5 text-blue-600 dark:text-[#137fec]' />;
    return <ChevronsUpDown className='h-3.5 w-3.5 text-neutral-400 dark:text-[#9dabb9]' />;
  };

  const getNextSortDirection = (column: Column<T>): 'asc' | 'desc' => {
    if (column.sortDirection === undefined) return column.defaultSortDirection ?? 'desc';
    return column.sortDirection === 'desc' ? 'asc' : 'desc';
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !column.onSort) return;
    column.onSort(getNextSortDirection(column));
  };

  const toggleColumn = (key: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(key)) {
      newVisible.delete(key);
    } else {
      newVisible.add(key);
    }
    setVisibleColumns(newVisible);
  };

  const handleCopyCell = async (value: string, cellKey: string, e: MouseEvent) => {
    e.stopPropagation();

    if (!value) {
      toast.error('Nothing to copy');
      return;
    }

    let copySuccess = false;
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        copySuccess = true;
      } catch {
        // ignore
      }
    }
    if (!copySuccess) {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        copySuccess = document.execCommand('copy');
      } catch {
        // ignore
      }
      textArea.remove();
    }
    if (copySuccess) {
      toast.success(`${value} copied to clipboard`);
      setCopiedCell(cellKey);
      if (copyResetTimeoutRef.current !== null) {
        window.clearTimeout(copyResetTimeoutRef.current);
      }
      copyResetTimeoutRef.current = window.setTimeout(() => {
        setCopiedCell(null);
      }, 2000);
      return;
    }

    toast.error('Failed to copy ${cellKey}');
  };

  const visibleColumnsList = columns.filter((col) => visibleColumns.has(col.key));
  const densityPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2';
  const headerDensityPadding = density === 'comfortable' ? 'px-4 py-3' : 'px-3 py-2';

  const selectedRows = selectable
    ? Array.from(selectedIndices)
        .sort((a, b) => a - b)
        .map((i) => data[i])
        .filter(Boolean)
    : [];

  const actionContext: DataTableActionContext<T> = {
    data,
    paginatedData,
    selectedRows,
    visibleColumns: visibleColumnsList,
    page: clampedPage,
    pageSize,
    totalItems,
  };

  const isActionDisabled = (action: DataTableToolbarAction<T>): boolean => {
    if (typeof action.disabled === 'function') return action.disabled(actionContext);
    return action.disabled === true;
  };

  const handlePageSizeChange = (newPageSize: number) => {
    onPageSizeChange(newPageSize);
  };

  const handleRefreshClick = () => {
    if (!onRefresh || isRefreshing) return;
    const result = onRefresh();
    if (result instanceof Promise) {
      setIsRefreshing(true);
      void result.finally(() => setIsRefreshing(false));
    }
  };

  const handleToolbarActionClick = (action: DataTableToolbarAction<T>) => {
    if (isActionDisabled(action)) return;
    if (pendingToolbarActionId !== null) return;

    const result = action.onClick(actionContext);
    if (result instanceof Promise) {
      setPendingToolbarActionId(action.id);
      void result
        .catch((err) => {
          const message = err instanceof Error ? err.message : `Failed to run "${action.label}"`;
          toast.error(message);
        })
        .finally(() => setPendingToolbarActionId(null));
    }
  };

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
            {selectable && selectedIndices.size > 0 && (
              <span className='ml-1.5 font-medium text-blue-600 dark:text-[#137fec]'>
                · {selectedIndices.size} selected
              </span>
            )}
          </div>
          <div className='flex items-center gap-2'>
            {/* Refresh Button */}
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
            <div className='relative' ref={columnChooserRef}>
              <button
                onClick={() => setShowColumnChooser(!showColumnChooser)}
                className='flex cursor-pointer items-center gap-2 rounded-md border border-neutral-300 p-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
                title='Toggle columns'
                aria-label='Toggle columns'
                aria-pressed={showColumnChooser}
              >
                <Settings2 className='h-4 w-4' />
              </button>

              {showColumnChooser && (
                <>
                  <div className='fixed inset-0 z-10' onClick={() => setShowColumnChooser(false)} />
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
                            onChange={() => toggleColumn(col.key)}
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

            {/* Custom Actions Dropdown */}
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
                    const isPending = pendingToolbarActionId === action.id;
                    const disabled = isActionDisabled(action) || pendingToolbarActionId !== null;

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
                            {action.icon ? (
                              <span className='flex h-4 w-4 items-center justify-center text-neutral-600 dark:text-neutral-300'>
                                {action.icon}
                              </span>
                            ) : null}
                            <span className='flex-1 truncate'>{action.label}</span>
                            {isPending ? (
                              <Loader2 className='h-4 w-4 animate-spin' aria-hidden='true' />
                            ) : null}
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
              {selectable && (
                <th className={`w-10 text-center ${headerDensityPadding}`}>
                  <div className='flex items-center justify-center'>
                    <span
                      role='checkbox'
                      tabIndex={0}
                      aria-checked={allPageSelected ? 'true' : somePageSelected ? 'mixed' : 'false'}
                      aria-label='Select all rows on this page'
                      onClick={toggleSelectAll}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleSelectAll();
                        }
                      }}
                      className={[
                        'flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none',
                        allPageSelected
                          ? 'border-blue-600 bg-blue-600 text-white dark:border-[#137fec] dark:bg-[#137fec]'
                          : somePageSelected
                            ? 'border-blue-600 bg-blue-600 text-white dark:border-[#137fec] dark:bg-[#137fec]'
                            : 'border-neutral-300 bg-white dark:border-[#2d3540] dark:bg-[#1e252e]',
                      ].join(' ')}
                    >
                      {allPageSelected && <Check className='h-3 w-3' aria-hidden='true' />}
                      {somePageSelected && !allPageSelected && (
                        <Minus className='h-3 w-3' aria-hidden='true' />
                      )}
                    </span>
                  </div>
                </th>
              )}
              {visibleColumnsList.map((column) => (
                <th
                  key={column.key}
                  className={`text-left text-xs font-medium whitespace-nowrap text-neutral-700 dark:text-[#9dabb9] ${headerDensityPadding} ${
                    column.sortable && column.onSort
                      ? 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
                      : ''
                  }`}
                  onClick={() => handleSort(column)}
                >
                  <div className='flex items-center gap-2'>
                    {column.header}
                    {column.sortable && getSortIcon(column)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-neutral-200 dark:divide-[#2d3540]'>
            {isLoading ? (
              Array.from({ length: loadingRows }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  {selectable && (
                    <td className={`w-10 text-center ${densityPadding}`}>
                      <Skeleton width={16} height={16} borderRadius={4} />
                    </td>
                  )}
                  {visibleColumnsList.map((col) => (
                    <td key={col.key} className={`${densityPadding}`}>
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
                  colSpan={visibleColumnsList.length + (selectable ? 1 : 0)}
                  className='px-4 py-12 text-center text-sm text-neutral-500 dark:text-[#9dabb9]'
                >
                  {emptyMessage ?? 'No data to display'}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => {
                const dataIndex = pageStartIndex + index;
                const isRowSelected = selectedIndices.has(dataIndex);

                return (
                  <tr
                    key={`row-${index}`}
                    className={[
                      onRowClick
                        ? 'cursor-pointer transition-colors hover:bg-neutral-50 dark:hover:bg-[#1e252e]/50'
                        : '',
                      striped && index % 2 === 1 ? 'bg-neutral-50/80 dark:bg-[#1e252e]/40' : '',
                      isRowSelected ? 'bg-blue-50/60 dark:bg-blue-500/5' : '',
                    ].join(' ')}
                    onClick={() => onRowClick?.(item)}
                  >
                    {selectable && (
                      <td className={`w-10 text-center ${densityPadding}`}>
                        <div className='flex items-center justify-center'>
                          <span
                            role='checkbox'
                            tabIndex={0}
                            aria-checked={isRowSelected}
                            aria-label={`Select row ${index + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectRow(dataIndex);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleSelectRow(dataIndex);
                              }
                            }}
                            className={[
                              'flex h-4 w-4 cursor-pointer items-center justify-center rounded border transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none',
                              isRowSelected
                                ? 'border-blue-600 bg-blue-600 text-white dark:border-[#137fec] dark:bg-[#137fec]'
                                : 'border-neutral-300 bg-white dark:border-[#2d3540] dark:bg-[#1e252e]',
                            ].join(' ')}
                          >
                            {isRowSelected && <Check className='h-3 w-3' aria-hidden='true' />}
                          </span>
                        </div>
                      </td>
                    )}
                    {visibleColumnsList.map((column) => {
                      const cellKey = `row-${index}-${column.key}`;
                      const rawValue = (item as Record<string, unknown>)[column.key];
                      const copyValue =
                        rawValue !== undefined && rawValue !== null
                          ? String(rawValue as string)
                          : '';
                      const isCopied = copiedCell === cellKey;

                      return (
                        <td
                          key={column.key}
                          className={`text-sm whitespace-nowrap text-neutral-900 dark:text-slate-200 ${densityPadding}`}
                        >
                          <div className='flex items-center gap-1'>
                            <span className='min-w-0 flex-1 whitespace-nowrap'>
                              {column.render ? column.render(item) : (rawValue as ReactNode)}
                            </span>
                            {column.copyable && (
                              <button
                                type='button'
                                onClick={(e) => void handleCopyCell(copyValue, cellKey, e)}
                                className='shrink-0 rounded p-1 transition-colors hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
                                title={isCopied ? 'Copied!' : 'Copy'}
                                aria-label={isCopied ? 'Copied!' : 'Copy'}
                              >
                                {isCopied ? (
                                  <Check
                                    className='h-4 w-4 text-green-600 dark:text-green-400'
                                    aria-hidden='true'
                                  />
                                ) : (
                                  <Copy
                                    className='h-4 w-4 text-neutral-500 hover:text-blue-600 dark:text-[#9dabb9] dark:hover:text-[#137fec]'
                                    aria-hidden='true'
                                  />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
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
