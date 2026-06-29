import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { useCaseSyncFromRedcapAutoHistoryModel } from '../../api/cases.api';
import { SyncHistoryDialog } from '../SyncHistoryDialog';

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

vi.mock('../../api/cases.api', () => ({
  useCaseSyncFromRedcapAutoHistoryModel: vi.fn(() => ({
    data: {
      results: [],
      pagination: {
        page: 1,
        rowsPerPage: 10,
        count: 0,
      },
    },
    isLoading: false,
    refetch: vi.fn(),
  })),
}));

const useSyncHistoryMock = vi.mocked(useCaseSyncFromRedcapAutoHistoryModel);

describe('SyncHistoryDialog', () => {
  it('renders above open drawers', () => {
    const html = renderToStaticMarkup(
      <SyncHistoryDialog isOpen={true} onClose={() => undefined} />
    );

    expect(html).toContain('z-60');
  });

  it('formats imported timestamps in the display timezone', () => {
    useSyncHistoryMock.mockReturnValueOnce({
      data: {
        results: [
          {
            id: 1,
            externalService: 'REDCap',
            importedAt: '2026-06-04T13:54:19Z',
          },
        ],
        pagination: {
          page: 1,
          rowsPerPage: 10,
          count: 1,
        },
      },
      isLoading: false,
      refetch: vi.fn(),
    } as unknown as ReturnType<typeof useCaseSyncFromRedcapAutoHistoryModel>);

    const html = renderToStaticMarkup(
      <SyncHistoryDialog isOpen={true} onClose={() => undefined} />
    );

    expect(html).toContain('2026-06-04 23:54 +10:00');
  });
});
