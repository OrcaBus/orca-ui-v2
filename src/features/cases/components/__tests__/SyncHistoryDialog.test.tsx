import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { SyncHistoryDialog } from '../SyncHistoryDialog';

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

describe('SyncHistoryDialog', () => {
  it('renders above open drawers', () => {
    const html = renderToStaticMarkup(
      <SyncHistoryDialog isOpen={true} onClose={() => undefined} />
    );

    expect(html).toContain('z-[60]');
  });
});
