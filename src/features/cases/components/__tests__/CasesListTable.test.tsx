import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CasesListTable } from '../CasesListTable';

type RenderedColumn = {
  key?: string;
  header: ReactNode;
  render?: (row: Record<string, unknown>) => ReactNode;
  sortDirection?: 'asc' | 'desc';
  onSort?: (direction: 'asc' | 'desc') => void;
};

const mocks = vi.hoisted(() => ({
  setOrderBy: vi.fn(),
  caseResult: {
    studyName: 'ASPi2L',
    studyId: 'STUDY-42',
    urNumber: 'UR123456',
  },
}));

let renderedColumns: RenderedColumn[] = [];

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../hooks/useCasesListQueryParams', () => ({
  useCasesListQueryParams: () => ({
    caseListQueryParams: { page: 1, rowsPerPage: 10 },
    setPage: vi.fn(),
    setRowsPerPage: vi.fn(),
    setOrderBy: mocks.setOrderBy,
    getOrderDirection: (field: string) => (field === 'study_name' ? 'desc' : undefined),
  }),
}));

vi.mock('../../api/cases.api', () => ({
  useCaseListModel: () => ({
    data: {
      results: [
        {
          orcabusId: 'cas.01TEST',
          requestFormId: 'RF-1001',
          alias: [],
          description: null,
          type: 'wgts',
          studyName: mocks.caseResult.studyName,
          studyId: mocks.caseResult.studyId,
          urNumber: mocks.caseResult.urNumber,
          studyType: 'clinical',
          isReportRequired: true,
          isNataAccredited: true,
          dueDate: '2026-08-31',
          externalEntitySet: [],
          userSet: [],
          latestState: null,
          commentSet: [],
        },
      ],
      pagination: { page: 1, rowsPerPage: 10, count: 1 },
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/components/tables/DataTable', () => ({
  DataTable: ({
    data,
    columns,
  }: {
    data: Array<Record<string, unknown>>;
    columns: RenderedColumn[];
  }) => {
    renderedColumns = columns;
    return (
      <div>
        {columns.map((column, index) => (
          <section key={column.key ?? index}>
            <h2>{column.header}</h2>
            {column.render?.(data[0])}
          </section>
        ))}
      </div>
    );
  },
}));

describe('CasesListTable', () => {
  beforeEach(() => {
    mocks.setOrderBy.mockReset();
    mocks.caseResult.studyName = 'ASPi2L';
    mocks.caseResult.studyId = 'STUDY-42';
    mocks.caseResult.urNumber = 'UR123456';
    renderedColumns = [];
  });

  it('renders study name, UR number, and due date without study ID', () => {
    const html = renderToStaticMarkup(<CasesListTable />);

    expect(html).toContain('Study');
    expect(html).toContain('ASPi2L');
    expect(html).not.toContain('STUDY-42');
    expect(html).toContain('UR Number');
    expect(html).toContain('UR123456');
    expect(html).toContain('Due Date');
    expect(html).toContain('31 Aug 2026');
  });

  it('wires backend ordering for the new sortable fields', () => {
    renderToStaticMarkup(<CasesListTable />);

    const studyColumn = renderedColumns.find((column) => column.key === 'studyName');
    const urNumberColumn = renderedColumns.find((column) => column.key === 'urNumber');
    const dueDateColumn = renderedColumns.find((column) => column.key === 'dueDate');

    expect(studyColumn?.sortDirection).toBe('desc');
    studyColumn?.onSort?.('asc');
    urNumberColumn?.onSort?.('desc');
    dueDateColumn?.onSort?.('asc');

    expect(mocks.setOrderBy).toHaveBeenNthCalledWith(1, 'study_name');
    expect(mocks.setOrderBy).toHaveBeenNthCalledWith(2, '-ur_number');
    expect(mocks.setOrderBy).toHaveBeenNthCalledWith(3, 'due_date');
  });

  it('renders empty study identifiers and UR number as em dashes', () => {
    mocks.caseResult.studyName = '';
    mocks.caseResult.studyId = '   ';
    mocks.caseResult.urNumber = '';

    const html = renderToStaticMarkup(<CasesListTable />);
    const studySection = html.match(/<h2>Study<\/h2>.*?<\/section>/)?.[0];
    const urNumberSection = html.match(/<h2>UR Number<\/h2>.*?<\/section>/)?.[0];

    expect(studySection?.match(/>—</g)).toHaveLength(1);
    expect(urNumberSection?.match(/>—</g)).toHaveLength(1);
  });
});
