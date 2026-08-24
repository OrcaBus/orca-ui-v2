import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CaseDetailModel } from '../../api/cases.api';
import { useCaseDetailsContext } from '../../context/CaseDetailsContext';
import { CaseDetailsOverviewCard } from '../CaseDetailsOverviewCard';

vi.mock('../../context/CaseDetailsContext', () => ({
  useCaseDetailsContext: vi.fn(),
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
  isNataAccredited: true,
  alias: ['CASE-ALIAS'],
  links: {},
  redcapPayload: {},
  dueDate: '2026-08-31',
  externalEntitySet: [],
  userSet: [],
  latestState: null,
  commentSet: [],
  rnasumReferences: [],
};

describe('CaseDetailsOverviewCard', () => {
  beforeEach(() => {
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail,
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: vi.fn(),
    });
  });

  it('renders backend-managed study identifiers and the report due date', () => {
    const html = renderToStaticMarkup(<CaseDetailsOverviewCard />);

    expect(html).toContain('Study Name');
    expect(html).toContain('ASPi2L');
    expect(html).toContain('Study ID');
    expect(html).toContain('STUDY-42');
    expect(html).toContain('UR Number');
    expect(html).toContain('UR123456');
    expect(html).toContain('Due Date');
    expect(html).toContain('31 Aug 2026');
  });

  it('renders empty backend-managed identifiers as em dashes', () => {
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail: {
        ...caseDetail,
        studyName: '',
        studyId: '   ',
        urNumber: '',
      },
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: vi.fn(),
    });

    const html = renderToStaticMarkup(<CaseDetailsOverviewCard />);
    const identifierSection = html.slice(html.indexOf('Study Name'), html.indexOf('Due Date'));

    expect(identifierSection.match(/>—</g)).toHaveLength(3);
  });

  it('renders each RNAsum reference as a list item', () => {
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail: { ...caseDetail, rnasumReferences: ['BRCA', 'PANCAN'] },
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: vi.fn(),
    });

    const html = renderToStaticMarkup(<CaseDetailsOverviewCard />);
    const referenceSection = html.slice(
      html.indexOf('RNAsum References'),
      html.indexOf('Description')
    );

    expect(referenceSection).toContain('<li>');
    expect(referenceSection).toContain('BRCA');
    expect(referenceSection).toContain('PANCAN');
  });

  it('renders an em dash when there are no RNAsum references', () => {
    const html = renderToStaticMarkup(<CaseDetailsOverviewCard />);
    const referenceSection = html.slice(html.indexOf('RNAsum References'), html.indexOf('Links'));

    expect(referenceSection).not.toContain('<li>');
    expect(referenceSection).toContain('—');
  });
});
