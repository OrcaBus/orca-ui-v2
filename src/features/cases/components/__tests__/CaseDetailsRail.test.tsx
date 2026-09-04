// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CaseDetailModel } from '../../api/cases.api';
import { useCaseDetailsContext } from '../../context/CaseDetailsContext';
import { CaseDetailsRail } from '../CaseDetailsRail';
import { EMPTY_CASE_VALUE } from '../../utils/caseDisplay';

vi.mock('../../context/CaseDetailsContext', () => ({
  useCaseDetailsContext: vi.fn(),
}));

const useCaseDetailsContextMock = vi.mocked(useCaseDetailsContext);

const fullCaseDetail: CaseDetailModel = {
  orcabusId: 'cas.01TEST',
  requestFormId: 'RF-1001',
  type: 'wgts',
  studyName: 'ASPi2L',
  studyId: 'STUDY-42',
  urNumber: 'UR123456',
  description: 'Case ready for review',
  studyType: 'clinical',
  isReportRequired: true,
  isNataAccredited: true,
  alias: ['CASE-ALIAS'],
  links: { REDCap: 'https://redcap.example.com' },
  redcapPayload: {},
  dueDate: '2026-08-31',
  externalEntitySet: [],
  pendingExternalEntities: [],
  userSet: [],
  latestState: {
    status: 'sequencing_started',
    createdAt: '2026-01-01T00:00:00Z',
  } as CaseDetailModel['latestState'],
  commentSet: [],
  rnasumReferences: ['BRCA'],
};

// Every optional field left empty so all 14 fields are counted as empty.
const emptyCaseDetail: CaseDetailModel = {
  ...fullCaseDetail,
  requestFormId: null as unknown as CaseDetailModel['requestFormId'],
  alias: [],
  type: null as unknown as CaseDetailModel['type'],
  latestState: null,
  studyName: null,
  studyId: null,
  studyType: null as unknown as CaseDetailModel['studyType'],
  urNumber: null,
  isReportRequired: null as unknown as CaseDetailModel['isReportRequired'],
  isNataAccredited: null as unknown as CaseDetailModel['isNataAccredited'],
  dueDate: null,
  rnasumReferences: [],
  links: {},
  description: null,
};

function mockContext(overrides: {
  caseDetail: CaseDetailModel | undefined;
  isLoadingCaseDetail?: boolean;
}) {
  useCaseDetailsContextMock.mockReturnValue({
    caseDetail: overrides.caseDetail,
    isLoadingCaseDetail: overrides.isLoadingCaseDetail ?? false,
    caseStatesData: undefined,
    isLoadingCaseStates: false,
    refresh: vi.fn(),
  });
}

afterEach(cleanup);

describe('CaseDetailsRail', () => {
  beforeEach(() => {
    mockContext({ caseDetail: fullCaseDetail });
  });

  it('hides empty fields by default and shows a toggle with the empty count', () => {
    mockContext({ caseDetail: emptyCaseDetail });
    render(<CaseDetailsRail />);

    // Fields with values are unaffected; empty-value fields are hidden.
    expect(screen.queryByText(EMPTY_CASE_VALUE)).toBeNull();

    const toggle = screen.getByRole('button', { name: /show empty \(\d+\)/ });
    expect(toggle).toBeTruthy();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('reveals empty fields with EMPTY_CASE_VALUE and relabels the toggle when clicked', async () => {
    mockContext({ caseDetail: emptyCaseDetail });
    const user = userEvent.setup();
    render(<CaseDetailsRail />);

    const toggle = screen.getByRole('button', { name: /show empty \(\d+\)/ });
    await user.click(toggle);

    expect(screen.getAllByText(EMPTY_CASE_VALUE).length).toBeGreaterThan(0);

    const relabeledToggle = screen.getByRole('button', { name: 'hide empty' });
    expect(relabeledToggle).toBeTruthy();
    expect(relabeledToggle.getAttribute('aria-expanded')).toBe('true');
  });

  it('renders no toggle when no field is empty', () => {
    mockContext({ caseDetail: fullCaseDetail });
    render(<CaseDetailsRail />);

    expect(screen.queryByRole('button', { name: /show empty/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /hide empty/ })).toBeNull();
  });

  it('renders Skeletons and no toggle while loading and no case detail is available yet', () => {
    mockContext({ caseDetail: undefined, isLoadingCaseDetail: true });
    const { container } = render(<CaseDetailsRail />);

    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: /show empty/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /hide empty/ })).toBeNull();
  });
});
