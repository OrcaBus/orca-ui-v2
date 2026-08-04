import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { DeploymentPulsePage } from '../DeploymentPulsePage';

const mocks = vi.hoisted(() => ({
  useAppShellHeader: vi.fn(),
  openInfoDrawer: vi.fn(),
  closeInfoDrawer: vi.fn(),
  setSearch: vi.fn(),
  clearAllFilters: vi.fn(),
  eventDrawer: vi.fn(),
  infoDrawerProps: null as null | { isOpen: boolean; onClose: () => void },
  filterBarProps: null as null | {
    searchValue: string;
    onSearchChange: (value: string) => void;
    onClearAll?: () => void;
  },
}));

vi.mock('@/context/app-shell-context', () => ({
  useAppShellHeader: mocks.useAppShellHeader,
}));

vi.mock('../../components/DeploymentStacksTable', () => ({
  DeploymentStacksTable: () => <div>Stack registry</div>,
}));

vi.mock('../../hooks/useDeploymentPulseQueryParams', () => ({
  useDeploymentPulseQueryParams: () => ({
    isInfoDrawerOpen: true,
    openInfoDrawer: mocks.openInfoDrawer,
    closeInfoDrawer: mocks.closeInfoDrawer,
    search: 'Alpha',
    setSearch: mocks.setSearch,
    activeFilterBadges: [
      {
        id: 'search',
        type: 'search' as const,
        label: 'Stack name',
        value: 'Alpha',
        onRemove: vi.fn(),
      },
    ],
    clearAllFilters: mocks.clearAllFilters,
  }),
}));

vi.mock('@/components/tables/FilterBar', () => ({
  FilterBar: (props: NonNullable<typeof mocks.filterBarProps>) => {
    mocks.filterBarProps = props;
    return null;
  },
}));

vi.mock('../../components/DeployStatusInfoDrawer', () => ({
  DeployStatusInfoDrawer: (props: { isOpen: boolean; onClose: () => void }) => {
    mocks.infoDrawerProps = props;
    return null;
  },
}));

vi.mock('../../components/StackEventsDrawer', () => ({
  StackEventsDrawer: mocks.eventDrawer,
}));

describe('DeploymentPulsePage', () => {
  it('configures the page header and Deployment Pulse information drawer', () => {
    const html = renderToStaticMarkup(<DeploymentPulsePage />);

    expect(html).toContain('Stack registry');
    expect(mocks.useAppShellHeader).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Deployment Pulse',
        mode: 'main',
        info: { onOpen: mocks.openInfoDrawer },
      })
    );
    expect(mocks.infoDrawerProps).toEqual({
      isOpen: true,
      onClose: mocks.closeInfoDrawer,
    });
    expect(mocks.eventDrawer).not.toHaveBeenCalled();
  });

  it('wires the stack name search bar to the shared query params', () => {
    renderToStaticMarkup(<DeploymentPulsePage />);

    expect(mocks.filterBarProps).toMatchObject({
      searchValue: 'Alpha',
      onSearchChange: mocks.setSearch,
      onClearAll: mocks.clearAllFilters,
    });
  });
});
