import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { WorkflowRunRerunModal } from './WorkflowRunRerunModal';

vi.mock('@headlessui/react', () => ({
  Description: ({ children, className }: { children: ReactNode; className?: string }) => (
    <p className={className}>{children}</p>
  ),
  Dialog: ({ children, open }: { children: ReactNode; open: boolean }) =>
    open ? <div>{children}</div> : null,
  DialogBackdrop: () => <div />,
  DialogPanel: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  DialogTitle: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
}));

vi.mock('./RNASUMDatasetSelect', () => ({
  RNASUMDatasetSelect: () => <div>Dataset selector</div>,
}));

describe('WorkflowRunRerunModal', () => {
  it('disables deprecation and explains when the transition is unavailable', () => {
    const html = renderToStaticMarkup(
      <WorkflowRunRerunModal
        isOpen={true}
        onClose={() => undefined}
        onSubmit={() => Promise.resolve()}
        workflowRunName='Run 001'
        workflowName='RNAsum'
        isValid={true}
        allowedDatasetChoice={['BRCA']}
        validWorkflows={['RNAsum']}
        canMarkAsDeprecated={false}
      />
    );

    expect(html).toContain('id="rerun-mark-deprecated"');
    expect(html).toContain('id="rerun-mark-deprecated" disabled=""');
    expect(html).toContain('Deprecation is not available for the current workflow state.');
  });
});
