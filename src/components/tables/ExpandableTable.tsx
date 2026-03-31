import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, ChevronRight, Rows3, Rows4, Settings2 } from 'lucide-react';
import { Pagination } from './Pagination';

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

interface ExpandableTableProps<T, S> {
  data: T[];
  columns: ExpandableColumn<T>[];
  subColumns: SubRowColumn<S>[];
  keyExtractor: (item: T) => string;
  subRowsExtractor: (item: T) => S[];
  subKeyExtractor: (item: S) => string;
  onRowClick?: (item: T) => void;
  expandable?: boolean;
  defaultPageSize?: number;
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
  defaultPageSize = 10,
}: ExpandableTableProps<T, S>) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((col) => col.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const columnMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (columnMenuRef.current && !columnMenuRef.current.contains(event.target as Node)) {
        setShowColumnMenu(false);
      }
    };

    if (showColumnMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColumnMenu]);

  const toggleRow = (key: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (columnKey: string) => {
    const newVisible = new Set(visibleColumns);
    if (newVisible.has(columnKey)) {
      if (newVisible.size > 1) {
        newVisible.delete(columnKey);
      }
    } else {
      newVisible.add(columnKey);
    }
    setVisibleColumns(newVisible);
  };

  const sortedData = data.toSorted((a, b) => {
    if (!sortKey) return 0;

    const aVal = (a as Record<string, string | number>)[sortKey];
    const bVal = (b as Record<string, string | number>)[sortKey];

    if (aVal === bVal) return 0;

    const comparison = aVal < bVal ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const visibleColumnsArray = columns.filter((col) => visibleColumns.has(col.key));

  const cellPaddingY = density === 'compact' ? 'py-2' : 'py-3';
  const subCellPaddingY = density === 'compact' ? 'py-1.5' : 'py-2';

  const renderRows = () => {
    const rows: ReactNode[] = [];

    paginatedData.forEach((item) => {
      const key = keyExtractor(item);
      const isExpanded = expandedRows.has(key);
      const subRows = subRowsExtractor(item);
      const hasSubRows = subRows.length > 0;

      // Main Row
      rows.push(
        <tr
          key={key}
          className={`border-b border-neutral-200 dark:border-[#2d3540] ${
            onRowClick ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1e252e]/50' : ''
          } transition-colors`}
          onClick={() => onRowClick?.(item)}
        >
          {expandable && (
            <td className={`px-4 ${cellPaddingY}`}>
              {hasSubRows && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleRow(key);
                  }}
                  className='rounded p-1 transition-colors hover:bg-neutral-200 dark:hover:bg-[#1e252e]'
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
              className={`px-4 ${cellPaddingY} text-sm text-neutral-900 dark:text-slate-200`}
            >
              {column.render
                ? column.render(item)
                : ((item as Record<string, unknown>)[column.key] as ReactNode)}
            </td>
          ))}
        </tr>
      );

      // Sub Rows
      if (isExpanded && hasSubRows) {
        // Sub Header
        rows.push(
          <tr key={`${key}-subheader`} className='bg-neutral-50 dark:bg-[#1e252e]/50'>
            {expandable && <td className={`px-4 ${subCellPaddingY}`}></td>}
            <td colSpan={visibleColumnsArray.length} className={`px-4 ${subCellPaddingY}`}>
              <div className='flex gap-4'>
                {subColumns.map((subCol) => (
                  <div
                    key={subCol.key}
                    className={`text-xs font-medium text-neutral-600 dark:text-[#9dabb9] ${
                      subCol.width || 'flex-1'
                    }`}
                  >
                    {subCol.header}
                  </div>
                ))}
              </div>
            </td>
          </tr>
        );

        // Sub Data Rows
        subRows.forEach((subItem) => {
          rows.push(
            <tr
              key={`${key}-${subKeyExtractor(subItem)}`}
              className='border-b border-neutral-100 bg-blue-50/30 transition-colors hover:bg-blue-50/50 dark:border-[#2d3540] dark:bg-[#137fec]/5 dark:hover:bg-[#137fec]/10'
            >
              {expandable && <td className={`px-4 ${subCellPaddingY}`}></td>}
              <td colSpan={visibleColumnsArray.length} className={`px-4 ${subCellPaddingY}`}>
                <div className='flex gap-4 border-l-2 border-blue-300 pl-6 dark:border-[#137fec]/40'>
                  {subColumns.map((subCol) => (
                    <div
                      key={subCol.key}
                      className={`text-sm text-neutral-900 dark:text-slate-200 ${
                        subCol.width || 'flex-1'
                      }`}
                    >
                      {subCol.render
                        ? subCol.render(subItem)
                        : ((subItem as Record<string, unknown>)[subCol.key] as ReactNode)}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          );
        });
      }
    });

    return rows;
  };

  return (
    <div className='overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-[#2d3540] dark:bg-[#111418]'>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
        <div className='text-sm text-neutral-600 dark:text-[#9dabb9]'>{sortedData.length} rows</div>
        <div className='flex items-center gap-2'>
          {/* Density Toggle */}
          <div className='flex items-center overflow-hidden rounded-md border border-neutral-300 dark:border-[#2d3540]'>
            <button
              onClick={() => setDensity('comfortable')}
              className={`p-1.5 transition-colors ${
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
              className={`p-1.5 transition-colors ${
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

          {/* Columns Menu */}
          <div className='relative' ref={columnMenuRef}>
            <button
              onClick={() => setShowColumnMenu(!showColumnMenu)}
              className='flex items-center gap-2 rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 dark:border-[#2d3540] dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
            >
              <Settings2 className='h-4 w-4' />
              Columns
            </button>

            {showColumnMenu && (
              <div className='absolute top-full right-0 z-10 mt-1 w-56 rounded-lg border border-neutral-200 bg-white py-2 shadow-lg dark:border-[#2d3540] dark:bg-[#111418] dark:shadow-black/40'>
                <div className='px-3 py-2 text-xs font-medium text-neutral-500 uppercase dark:text-[#9dabb9]'>
                  Toggle Columns
                </div>
                {columns.map((column) => (
                  <label
                    key={column.key}
                    className='flex cursor-pointer items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-[#1e252e]'
                  >
                    <input
                      type='checkbox'
                      checked={visibleColumns.has(column.key)}
                      onChange={() => toggleColumnVisibility(column.key)}
                      className='h-4 w-4 rounded border-neutral-300 text-blue-600 focus:ring-blue-500 dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-[#137fec] dark:focus:ring-[#137fec]'
                    />
                    <span className='text-sm text-neutral-700 dark:text-slate-200'>
                      {column.header}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='border-b border-neutral-200 bg-neutral-50 dark:border-[#2d3540] dark:bg-[#111418]'>
            <tr>
              {expandable && <th className='w-10'></th>}
              {visibleColumnsArray.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 ${cellPaddingY} text-left text-xs font-medium text-neutral-700 dark:text-[#9dabb9] ${
                    column.sortable
                      ? 'cursor-pointer select-none hover:bg-neutral-100 dark:hover:bg-[#1e252e]'
                      : ''
                  } ${column.width || ''}`}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className='flex items-center gap-1'>
                    {column.header}
                    {column.sortable && sortKey === column.key && (
                      <span className='text-blue-600 dark:text-[#137fec]'>
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{renderRows()}</tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={sortedData.length}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
      />
    </div>
  );
}
