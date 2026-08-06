import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeploymentPulseQueryParams } from '../useDeploymentPulseQueryParams';

const mocks = vi.hoisted(() => ({
  getParam: vi.fn(),
  getBooleanParam: vi.fn(),
  setParams: vi.fn(),
  setPage: vi.fn(),
  setRowsPerPage: vi.fn(),
}));

vi.mock('@/hooks/useQueryParams', () => ({
  useQueryParams: () => ({
    pagination: { page: 3, rowsPerPage: 50 },
    getParam: mocks.getParam,
    getBooleanParam: mocks.getBooleanParam,
    setParams: mocks.setParams,
    setPage: mocks.setPage,
    setRowsPerPage: mocks.setRowsPerPage,
  }),
}));

type CapturedHook = ReturnType<typeof useDeploymentPulseQueryParams>;
const captureHook = vi.fn((_props: { value: CapturedHook }) => undefined);

function Capture(props: { value: CapturedHook }) {
  captureHook(props);
  return null;
}

function Probe() {
  return <Capture value={useDeploymentPulseQueryParams()} />;
}

function getCaptured(): CapturedHook {
  const captured = captureHook.mock.calls.at(-1)?.[0].value;
  if (!captured) throw new Error('Hook value was not captured');
  return captured;
}

describe('Deployment Pulse drawer query parameters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getParam.mockReturnValue('stack-123');
    mocks.getBooleanParam.mockReturnValue(false);
    renderToStaticMarkup(<Probe />);
  });

  it('reads the selected stack and info state', () => {
    const captured = getCaptured();
    expect(captured.selectedStackId).toBe('stack-123');
    expect(captured.isInfoDrawerOpen).toBe(false);
  });

  it('gives stack details precedence when a URL contains both drawer parameters', () => {
    mocks.getBooleanParam.mockReturnValue(true);
    renderToStaticMarkup(<Probe />);

    const captured = getCaptured();
    expect(captured.selectedStackId).toBe('stack-123');
    expect(captured.isInfoDrawerOpen).toBe(false);
  });

  it('opens stack details while preserving table pagination and closing info', () => {
    getCaptured().openStackDetails('stack-456');

    expect(mocks.setParams).toHaveBeenCalledWith(
      { stack_id: 'stack-456', info: undefined },
      { resetPagination: false }
    );
  });

  it('closes stack details while preserving table pagination', () => {
    getCaptured().closeStackDetails();

    expect(mocks.setParams).toHaveBeenCalledWith(
      { stack_id: undefined },
      { resetPagination: false, historyReplace: true }
    );
  });

  it('opens info while closing stack details', () => {
    getCaptured().openInfoDrawer();

    expect(mocks.setParams).toHaveBeenCalledWith(
      { info: true, stack_id: undefined },
      { resetPagination: false }
    );
  });

  it('closes info while preserving table pagination', () => {
    getCaptured().closeInfoDrawer();

    expect(mocks.setParams).toHaveBeenCalledWith(
      { info: undefined },
      { resetPagination: false, historyReplace: true }
    );
  });
});
