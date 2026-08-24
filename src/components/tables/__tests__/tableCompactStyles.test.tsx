// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '../DataTable';
import { ExpandableTable, type ExpandableColumn, type SubRowColumn } from '../ExpandableTable';
import { FilterBar } from '../FilterBar';
import { SimpleTable, type SimpleTableColumn } from '../SimpleTable';
import { TABLE_DENSITY_CLASSNAMES } from '../tableStyles';
import { useTableDensity } from '../useTableDensity';

interface Row {
  id: string;
  name: string;
}

const rows: Row[] = [{ id: 'row-1', name: 'Alpha' }];
const dataColumns: Column<Row>[] = [{ key: 'name', header: 'Name' }];
const sortableDataColumns: Column<Row>[] = [
  { key: 'name', header: 'Sortable name', sortable: true, onSort: vi.fn() },
  { key: 'id', header: 'Static ID' },
];
const expandableColumns: ExpandableColumn<Row>[] = [{ key: 'name', header: 'Name' }];
const sortableExpandableColumns: ExpandableColumn<Row>[] = [
  { key: 'name', header: 'Sortable name', sortable: true },
  { key: 'id', header: 'Static ID' },
];
const subColumns: SubRowColumn<Row>[] = [{ key: 'name', header: 'Name' }];
const simpleColumns: SimpleTableColumn<Row>[] = [{ key: 'name', header: 'Name' }];

function DensityProbe() {
  const [density] = useTableDensity();
  return <span>{density}</span>;
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('compact table design system', () => {
  it('uses compact density by default', () => {
    render(<DensityProbe />);

    expect(screen.getByText('compact')).toBeTruthy();
  });

  it('uses the intended comfortable spacing hierarchy', () => {
    expect(TABLE_DENSITY_CLASSNAMES.comfortable.cell.split(/\s+/)).toContain('py-2.5');
    expect(TABLE_DENSITY_CLASSNAMES.comfortable.header.split(/\s+/)).toContain('py-2');
    expect(TABLE_DENSITY_CLASSNAMES.comfortable.subCell.split(/\s+/)).toContain('py-2');
  });

  it('uses consistent compact header and cell styles across table primitives', () => {
    const { unmount } = render(<DataTable data={rows} columns={dataColumns} showToolbar={false} />);

    expect(screen.getByRole('columnheader').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['px-3', 'py-1.5', 'text-xs', 'font-semibold'])
    );
    expect(screen.getByRole('cell').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['px-3', 'py-1.5', 'text-sm'])
    );

    unmount();
    render(
      <ExpandableTable
        data={rows}
        columns={expandableColumns}
        subColumns={subColumns}
        keyExtractor={(row) => row.id}
        subRowsExtractor={() => []}
        subKeyExtractor={(row) => row.id}
        expandable={false}
        showToolbar={false}
      />
    );

    expect(screen.getByRole('columnheader').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['px-3', 'py-1.5', 'text-xs', 'font-semibold'])
    );
    expect(screen.getByRole('cell').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['px-3', 'py-1.5', 'text-sm'])
    );

    cleanup();
    render(<SimpleTable data={rows} columns={simpleColumns} />);

    const simpleHeaderClasses = screen.getByRole('columnheader').className.split(/\s+/);
    expect(simpleHeaderClasses).toEqual(
      expect.arrayContaining(['px-3', 'py-2', 'text-xs', 'font-semibold'])
    );
    expect(simpleHeaderClasses).not.toContain('uppercase');
    expect(screen.getByRole('cell').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['px-3', 'py-2', 'text-sm'])
    );
  });

  it('uses the shared auto-hide scroll area across table primitives', () => {
    const { unmount } = render(<DataTable data={rows} columns={dataColumns} showToolbar={false} />);

    const dataScrollArea = screen.queryByRole('region', { name: 'Scrollable data table' });
    expect(dataScrollArea).toBeTruthy();
    expect(dataScrollArea?.className.split(/\s+/)).toEqual(
      expect.arrayContaining([
        'scrollbar-auto-hide',
        'overflow-x-auto',
        'overflow-y-auto',
        'max-h-150',
      ])
    );

    unmount();
    render(
      <ExpandableTable
        data={rows}
        columns={expandableColumns}
        subColumns={subColumns}
        keyExtractor={(row) => row.id}
        subRowsExtractor={() => []}
        subKeyExtractor={(row) => row.id}
        expandable={false}
        showToolbar={false}
      />
    );

    const expandableScrollArea = screen.queryByRole('region', {
      name: 'Scrollable expandable table',
    });
    expect(expandableScrollArea).toBeTruthy();
    expect(expandableScrollArea?.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['scrollbar-auto-hide', 'overflow-x-auto', 'overflow-y-auto'])
    );

    cleanup();
    render(<SimpleTable data={rows} columns={simpleColumns} />);

    const simpleScrollArea = screen.queryByRole('region', { name: 'Scrollable table' });
    expect(simpleScrollArea).toBeTruthy();
    expect(simpleScrollArea?.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['scrollbar-auto-hide', 'overflow-x-auto'])
    );
  });

  it('renders sortable and static headers with the same explicit label typography', () => {
    const { unmount } = render(
      <DataTable data={rows} columns={sortableDataColumns} showToolbar={false} />
    );

    const dataSortableLabel = screen.getByText('Sortable name');
    const dataStaticLabel = screen.getByText('Static ID');

    expect(dataSortableLabel.tagName).toBe('SPAN');
    expect(dataStaticLabel.tagName).toBe('SPAN');
    expect(dataSortableLabel.className).toBe(dataStaticLabel.className);
    expect(dataSortableLabel.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['text-xs', 'leading-4', 'font-semibold'])
    );

    unmount();
    render(
      <ExpandableTable
        data={rows}
        columns={sortableExpandableColumns}
        subColumns={subColumns}
        keyExtractor={(row) => row.id}
        subRowsExtractor={() => []}
        subKeyExtractor={(row) => row.id}
        expandable={false}
        showToolbar={false}
      />
    );

    const expandableSortableLabel = screen.getByText('Sortable name');
    const expandableStaticLabel = screen.getByText('Static ID');

    expect(expandableSortableLabel.tagName).toBe('SPAN');
    expect(expandableStaticLabel.tagName).toBe('SPAN');
    expect(expandableSortableLabel.className).toBe(expandableStaticLabel.className);
    expect(expandableSortableLabel.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['text-xs', 'leading-4', 'font-semibold'])
    );
  });

  it('uses the compact search surface spacing', () => {
    render(<FilterBar searchValue='' onSearchChange={vi.fn()} searchLabel='Search records' />);

    const searchInput = screen.getByRole('textbox', { name: 'Search records' });
    const searchRow = searchInput.parentElement?.parentElement;
    const searchSurface = searchRow?.parentElement;

    expect(searchInput.className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-9', 'bg-neutral-50'])
    );
    expect(searchRow?.className.split(/\s+/)).toEqual(expect.arrayContaining(['gap-2', 'p-2.5']));
    expect(searchSurface?.className.split(/\s+/)).toContain('my-3');
  });

  it('provides an inline button size that does not inflate table rows', () => {
    render(<Button size='inline'>Open record</Button>);

    expect(screen.getByRole('button').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-auto', 'min-h-0', 'p-0'])
    );
  });

  it('provides a consistent 24px table-action control', () => {
    render(<Button size='table'>Open report</Button>);

    expect(screen.getByRole('button').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['h-6', 'min-h-6', 'gap-1', 'px-2', 'py-1'])
    );
  });

  it('provides a consistent 24px table icon control', () => {
    render(<Button size='tableIcon'>Open menu</Button>);

    expect(screen.getByRole('button').className.split(/\s+/)).toEqual(
      expect.arrayContaining(['size-6', 'min-h-6', 'p-1'])
    );
  });
});
