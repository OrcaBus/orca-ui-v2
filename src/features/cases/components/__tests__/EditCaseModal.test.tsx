import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CaseDetailModel } from '../../api/cases.api';
import { useCaseDetailsContext } from '../../context/CaseDetailsContext';
import { buildCaseUpdateRequest, editCaseSchema } from '../../utils/editCase';
import { EditCaseModal } from '../EditCaseModal';

vi.mock('@/components/modals/DialogFrame', () => ({
  DialogFrame: ({ children, footer }: { children: ReactNode; footer: ReactNode }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

vi.mock('../../context/CaseDetailsContext', () => ({
  useCaseDetailsContext: vi.fn(),
}));

vi.mock('../../api/cases.api', () => ({
  useCaseUpdateModel: () => ({
    reset: vi.fn(),
    mutateAsync: vi.fn(),
  }),
}));

const useCaseDetailsContextMock = vi.mocked(useCaseDetailsContext);

const caseDetail: CaseDetailModel = {
  orcabusId: 'cas.01TEST',
  requestFormId: 'RF-1001',
  type: 'wgts',
  studyName: 'ASPi2L',
  studyId: 'STUDY-42',
  urNumber: 'UR123456',
  description: 'Case ready for review',
  studyType: 'clinical',
  isReportRequired: true,
  isNataAccredited: false,
  alias: ['CASE-ALIAS'],
  links: { trello: 'https://example.com/card' },
  dueDate: '2026-08-31',
  externalEntitySet: [],
  userSet: [],
  latestState: null,
  commentSet: [],
};

const baseValues = (overrides: Record<string, unknown> = {}) => ({
  studyType: 'clinical' as const,
  isReportRequired: true,
  isNataAccredited: false,
  dueDate: '2026-08-31',
  alias: [{ value: 'CASE-ALIAS' }],
  links: [{ key: 'trello', value: 'https://example.com/card' }],
  description: 'Ready for review',
  ...overrides,
});

describe('EditCaseModal', () => {
  beforeEach(() => {
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail,
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: vi.fn(),
    });
  });

  it('builds a request containing only backend-writable fields', () => {
    const request = buildCaseUpdateRequest(baseValues());

    expect(request).toEqual({
      studyType: 'clinical',
      isReportRequired: true,
      isNataAccredited: false,
      dueDate: '2026-08-31',
      alias: ['CASE-ALIAS'],
      links: { trello: 'https://example.com/card' },
      description: 'Ready for review',
    });
    expect(request).not.toHaveProperty('requestFormId');
    expect(request).not.toHaveProperty('type');
    expect(request).not.toHaveProperty('studyName');
    expect(request).not.toHaveProperty('studyId');
    expect(request).not.toHaveProperty('urNumber');
  });

  it('sends null when the due date is cleared', () => {
    const request = buildCaseUpdateRequest(baseValues({ dueDate: '' }));

    expect(request.dueDate).toBeNull();
  });

  it('rejects an incomplete named link', () => {
    const result = editCaseSchema.safeParse(
      baseValues({ links: [{ key: '', value: 'https://example.com/card' }] })
    );

    expect(result.success).toBe(false);
  });

  it('renders due date without editable backend-managed identity fields', () => {
    const html = renderToStaticMarkup(<EditCaseModal isOpen onClose={vi.fn()} />);

    expect(html).toContain('Due Date');
    expect(html).toContain('type="date"');
    expect(html).not.toContain('Request Form ID');
    expect(html).not.toContain('id="edit-type"');
  });
});
