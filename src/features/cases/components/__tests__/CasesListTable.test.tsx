import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CasesListTable } from '../CasesListTable';

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../hooks/useCasesListQueryParams', () => ({
  useCasesListQueryParams: () => ({
    caseListQueryParams: { page: 1, rowsPerPage: 10 },
    setPage: vi.fn(),
    setRowsPerPage: vi.fn(),
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
          studyName: 'ASPi2L',
          studyId: 'STUDY-42',
          urNumber: 'UR123456',
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
    columns: Array<{
      key?: string;
      header: ReactNode;
      render?: (row: Record<string, unknown>) => ReactNode;
    }>;
  }) => (
    <div>
      {columns.map((column, index) => (
        <section key={column.key ?? index}>
          <h2>{column.header}</h2>
          {column.render?.(data[0])}
        </section>
      ))}
    </div>
  ),
}));

describe('CasesListTable', () => {
  it('renders compact study, UR number, and due date columns', () => {
    const html = renderToStaticMarkup(<CasesListTable />);

    expect(html).toContain('Study');
    expect(html).toContain('ASPi2L');
    expect(html).toContain('STUDY-42');
    expect(html).toContain('UR Number');
    expect(html).toContain('UR123456');
    expect(html).toContain('Due Date');
    expect(html).toContain('31 Aug 2026');
  });
});
