import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactElement, ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DeployStatusStack } from '../../api/deploy-status.api';
import { DeploymentStacksTable } from '../DeploymentStacksTable';

type CapturedColumn = {
  key: string;
  header: string;
  render?: (row: Record<string, unknown>) => ReactNode;
};

type CapturedDataTableProps = {
  data: Array<Record<string, unknown>>;
  columns: CapturedColumn[];
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

type CapturedDrawerProps = {
  stackId: string | null;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onClose: () => void;
};

const mocks = vi.hoisted(() => ({
  useStacks: vi.fn(),
  useSummaries: vi.fn(),
  refetchStacks: vi.fn(),
  refetchSummaries: vi.fn(),
  setPage: vi.fn(),
  setRowsPerPage: vi.fn(),
  openStackDetails: vi.fn(),
  closeStackDetails: vi.fn(),
}));

let capturedTableProps: CapturedDataTableProps | null = null;
let capturedDrawerProps: CapturedDrawerProps | null = null;

vi.mock('../../api/deploy-status.api', () => ({
  useDeployStatusStacks: mocks.useStacks,
  useDeployStatusStackSummaries: mocks.useSummaries,
}));

vi.mock('../../hooks/useDeploymentPulseQueryParams', () => ({
  useDeploymentPulseQueryParams: () => ({
    page: 3,
    rowsPerPage: 50,
    stackListQueryParams: { page: 3, rowsPerPage: 50 },
    setPage: mocks.setPage,
    setRowsPerPage: mocks.setRowsPerPage,
    selectedStackId: 'url-stack-not-on-current-page',
    openStackDetails: mocks.openStackDetails,
    closeStackDetails: mocks.closeStackDetails,
  }),
}));

vi.mock('../StackEventsDrawer', () => ({
  StackEventsDrawer: (props: CapturedDrawerProps) => {
    capturedDrawerProps = props;
    return null;
  },
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

const stack: DeployStatusStack = {
  orcabusId: 'cfs.01STACKA00000000000000000',
  stackId: '11111111-1111-1111-1111-111111111111',
  latestEventId: 'cfe.01EVENTA00000000000000000',
  stackName: 'AlphaStack',
};

function setSuccessfulQueries() {
  mocks.useStacks.mockReturnValue({
    data: {
      links: { previous: null, next: null },
      pagination: { page: 3, rowsPerPage: 50, count: 121 },
      results: [stack],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: mocks.refetchStacks,
  });
  mocks.useSummaries.mockReturnValue({
    data: [
      {
        stackId: stack.stackId,
        stackName: stack.stackName,
        status: 'UPDATE_COMPLETE',
        modificationTimestamp: '2026-08-04T01:00:00Z',
        gitCommitId: 'abcdef1234567890', // pragma: allowlist secret
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: mocks.refetchSummaries,
  });
}

describe('DeploymentStacksTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedTableProps = null;
    capturedDrawerProps = null;
    setSuccessfulQueries();
  });

  it('renders the registry and opens the URL-selected drawer independently of current rows', () => {
    const html = renderToStaticMarkup(<DeploymentStacksTable />);

    expect(mocks.useStacks).toHaveBeenCalledWith({
      params: { query: { page: 3, rowsPerPage: 50 } },
    });
    expect(html).toContain('AlphaStack');
    expect(html).toContain('UPDATE_COMPLETE');
    expect(html).toContain('abcdef12…');
    expect(html).toContain('2026-08-04 11:00 +10:00');

    expect(capturedTableProps?.paginationProps).toMatchObject({
      page: 3,
      pageSize: 50,
      totalItems: 121,
    });
    expect(capturedDrawerProps).toMatchObject({
      stackId: 'url-stack-not-on-current-page',
      page: 1,
      rowsPerPage: 10,
    });
  });

  it('wires stack pagination, refresh, and the accessible stack-name action', async () => {
    renderToStaticMarkup(<DeploymentStacksTable />);

    capturedTableProps?.paginationProps.onPageChange(4);
    capturedTableProps?.paginationProps.onPageSizeChange(100);
    await capturedTableProps?.onRefresh?.();

    const nameColumn = capturedTableProps?.columns.find((column) => column.key === 'stackName');
    const nameButton = nameColumn?.render?.(capturedTableProps?.data[0] ?? {}) as ReactElement<{
      onClick: () => void;
    }>;
    nameButton.props.onClick();

    expect(mocks.setPage).toHaveBeenCalledWith(4);
    expect(mocks.setRowsPerPage).toHaveBeenCalledWith(100);
    expect(mocks.refetchStacks).toHaveBeenCalledOnce();
    expect(mocks.refetchSummaries).toHaveBeenCalledOnce();
    expect(mocks.openStackDetails).toHaveBeenCalledWith(stack.stackId);

    capturedDrawerProps?.onClose();
    expect(mocks.closeStackDetails).toHaveBeenCalledOnce();
  });

  it('keeps registry rows visible when summaries fail', () => {
    mocks.useSummaries.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('summary unavailable'),
      refetch: mocks.refetchSummaries,
    });

    const html = renderToStaticMarkup(<DeploymentStacksTable />);

    expect(html).toContain('Latest deployment details are unavailable');
    expect(html).toContain('AlphaStack');
    expect(html.match(/>—</g)?.length).toBeGreaterThanOrEqual(3);
  });

  it('shows a blocking error when the stack registry fails', () => {
    mocks.useStacks.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('registry unavailable'),
      refetch: mocks.refetchStacks,
    });

    const html = renderToStaticMarkup(<DeploymentStacksTable />);

    expect(html).toContain('Unable to load deployment stacks');
    expect(capturedTableProps).toBeNull();
    expect(capturedDrawerProps).toBeNull();
  });
});
