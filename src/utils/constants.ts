// default page size and size options for pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
export const DEFAULT_NON_PAGINATE_PAGE_SIZE = 100; // Mainly for component that do not have pagination implementation (e.g. dropdowns)
export const DEFAULT_ITEMS_PER_PAGE_OPTIONS = [3, 10, 20, 50, 100]; // list table: items per page options for larger datasets

// query params constants
export const PARAM_PAGE = 'page';
export const PARAM_ROWS_PER_PAGE = 'rowsPerPage';
export const PARAM_ORDER_BY = 'orderBy';
export const PARAM_SEARCH = 'search';
