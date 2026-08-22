// @vitest-environment jsdom

import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SyncMetadataModal } from '../SyncMetadataModal';

vi.mock('@/components/modals/DialogFrame', () => ({
  DialogFrame: ({
    children,
    footer,
    isOpen,
  }: {
    children: ReactNode;
    footer: ReactNode;
    isOpen: boolean;
  }) =>
    isOpen ? (
      <div>
        {children}
        {footer}
      </div>
    ) : null,
}));

vi.mock('../../../shared/api/lab.api', () => ({
  useMutationPreviewGsheetRecords: () => ({
    data: undefined,
    status: 'idle',
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }),
  useMutationSyncGsheet: () => ({
    status: 'idle',
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }),
  useMutationSyncCustomCsv: () => ({
    status: 'idle',
    mutateAsync: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe('SyncMetadataModal', () => {
  it('renders source choices as full-width cards with wrapped content', () => {
    render(<SyncMetadataModal isOpen onClose={vi.fn()} />);

    const sourceChoice = screen.getByRole('button', { name: /Google Tracking Sheet/i });
    const classes = sourceChoice.className.split(/\s+/);

    expect(classes).toEqual(
      expect.arrayContaining(['block', 'h-auto', 'w-full', 'whitespace-normal'])
    );
    expect(sourceChoice.getAttribute('type')).toBe('button');
  });
});
