// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LibraryDetailType } from '@/features/lab/shared/api/lab.api';
import type { CaseDetailModel } from '../../api/cases.api';
import { useCaseDetailsContext } from '../../context/CaseDetailsContext';
import { CaseDetailsLinkedLibrariesTab } from '../CaseDetailsLinkedLibrariesTab';

type UnlinkCallbacks = {
  onSuccess: () => void;
  onError: () => void;
};

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  unlinkMutate: vi.fn(),
  toastError: vi.fn(),
  toastSuccess: vi.fn(),
  isPending: false,
}));

vi.mock('react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ caseOrcabusId: 'cas.01TEST' }),
}));

vi.mock('sonner', () => ({
  toast: {
    error: mocks.toastError,
    success: mocks.toastSuccess,
  },
}));

vi.mock('../../api/cases.api', () => ({
  useCaseExternalEntityCreateModel: () => ({ mutateAsync: vi.fn() }),
  useCaseUnlinkEntityModel: () => ({
    mutate: mocks.unlinkMutate,
    isPending: mocks.isPending,
  }),
}));

vi.mock('../../context/CaseDetailsContext', () => ({
  useCaseDetailsContext: vi.fn(),
}));

vi.mock('@/features/lab/shared/api/lab.api', () => ({
  useQueryMetadataLibraryModel: () => ({
    data: { results: [library] },
    isLoading: false,
    isRefetching: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/components/tables/DataTable', () => ({
  DataTable: ({
    data,
    columns,
  }: {
    data: Array<Record<string, unknown>>;
    columns: Array<{
      key: string;
      header: string;
      render?: (item: Record<string, unknown>) => React.ReactNode;
    }>;
  }) => (
    <table>
      <tbody>
        <tr>
          {columns.map((column) => (
            <td key={column.key}>{column.render?.(data[0])}</td>
          ))}
        </tr>
      </tbody>
    </table>
  ),
}));

const library = {
  orcabusId: 'lib.01TEST',
  libraryId: 'L2400001',
  type: 'wgs',
  phenotype: 'tumour',
  workflow: 'wgs',
  quality: 'good',
} as unknown as LibraryDetailType;

const caseDetail = {
  externalEntitySet: [
    {
      externalEntity: {
        serviceName: 'metadata',
        type: 'library',
        orcabusId: library.orcabusId,
      },
    },
  ],
} as unknown as CaseDetailModel;

const useCaseDetailsContextMock = vi.mocked(useCaseDetailsContext);

function renderTab() {
  return render(<CaseDetailsLinkedLibrariesTab />);
}

function unlinkAction() {
  return screen.getByRole('button', { name: 'Unlink library L2400001' });
}

function confirmAction() {
  return screen.getByRole('button', { name: 'Confirm unlink library L2400001' });
}

function unlinkCallbacks(callIndex: number): UnlinkCallbacks {
  return mocks.unlinkMutate.mock.calls[callIndex]?.[1] as UnlinkCallbacks;
}

afterEach(cleanup);

describe('CaseDetailsLinkedLibrariesTab', () => {
  beforeEach(() => {
    mocks.isPending = false;
    mocks.refresh.mockReset();
    mocks.unlinkMutate.mockReset();
    mocks.toastError.mockReset();
    mocks.toastSuccess.mockReset();
    useCaseDetailsContextMock.mockReturnValue({
      caseDetail,
      isLoadingCaseDetail: false,
      caseStatesData: undefined,
      isLoadingCaseStates: false,
      refresh: mocks.refresh,
    });
  });

  it('requires confirmation and allows cancellation before unlinking a library', async () => {
    const user = userEvent.setup();
    renderTab();

    expect(unlinkAction()).toBeTruthy();

    await user.click(unlinkAction());

    expect(screen.getByRole('heading', { name: 'Unlink Library' })).toBeTruthy();
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Unlink Library' })).toBeNull();
    });
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();

    await user.click(unlinkAction());

    expect(screen.getByRole('heading', { name: 'Unlink Library' })).toBeTruthy();
    expect(mocks.unlinkMutate).not.toHaveBeenCalled();
  });

  it('uses the real unlink submission boundary and keeps the modal open after an error', async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(unlinkAction());
    await user.click(confirmAction());

    expect(mocks.unlinkMutate).toHaveBeenCalledOnce();
    expect(mocks.unlinkMutate.mock.calls[0]?.[0]).toEqual({
      params: {
        path: {
          orcabusId: 'cas.01TEST',
          externalEntityOrcabusId: 'lib.01TEST',
        },
      },
    });

    act(() => {
      unlinkCallbacks(0).onError();
    });

    expect(mocks.toastError).toHaveBeenCalledWith('Failed to unlink library');
    expect(screen.getByRole('heading', { name: 'Unlink Library' })).toBeTruthy();

    await user.click(confirmAction());

    expect(mocks.unlinkMutate).toHaveBeenCalledTimes(2);
  });

  it('refreshes and closes the modal after a successful unlink', async () => {
    const user = userEvent.setup();
    renderTab();

    await user.click(unlinkAction());
    await user.click(confirmAction());
    act(() => {
      unlinkCallbacks(0).onSuccess();
    });

    expect(mocks.toastSuccess).toHaveBeenCalledWith('Library unlinked');
    expect(mocks.refresh).toHaveBeenCalledOnce();
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Unlink Library' })).toBeNull();
    });
  });

  it('passes pending state through to the confirmation controls', async () => {
    const user = userEvent.setup();
    const { rerender } = renderTab();

    await user.click(unlinkAction());
    mocks.isPending = true;
    rerender(<CaseDetailsLinkedLibrariesTab />);

    expect(
      screen
        .getByRole('button', { name: 'Unlink library L2400001', hidden: true })
        .matches(':disabled')
    ).toBe(true);
    expect(screen.getByRole('button', { name: 'Cancel' }).matches(':disabled')).toBe(true);
    expect(confirmAction().matches(':disabled')).toBe(true);
  });
});
