import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { CustomStateDialog } from '../CustomStateDialog';

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

describe('CustomStateDialog', () => {
  it('marks the comment as required when the transition API requires it', () => {
    const html = renderToStaticMarkup(
      <CustomStateDialog
        isOpen={true}
        onClose={() => undefined}
        onSubmit={() => Promise.resolve()}
        availableStates={[{ value: 'RESOLVED', label: 'Resolved' }]}
        requireComment={true}
      />
    );

    expect(html).toContain('id="comment"');
    expect(html).toContain('required=""');
  });
});
