import { renderToStaticMarkup } from 'react-dom/server';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useCaseSyncFromRedcapAutoHistoryModel } from '../../api/cases.api';
import { CasesInfoDrawer } from '../CasesInfoDrawer';

vi.mock('@/components/modals/DrawerFrame', () => ({
  DrawerFrame: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock('../AddCaseModal', () => ({
  AddCaseModal: () => null,
}));

vi.mock('../AutoImportFromRedcapModal', () => ({
  AutoImportFromRedcapModal: () => null,
}));

vi.mock('../SyncHistoryDialog', () => ({
  SyncHistoryDialog: () => null,
}));

vi.mock('../../api/cases.api', () => ({
  useCaseSyncFromRedcapAutoHistoryModel: vi.fn(() => ({
    data: {
      results: [{ importedAt: '2026-06-04T13:54:19Z' }],
    },
    isLoading: false,
    isError: false,
  })),
}));

const useSyncHistoryMock = vi.mocked(useCaseSyncFromRedcapAutoHistoryModel);

describe('CasesInfoDrawer', () => {
  it('keeps the REDCap sync history label query disabled while the drawer is closed', () => {
    renderToStaticMarkup(<CasesInfoDrawer isOpen={false} onClose={() => undefined} />);

    expect(useSyncHistoryMock).toHaveBeenCalledWith({
      params: { query: { page: 1, rowsPerPage: 1 } },
      reactQuery: { enabled: false },
    });
  });

  it('loads and renders the last synced label when the drawer is open', () => {
    const html = renderToStaticMarkup(<CasesInfoDrawer isOpen={true} onClose={() => undefined} />);

    expect(useSyncHistoryMock).toHaveBeenCalledWith({
      params: { query: { page: 1, rowsPerPage: 1 } },
      reactQuery: { enabled: true },
    });
    expect(html).toContain('Last synced at');
    expect(html).toContain('2026-06-04 23:54 +10:00');
  });
});
