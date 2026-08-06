import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { StackEventsDrawer } from '../StackEventsDrawer';

type CapturedDataTableProps = {
  data: Array<Record<string, unknown>>;
  columns: Array<{
    key: string;
    render?: (row: Record<string, unknown>) => ReactNode;
  }>;
  isLoading: boolean;
  onRefresh?: () => void | Promise<void>;
  paginationProps: {
    page: number;
    pageSize: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
};

const mocks = vi.hoisted(() => ({
  useEvents: vi.fn(),
  refetchEvents: vi.fn(),
}));

let capturedTableProps: CapturedDataTableProps | null = null;

vi.mock('../../api/deploy-status.api', () => ({
  useDeployStatusStackEvents: mocks.useEvents,
}));

vi.mock('@/components/modals/DrawerFrame', () => ({
  DrawerFrame: ({
    title,
    subtitle,
    children,
  }: {
    title: ReactNode;
    subtitle?: ReactNode;
    children: ReactNode;
  }) => (
    <aside>
      <h2>{title}</h2>
      {subtitle}
      {children}
    </aside>
  ),
}));

vi.mock('@/components/tables/DataTable', () => ({
  DataTable: (props: CapturedDataTableProps) => {
    capturedTableProps = props;
    return (
      <div>
        {props.data.map((row, rowIndex) => (
          <div key={rowIndex}>
            {props.columns.map((column) => (
              <div key={column.key}>
                {column.render?.(row) ??
                  (typeof row[column.key] === 'string' || typeof row[column.key] === 'number'
                    ? String(row[column.key])
                    : '')}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
}));

const stackId = '11111111-1111-1111-1111-111111111111';

function setSuccessfulEventQuery() {
  mocks.useEvents.mockReturnValue({
    data: {
      links: { previous: null, next: null },
      pagination: { page: 2, rowsPerPage: 50, count: 83 },
      results: [
        {
          orcabusId: 'cfe.01EVENTA00000000000000000',
          eventId: 'cloudformation-event-123',
          stackName: 'AlphaStack',
          status: 'UPDATE_COMPLETE',
          modificationTimestamp: '2026-08-04T01:00:00Z',
          gitCommitId: 'abcdef1234567890', // pragma: allowlist secret
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: mocks.refetchEvents,
  });
}

describe('StackEventsDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedTableProps = null;
    setSuccessfulEventQuery();
  });

  it('keeps the event query disabled while the drawer is closed', () => {
    renderToStaticMarkup(
      <StackEventsDrawer
        stackId={null}
        page={1}
        rowsPerPage={10}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(mocks.useEvents).toHaveBeenCalledWith({
      params: { path: { stack_id: '' }, query: { page: 1, rowsPerPage: 10 } },
      reactQuery: { enabled: false },
    });
  });

  it('requests and renders the selected stack event page using stackId', () => {
    const onPageChange = vi.fn();
    const onRowsPerPageChange = vi.fn();
    const html = renderToStaticMarkup(
      <StackEventsDrawer
        stackId={stackId}
        page={2}
        rowsPerPage={50}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onClose={vi.fn()}
      />
    );

    expect(mocks.useEvents).toHaveBeenCalledWith({
      params: {
        path: { stack_id: stackId },
        query: { page: 2, rowsPerPage: 50 },
      },
      reactQuery: { enabled: true },
    });
    expect(html).toContain('AlphaStack');
    expect(html).toContain(stackId);
    expect(html).toContain('UPDATE_COMPLETE');
    expect(html).toContain('abcdef12…');
    expect(html).toContain('cloudformation-event-123');
    expect(html).toContain('2026-08-04 11:00 +10:00');
    expect(capturedTableProps?.paginationProps).toEqual({
      page: 2,
      pageSize: 50,
      totalItems: 83,
      onPageChange,
      onPageSizeChange: onRowsPerPageChange,
    });
  });

  it('contains event API errors inside the drawer', () => {
    mocks.useEvents.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('events unavailable'),
      refetch: mocks.refetchEvents,
    });

    const html = renderToStaticMarkup(
      <StackEventsDrawer
        stackId={stackId}
        page={1}
        rowsPerPage={10}
        onPageChange={vi.fn()}
        onRowsPerPageChange={vi.fn()}
        onClose={vi.fn()}
      />
    );

    expect(html).toContain('Unable to load deployment events');
    expect(capturedTableProps).toBeNull();
  });
});
