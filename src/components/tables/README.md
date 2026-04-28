# Tables Components

Reusable table, filter, and pagination helpers for Orcabus list and detail views. These components are intentionally presentation-focused: callers own data fetching, URL/query-param state, mutations, and domain-specific filtering.

Import components from their files, for example:

```tsx
import { DataTable, type Column } from '@/components/tables/DataTable';
import { FilterBar, type FilterBadge } from '@/components/tables/FilterBar';
import { useTablePagination } from '@/components/tables/useTablePagination';
```

## Component Map

| File                    | Use For                                                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DataTable.tsx`         | Standard data grids with toolbar, optional selection, column chooser, sorting hooks, copyable cells, loading rows, and pagination. |
| `SimpleTable.tsx`       | Compact read-only tables inside drawers, detail cards, and small nested sections.                                                  |
| `ExpandableTable.tsx`   | Parent rows that reveal sub-rows, such as instrument runs with nested sequence data.                                               |
| `FilterBar.tsx`         | Search input plus caller-rendered inline filters/actions and active filter badges.                                                 |
| `AdvancedFilterBar.tsx` | Search plus a collapsible filter panel for text, number, range, date, select, and multi-select filters.                            |
| `Pagination.tsx`        | Shared pagination footer with page-size selector and first/previous/page/next/last controls.                                       |
| `useTablePagination.ts` | Local pagination state and default pagination normalization helpers.                                                               |

## Choosing A Table

Use `DataTable` for most list pages. It is the default for sortable, paginated lists and richer toolbars.

Use `SimpleTable` when the table is read-only and local, especially in detail drawers or overview panels where pagination and toolbar controls would be noisy.

Use `ExpandableTable` when each top-level row can expand into structured child rows. It owns expanded-row state internally.

## DataTable

`DataTable` renders a sticky-header table with optional toolbar controls.

```tsx
type Library = {
  id: string;
  name: string;
  status: string;
};

const columns: Column<Library>[] = [
  { key: 'name', header: 'Library', sortable: true, onSort: setNameSort },
  { key: 'status', header: 'Status' },
  {
    key: 'id',
    header: 'ID',
    copyable: true,
    render: (library) => <code>{library.id}</code>,
  },
];

const pagination = useTablePagination(1, 20, libraries.length);

<DataTable
  data={libraries}
  columns={columns}
  paginationProps={pagination}
  onRowClick={openLibrary}
/>;
```

### DataTable Props

| Prop                  | Purpose                                                                                 |
| --------------------- | --------------------------------------------------------------------------------------- |
| `data`                | Row data to render.                                                                     |
| `columns`             | Column definitions.                                                                     |
| `onRowClick`          | Makes rows clickable and receives the row item.                                         |
| `emptyMessage`        | Empty-state text. Defaults to `No data to display`.                                     |
| `paginationProps`     | Enables the pagination footer and controls paging behavior.                             |
| `striped`             | Adds alternating row backgrounds.                                                       |
| `inCard`              | Removes the outer border/background so the table can sit inside another card or drawer. |
| `showToolbar`         | Shows row count, refresh, density, column chooser, and actions. Defaults to `true`.     |
| `onRefresh`           | Shows a refresh button; async handlers display a spinning icon while pending.           |
| `toolbarActions`      | Adds an `Actions` dropdown for caller-owned table actions.                              |
| `toolbarActionsLabel` | Label for the toolbar actions dropdown. Defaults to `Actions`.                          |
| `selectable`          | Enables page-level and row-level selection checkboxes.                                  |
| `isLoading`           | Shows skeleton placeholder rows.                                                        |
| `loadingRows`         | Skeleton row count. Defaults to `8`.                                                    |

### Columns

```ts
interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  defaultVisible?: boolean;
  sortable?: boolean;
  onSort?: (nextDirection: 'asc' | 'desc') => void;
  sortDirection?: 'asc' | 'desc' | undefined;
  defaultSortDirection?: 'asc' | 'desc';
  copyable?: boolean;
  csvValue?: (item: T) => string | number | boolean | null | undefined;
}
```

Notes:

- `render` controls display. Without it, the table reads `item[column.key]`.
- `sortable` only changes the UI and calls `onSort`; callers own actual sorting or API order changes.
- `sortDirection` marks the current state. If omitted, the sort icon is neutral.
- `defaultSortDirection` controls the first direction passed to `onSort`.
- `copyable` adds a copy button that copies the raw `item[column.key]` value.
- `csvValue` is not used by `DataTable` directly; feature-level CSV exporters can use it when building toolbar actions.
- `defaultVisible` exists on the type, but current initial visibility uses all columns.

### Pagination Behavior

`DataTable` uses `paginationProps` for the pagination footer.

Client-side pagination:

```tsx
const pagination = useTablePagination(1, 20, rows.length);

<DataTable data={rows} columns={columns} paginationProps={pagination} />;
```

Server-side or URL-driven pagination:

```tsx
<DataTable
  data={response.items}
  columns={columns}
  paginationProps={{
    page: query.pagination.page,
    pageSize: query.pagination.rowsPerPage,
    totalItems: response.pagination.count,
    onPageChange: (page) => setParams({ page }),
    onPageSizeChange: (rowsPerPage) => setParams({ page: 1, rowsPerPage }),
  }}
/>
```

When `paginationProps.totalItems` is omitted, `DataTable` slices `data` client-side. When `totalItems` is provided, `DataTable` assumes the caller already provided the current page of rows and does not slice `data`.

Important: `DataTable` still applies the default page size internally even when no pagination footer is shown. Pass `paginationProps` for normal lists, or use `SimpleTable` for small unpaginated tables.

### Toolbar Actions And Selection

Toolbar actions receive table context, including visible columns and selected rows.

```tsx
const toolbarActions: DataTableToolbarAction<Library>[] = [
  {
    id: 'download-csv',
    label: 'Download CSV',
    icon: <Download className='h-4 w-4' />,
    disabled: ({ paginatedData }) => paginatedData.length === 0,
    onClick: ({ selectedRows, paginatedData, visibleColumns }) => {
      const rows = selectedRows.length > 0 ? selectedRows : paginatedData;
      downloadCsv(rows, visibleColumns);
    },
  },
];

<DataTable
  data={libraries}
  columns={columns}
  paginationProps={pagination}
  selectable
  toolbarActions={toolbarActions}
/>;
```

Selection is tracked by row index against the current `data` array identity. If the data array changes, selection is treated as empty for the new dataset.

## SimpleTable

`SimpleTable` is a lightweight table for detail sections.

```tsx
import { SimpleTable, type SimpleTableColumn } from '@/components/tables/SimpleTable';

const columns: SimpleTableColumn<RunContext>[] = [
  { key: 'name', header: 'Name' },
  { key: 'value', header: 'Value', render: (row) => <code>{row.value}</code> },
];

<SimpleTable title='Run Context' data={runContext} columns={columns} rowKey={(row) => row.name} />;
```

Props:

| Prop           | Purpose                                             |
| -------------- | --------------------------------------------------- |
| `data`         | Rows to render.                                     |
| `columns`      | Column definitions.                                 |
| `rowKey`       | Stable key extractor. Falls back to array index.    |
| `emptyMessage` | Empty-state text. Defaults to `No data to display.` |
| `title`        | Optional uppercase title above the table.           |
| `className`    | Wrapper class name.                                 |
| `isLoading`    | Shows skeleton placeholder rows.                    |
| `loadingRows`  | Skeleton row count. Defaults to `8`.                |

`SimpleTable` has no pagination, sorting, toolbar, selection, or column chooser.

## ExpandableTable

`ExpandableTable` renders parent rows with optional child rows.

```tsx
import {
  ExpandableTable,
  type ExpandableColumn,
  type SubRowColumn,
} from '@/components/tables/ExpandableTable';

const columns: ExpandableColumn<SequenceRun>[] = [
  { key: 'runId', header: 'Run ID', sortable: true },
  { key: 'status', header: 'Status' },
];

const subColumns: SubRowColumn<Lane>[] = [
  { key: 'lane', header: 'Lane' },
  { key: 'yieldGb', header: 'Yield GB' },
];

<ExpandableTable
  data={sequenceRuns}
  columns={columns}
  subColumns={subColumns}
  keyExtractor={(run) => run.id}
  subRowsExtractor={(run) => run.lanes}
  subKeyExtractor={(lane) => lane.id}
  paginationProps={pagination}
/>;
```

Props:

| Prop                  | Purpose                                                                             |
| --------------------- | ----------------------------------------------------------------------------------- |
| `data`                | Parent rows.                                                                        |
| `columns`             | Parent row columns.                                                                 |
| `subColumns`          | Expanded child row columns.                                                         |
| `keyExtractor`        | Stable parent row key.                                                              |
| `subRowsExtractor`    | Returns child rows for a parent row.                                                |
| `subKeyExtractor`     | Stable child row key.                                                               |
| `onRowClick`          | Parent row click handler.                                                           |
| `expandable`          | Shows expand controls. Defaults to `true`.                                          |
| `paginationProps`     | Enables pagination. If omitted, all parent rows render.                             |
| `emptyMessage`        | Empty-state text.                                                                   |
| `isLoading`           | Shows skeleton placeholder rows.                                                    |
| `loadingRows`         | Skeleton row count. Defaults to `8`.                                                |
| `showToolbar`         | Shows row count, refresh, density, column chooser, and actions. Defaults to `true`. |
| `onRefresh`           | Shows a refresh button.                                                             |
| `toolbarActions`      | Adds caller-owned toolbar actions.                                                  |
| `toolbarActionsLabel` | Label for toolbar actions. Defaults to `Actions`.                                   |
| `inCard`              | Removes the outer border/background.                                                |

Sorting in `ExpandableTable` is local and only supports sortable parent columns. It reads the raw value at `item[column.key]`, so use sortable only for primitive string/number fields.

## FilterBar

`FilterBar` is a controlled search bar with optional inline filter controls, optional actions, and removable active-filter badges.

```tsx
<FilterBar
  searchValue={query.search}
  onSearchChange={(search) => setParams({ search, page: 1 })}
  searchPlaceholder='Search cases...'
  filters={<StatusSelect value={query.status} onChange={(status) => setParams({ status })} />}
  actions={<CreateButton />}
  activeFilterBadges={badges}
  onClearAll={() => clearFilters()}
/>
```

Search changes are debounced with `searchDebounceMs`, defaulting to `400`.

```ts
interface FilterBadge {
  id: string;
  type: 'search' | 'range' | 'filter';
  label: string;
  value: string | string[];
  onRemove: () => void;
}
```

Badge display is formatted as `Label: value`. Search badges use the neutral `PillTag` variant; range and filter badges use blue.

## AdvancedFilterBar

`AdvancedFilterBar` is for filter-heavy pages. Search commits with debounce, while panel fields are drafted locally and committed only when the user clicks `Apply Filters`.

```tsx
import { AdvancedFilterBar, type FilterFieldConfig } from '@/components/tables/AdvancedFilterBar';

const filterFields: FilterFieldConfig[] = [
  { key: 'libraryId', label: 'Library ID' },
  { type: 'select', key: 'status', label: 'Status', options: statusOptions },
  {
    type: 'range',
    label: 'Coverage',
    minKey: 'coverageMin',
    maxKey: 'coverageMax',
    minPlaceholder: 'Min',
    maxPlaceholder: 'Max',
  },
  { type: 'multi-select', key: 'projectIds', label: 'Projects', options: projectOptions },
  { type: 'date', key: 'createdAfter', label: 'Created After' },
];

<AdvancedFilterBar
  searchValue={query.search}
  onSearchChange={(search) => setParams({ search, page: 1 })}
  filterFields={filterFields}
  filterValues={query.filters}
  onFiltersChange={(filters) => setParams({ ...filters, page: 1 })}
  activeFilterBadges={badges}
  onClearAll={clearFilters}
  columns={6}
/>;
```

Supported filter field types:

| Type              | Required Keys               | Notes                                                     |
| ----------------- | --------------------------- | --------------------------------------------------------- |
| `text` or omitted | `key`, `label`              | Renders a text input.                                     |
| `number`          | `key`, `label`              | Renders a number input.                                   |
| `range`           | `minKey`, `maxKey`, `label` | Renders two number inputs.                                |
| `select`          | `key`, `label`, `options`   | Renders a single select with an `All` option.             |
| `multi-select`    | `key`, `label`, `options`   | Stores values as a comma-separated string in draft state. |
| `date`            | `key`, `label`              | Renders a date input.                                     |

`filterValues` should contain committed values from the parent state, commonly URL params. When the panel opens, those values are copied into local draft state.

## Pagination Helpers

### Pagination

`Pagination` is the shared footer used by `DataTable` and `ExpandableTable`.

```tsx
<Pagination
  currentPage={page}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setPage}
  onPageSizeChange={setPageSize}
/>
```

By default, page-size options come from `DEFAULT_PAGE_SIZE_OPTIONS` in `src/utils/constants.ts`: `10`, `20`, `50`, and `100`.

### useTablePagination

Use `useTablePagination` for local pagination that is not synced to the URL.

```tsx
const pagination = useTablePagination(1, 20, rows.length);

<DataTable data={rows} columns={columns} paginationProps={pagination} />;
```

For URL-driven pages, prefer the feature-specific query-param hooks and pass a `paginationProps` object directly.

### usePaginationDefaults

`usePaginationDefaults` normalizes partial pagination props for table internals. It fills missing values with `DEFAULT_PAGE_SIZE` and no-op callbacks.

## Common Patterns

### URL-Driven Search, Filters, And Server Pagination

```tsx
<FilterBar
  searchValue={params.search}
  onSearchChange={(search) => setParams({ search, page: 1 })}
  activeFilterBadges={filterBadges}
  onClearAll={() => setParams({ search: '', status: '', page: 1 })}
/>

<DataTable
  data={result.items}
  columns={columns}
  isLoading={isLoading}
  paginationProps={{
    page: params.page,
    pageSize: params.rowsPerPage,
    totalItems: result.pagination.count,
    onPageChange: (page) => setParams({ page }),
    onPageSizeChange: (rowsPerPage) => setParams({ rowsPerPage, page: 1 }),
  }}
/>;
```

### Detail Drawer Tables

```tsx
<SimpleTable
  title='Workflow History'
  data={history}
  columns={historyColumns}
  rowKey={(item) => item.version}
  emptyMessage='No workflow history found.'
/>
```

## Best Practices

- Keep data fetching, filtering, sorting, URL params, and mutations in the feature layer.
- Prefer `DataTable` with `paginationProps` for page-level lists.
- Prefer `SimpleTable` for small, read-only detail sections.
- Provide stable `keyExtractor`, `subKeyExtractor`, and `rowKey` functions when data can reorder.
- Use `Column.render` for badges, links, dates, and formatted values.
- Use `Column.csvValue` in feature-level export helpers when rendered cells are not plain text.
- Reset the current page to `1` when search, filters, or page size changes.
- Use `inCard` when placing `DataTable` or `ExpandableTable` inside an already bordered container.
- Pass `isLoading` instead of replacing the table when you want stable layout during fetches.

## Gotchas

- `DataTable` sorting is controlled by the caller. The table only displays sort state and calls `onSort`.
- `ExpandableTable` sorting is local and reads raw primitive values from parent rows.
- `DataTable` selection is index-based and resets logically when the `data` array identity changes.
- `FilterBar` and `AdvancedFilterBar` debounce search but do not debounce filter panel apply/reset actions.
- `AdvancedFilterBar` dynamic columns are also backed by an inline `gridTemplateColumns` style, so the `columns` prop does not rely only on Tailwind class generation.
