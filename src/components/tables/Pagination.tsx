import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/utils/constants';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('…');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push('…');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push('…');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('…');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className='flex items-center justify-between border-t border-neutral-200 px-4 py-3 dark:border-[#2d3540]'>
      {/* Left side: Rows per page and count */}
      <div className='flex items-center gap-6'>
        <div className='flex items-center gap-2'>
          <label
            htmlFor='pagination-rows-per-page'
            className='text-sm text-neutral-600 dark:text-[#9dabb9]'
          >
            Rows per page:
          </label>
          <select
            id='pagination-rows-per-page'
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className='rounded border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-[#2d3540] dark:bg-[#1e252e] dark:text-slate-200 dark:focus:ring-[#137fec]'
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className='text-sm text-neutral-600 dark:text-[#9dabb9]'>
          {startItem}–{endItem} of {totalItems}
        </div>
      </div>

      {/* Right side: Pagination controls */}
      <div className='flex items-center gap-2'>
        {/* First page */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className='cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-[#1e252e] dark:disabled:hover:bg-transparent'
          title='First page'
          aria-label='First page'
        >
          <ChevronsLeft
            className='h-4 w-4 text-neutral-700 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
        </button>

        {/* Previous page */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-[#1e252e] dark:disabled:hover:bg-transparent'
          title='Previous page'
          aria-label='Previous page'
        >
          <ChevronLeft
            className='h-4 w-4 text-neutral-700 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
        </button>

        {/* Page numbers */}
        <div className='flex items-center gap-1'>
          {pageNumbers.map((page, index) => {
            if (page === '…') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className='px-2 text-neutral-500 dark:text-[#9dabb9]/60'
                >
                  …
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[32px] rounded px-2 py-1 text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 font-medium text-white dark:bg-[#137fec]'
                    : 'text-neutral-700 hover:bg-neutral-200 dark:text-[#9dabb9] dark:hover:bg-[#1e252e]'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next page */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-[#1e252e] dark:disabled:hover:bg-transparent'
          title='Next page'
          aria-label='Next page'
        >
          <ChevronRight
            className='h-4 w-4 text-neutral-700 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className='cursor-pointer rounded p-1.5 transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent dark:hover:bg-[#1e252e] dark:disabled:hover:bg-transparent'
          title='Last page'
          aria-label='Last page'
        >
          <ChevronsRight
            className='h-4 w-4 text-neutral-700 dark:text-[#9dabb9]'
            aria-hidden='true'
          />
        </button>
      </div>
    </div>
  );
}
