import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SampleSheetUploadModal } from '../SampleSheetUploadModal';
import { SampleSheetViewModal } from '../SampleSheetViewModal';
import type { SequenceRunSampleSheetDetailModel } from '../../../api/sequence.api';

vi.mock('@headlessui/react', () => ({
  Description: ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  Dialog: ({
    children,
    className,
    open,
  }: {
    children: ReactNode;
    className?: string;
    open: boolean;
  }) => (open ? <div className={className}>{children}</div> : null),
  DialogBackdrop: ({ className }: { className?: string }) => <div className={className} />,
  DialogPanel: ({
    children,
    className,
    style,
  }: {
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
  }) => (
    <section className={className} style={style}>
      {children}
    </section>
  ),
  DialogTitle: ({ children, className }: { children: ReactNode; className?: string }) => (
    <h2 className={className}>{children}</h2>
  ),
}));

vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useParams: () => ({ instrumentRunId: '240101_A00000_0000_TEST' }),
}));

vi.mock('@/context/auth-context', () => ({
  useAuthContext: () => ({
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    signInWithGoogle: vi.fn(),
    user: { email: 'ray@example.com' },
  }),
}));

vi.mock('../../../api/sequence.api', () => ({
  useSequenceRunAddSampleSheetModel: () => ({ mutateAsync: vi.fn() }),
}));

const sampleSheet: SequenceRunSampleSheetDetailModel = {
  orcabusId: 'ss.001',
  sampleSheetName: 'SampleSheet.csv',
  associationStatus: 'ACTIVE',
  associationTimestamp: '2026-06-01T12:00:00Z',
  sampleSheetContent: {
    header: { experimentName: 'Run 001' },
    bclconvertData: [{ sampleId: 'L240001', index: 'ACGT' }],
  },
  sampleSheetContentOriginal: '[Header]\nExperiment Name,Run 001',
  sequence: 'sequence.001',
  comment: {
    orcabusId: 'comment.001',
    comment: 'Initial upload',
    createdAt: '2026-06-01T12:00:00Z',
    createdBy: 'ray@example.com',
    updatedAt: '2026-06-01T12:00:00Z',
  },
};

describe('SampleSheetViewModal', () => {
  it('renders the viewer inside the system dialog frame contract', () => {
    const html = renderToStaticMarkup(
      <SampleSheetViewModal isOpen={true} onClose={() => undefined} sampleSheet={sampleSheet} />
    );

    expect(html).toContain('SampleSheet.csv');
    expect(html).toContain('Sample Sheet Viewer');
    expect(html).toContain('aria-label="Close sample sheet viewer"');
    expect(html).toContain('aria-label="Download sample sheet as CSV"');
  });
});

describe('SampleSheetUploadModal', () => {
  it('renders upload controls inside the system dialog frame contract', () => {
    const html = renderToStaticMarkup(
      <SampleSheetUploadModal isOpen={true} onClose={() => undefined} />
    );

    expect(html).toContain('Upload Sample Sheet');
    expect(html).toContain('Upload a CSV sample sheet');
    expect(html).toContain('id="sample-sheet-upload-form"');
    expect(html).toContain('form="sample-sheet-upload-form"');
    expect(html).toContain('aria-label="Close upload sample sheet dialog"');
  });
});
